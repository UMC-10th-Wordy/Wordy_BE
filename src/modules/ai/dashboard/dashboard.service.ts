import { Prisma } from "../../../generated/prisma/client.js";

import { PromptManager } from "../common/prompt.manager.js";
import { LlmClient } from "../common/llm.client.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { PrismaClient, DailyPerformance, PromptType, AiRunStatus } from "../../../generated/prisma/client.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";
import { verifyAccessToken } from "../../../auth.config.js";

import { DashboardRequestDto }from "./dto/api/dashboard.request.dto.js";
import { DashboardResponseDto }from "./dto/api/dashboard.response.dto.js";
import { DashboardKpiInputDto, DashboardTagInputDto, PromptCInputDto, WeeklySummaryCandidateDto }from "./dto/prompt/prompt.c.input.dto.js";
import { PromptCOutputDto }from "./dto/prompt/prompt.c.output.dto.js";
import { PromptDOutputDto } from "./dto/prompt/prompt.d.output.dto.js";
import { PromptDInputDto } from "./dto/prompt/prompt.d.input.dto.js";

type PerformanceItem = {
  output: unknown;
  impact: unknown;
  task: {
    tag: {
      tagName: string;
      projectName: string | null;
      projectPurpose: string | null;
      expectedOutcome: string | null;
      kpis: unknown;
    } | null;
  };
};

type DailyPerformanceWithItems =
  Prisma.DailyPerformanceGetPayload<{
    include: {
      performanceItems: {
        include: {
          task: {
            include: {
              tag: true;
            };
          };
        };
      };
    };
  }>;

export class DashboardService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
    private readonly prisma: PrismaClient,
  ) {}

  private extractUserId(
    authorization: string | undefined,
  ): string {
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }
  }

  // 주간 대시보드 AI 생성
  async generateWeeklyDashboard(
    authorization: string | undefined,
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    const userId = this.extractUserId(authorization);

    // 1. 주간 성과 조회
    const performances =
      await this.prisma.dailyPerformance.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(request.startDate),
            lte: new Date(request.endDate),
          },
        },
        include: {
          performanceItems: {
            include: {
              task: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      });

    // 2. Prompt C Input 생성
    const promptCInput: PromptCInputDto = {
      startDate: request.startDate,
      endDate: request.endDate,

      // 주간 핵심 성과 후보
      weeklySummaryCandidates:
        this.createWeeklySummaryCandidates(
          performances,
        ),

      // 태그별 분석 데이터
      tagAnalyses:
        this.createTagAnalysisInput(
          performances,
        ),

      // KPI 진행 데이터
      kpiProgress:
        this.createKpiInput(
          performances,
        ),
    };

    // 3. Prompt 생성
    const promptRequest =
      this.promptManager.buildPromptC(
        promptCInput,
      );

    // 4. LLM 호출
    const promptResponse =
      await this.llmClient.generate(
        promptRequest,
      );

    // 5. AIRun 저장
    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.PROMPT_C,
        promptVersion: "v1",
        request: JSON.parse(JSON.stringify(promptRequest)),
        response: promptResponse,
        status: AiRunStatus.SUCCESS,
      },
    });

    // 6. Parsing
    const dashboardResult =
      this.responseParser.parse<PromptCOutputDto>(
        promptResponse,
      );

    // 7. Rule 검증
    this.ruleEngine.validatePromptC(
      dashboardResult,
    );

    // 12. Response 반환
    return {
      dashboardId: "",
      startDate: request.startDate,
      endDate: request.endDate,
      summary: dashboardResult.summary,
      journalDays: performances.length,
      performanceCount: performances.length,
      tagCount: dashboardResult.tagAnalyses.length,
      kpis:
        dashboardResult.kpis.map(
          (kpi) => ({
            kpiName: kpi.kpiName,
            progress: kpi.progress,
          }),
        ),
      tagAnalyses:
        dashboardResult.tagAnalyses.map(
          (analysis) => ({
            tagName: analysis.tagName,
            objective: analysis.objective,
            expectedOutcome: analysis.expectedOutcome,
            achievementStatus: analysis.achievementStatus,
            insight: analysis.insight,
          }),
        ),
    };
  }

  // 주간 핵심 성과 후보 생성
  private createWeeklySummaryCandidates(
    performances: DailyPerformanceWithItems[],
  ): WeeklySummaryCandidateDto[] {

    return performances.map(
      (performance) => ({
        performanceId: performance.dailyPerformanceId,
        summary: performance.summary,
        items: performance.performanceItems.map(
          (item: PerformanceItem) => ({
            output: String(item.output),
            impact: String(item.impact),
          }),
        ),
        achievementRate: performance.achievementRate,
      }),
    );
  }

  // 태그별 Prompt C Input 생성
  private createTagAnalysisInput(
    performances: DailyPerformanceWithItems[],
  ): DashboardTagInputDto[] {
    const tagMap =
      new Map<string, DashboardTagInputDto>();

    performances.forEach(
      (performance) => {
        performance.performanceItems.forEach(
          (item: PerformanceItem) => {
            const tag = item.task.tag;
            const tagName = tag?.tagName ?? "기타";

            if (!tagMap.has(tagName)) {
              tagMap.set(
                tagName,
                {
                  tagName,
                  projectName: tag?.projectName ?? "",
                  projectPurpose: tag?.projectPurpose ?? "",
                  expectedOutcome: tag?.expectedOutcome ?? "",
                  performances: [],
                  kpis:
                    Array.isArray(tag?.kpis)
                      ? tag.kpis as string[]
                      : [],
                },
              );
            }
            tagMap
              .get(tagName)!
              .performances.push({
                output: String(item.output),
                impact: String(item.impact),
              });
          },
        );
      },
    );
    return Array.from(tagMap.values());
  }

  // KPI Prompt C Input 생성
  private createKpiInput(
    performances: DailyPerformanceWithItems[],
  ): DashboardKpiInputDto[] {

    const kpiMap =
      new Map<string, DashboardKpiInputDto>();

    performances.forEach(
      (performance) => {
        performance.performanceItems.forEach(
          (item: PerformanceItem) => {
            const tag = item.task.tag;

            const kpis =
              Array.isArray(tag?.kpis)
                ? tag.kpis as {
                    name:string;
                    target:string;
                  }[]
                : [];

            kpis.forEach(
              (kpi) => {
                if (!kpiMap.has(kpi.name)) {
                  kpiMap.set(
                    kpi.name,
                    {
                      kpiName: kpi.name,
                      target: kpi.target,
                      relatedPerformances: [],
                    },
                  );
                }
                kpiMap
                  .get(kpi.name)!
                  .relatedPerformances
                  .push({
                    output: String(item.output),
                    impact: String(item.impact),
                  });
              },
            );
          },
        );
      },
    );

    return Array.from(kpiMap.values());
  }

  // 월간 대시보드 AI 생성
  async generateMonthlyDashboard(
    authorization: string | undefined,
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    const userId = this.extractUserId(authorization);

    // 1. 주간 대시보드 조회
    const weeklyDashboards =
      await this.prisma.dashboard.findMany({
        where:{
          userId,
          startDate:{
            gte:new Date(request.startDate),
          },
          endDate:{
            lte:new Date(request.endDate),
          },
        },
        include:{
          kpis:true,
          tagAnalyses:true,
          weeklyReflections:true,
        },
      });

    if(weeklyDashboards.length === 0){
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "월간 대시보드를 생성할 주간 데이터가 없습니다.",
      );
    }

    // 2. Prompt D Input 생성
    const promptDInput:PromptDInputDto = {
      startDate: request.startDate,
      endDate: request.endDate,
      weeklyDashboards:
        weeklyDashboards.map(
          (dashboard: typeof weeklyDashboards[number])=>({
            dashboardId: dashboard.dashboardId,
            startDate: dashboard.startDate.toISOString(),
            endDate: dashboard.endDate.toISOString(),
            summary: dashboard.summary,
            kpis:
              dashboard.kpis.map(
                (kpi) => ({
                  kpiName: kpi.kpiName ?? "",
                  progress: kpi.progress ?? "",
                }),
              ),
            tagAnalyses:
            dashboard.tagAnalyses.map(
              (tag)=>({
                goal: tag.goal ?? "",
                expectedOutcome: tag.expectedOutcome ?? "",
                achievementStatus: tag.achievementStatus ?? "",
              }),
            ),
            weeklyReflection:
              dashboard.weeklyReflections[0]
                ? {
                    workSummary:
                      dashboard.weeklyReflections[0].workSummary ?? "",
                    resourcesUsed:
                      dashboard.weeklyReflections[0].resourcesUsed ?? "",
                    learning:
                      dashboard.weeklyReflections[0].learning ?? "",
                  }
                : undefined,
          }),
        ),
    };

    // 3. Prompt 생성
    const promptRequest =
      this.promptManager.buildPromptD(
        promptDInput,
      );

    // 4. LLM
    const promptResponse =
      await this.llmClient.generate(
        promptRequest,
      );

    // 5. AIRun 저장
    await this.prisma.aIRun.create({
      data:{
        promptType:PromptType.PROMPT_D,
        promptVersion:"v1",
        request: JSON.parse(JSON.stringify(promptRequest)),
        response:promptResponse,
        status:AiRunStatus.SUCCESS,
      },
    });

    // 6. Parsing
    const monthlyResult =
      this.responseParser.parse<PromptDOutputDto>(
        promptResponse,
      );

    this.ruleEngine.validatePromptD(
      monthlyResult,
    );

    return {
      dashboardId: "",
      startDate: request.startDate,
      endDate: request.endDate,
      summary: monthlyResult.summary,
      journalDays:0,
      performanceCount: weeklyDashboards.length,
      tagCount: monthlyResult.tagAnalyses.length,
      kpis:
        monthlyResult.kpis.map(
          (kpi)=>({
            kpiName:kpi.kpiName,
            progress:kpi.progress,
          }),
        ),
      tagAnalyses:
        monthlyResult.tagAnalyses.map(
          (tag)=>({
            tagName:tag.tagName,
            objective:"",
            expectedOutcome:"",
            achievementStatus: tag.achievementStatus,
            insight: tag.insight,
          }),
        ),
    };
  }
}
