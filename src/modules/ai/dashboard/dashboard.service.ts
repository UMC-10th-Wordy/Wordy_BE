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
      tagId: string;
      tagName: string;
      color: string | null;
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
          dailyEntry: {
            entryDate: {
              gte: new Date(request.startDate),
              lte: new Date(request.endDate),
            },
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

    // 기존 대시보드 존재 시 하위데이터 삭제
    const existingDashboard =
      await this.prisma.dashboard.findFirst({
        where: {
          userId,
          type: "WEEKLY",
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
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

    const tagInfoMap = new Map(
      promptCInput.tagAnalyses.map((tag) => [
        tag.tagId,
        tag,
      ]),
    );

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

    // 8. Dashboard 저장
    const dashboard = await this.prisma.$transaction(
      async (tx) => {
        let dashboardId: string;

        if (existingDashboard) {
          // 기존 Dashboard의 하위 데이터 삭제
          await tx.dashboardPerformance.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          await tx.dashboardKPI.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          await tx.dashboardInsight.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          await tx.dashboardTagAnalysis.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          dashboardId = existingDashboard.dashboardId;
        } else {
          // 새 Dashboard ID 생성
          dashboardId = crypto.randomUUID();
        }

        // 기존 Dashboard면 update,
        // 없으면 create
        const dashboard = existingDashboard
          ? await tx.dashboard.update({
              where: {
                dashboardId,
              },
              data: {
                summary: dashboardResult.summary,
                journalDays: performances.length,
                performanceCount: performances.length,
                tagCount: dashboardResult.tagAnalyses.length,
              },
            })
          : await tx.dashboard.create({
              data: {
                dashboardId,
                userId,
                type: "WEEKLY",
                startDate: new Date(request.startDate),
                endDate: new Date(request.endDate),

                summary: dashboardResult.summary,

                journalDays: performances.length,
                performanceCount: performances.length,
                tagCount: dashboardResult.tagAnalyses.length,
              },
            });

        // 공통 하위 데이터 생성
        await tx.dashboardPerformance.createMany({
          data: performances.map((performance) => ({
            dashboardId,
            dailyPerformanceId:
              performance.dailyPerformanceId,
          })),
        });

        await tx.dashboardKPI.createMany({
          data: dashboardResult.kpis.map((kpi) => ({
            dashboardId,
            kpiName: kpi.kpiName,
            progress: kpi.progress,
          })),
        });

        await tx.dashboardInsight.create({
          data: {
            dashboardId,
            journalDays: performances.length,
            performanceCount: performances.length,
            tagCount: dashboardResult.tagAnalyses.length,
          },
        });

        await tx.dashboardTagAnalysis.createMany({
          data: dashboardResult.tagAnalyses.map((tag) => {
            const tagInfo = tagInfoMap.get(tag.tagId);

            return {
              dashboardId,

              tagId: tagInfo?.tagId ?? "",
              tagName: tagInfo?.tagName ?? "",
              color: tagInfo?.color ?? "",

              goal: tag.objective,
              expectedOutcome: tag.expectedOutcome,
              achievementStatus: tag.achievementStatus,
              insight: tag.insight,

              taskCount: null,
              periodStart: new Date(request.startDate),
              periodEnd: new Date(request.endDate),
            };
          }),
        });

        return dashboard;
      },
    );

    // 12. Response 반환
    return {
      dashboardId: dashboard.dashboardId,
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
        dashboardResult.tagAnalyses.map((analysis) => {
          const tagInfo = tagInfoMap.get(analysis.tagId);

          return {
            tagId: tagInfo?.tagId ?? "",
            tagName: analysis.tagName,
            color: tagInfo?.color ?? "",

            objective: analysis.objective,
            expectedOutcome: analysis.expectedOutcome,
            achievementStatus: analysis.achievementStatus,
            insight: analysis.insight,
          };
        }),
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
            
            const tagId = tag?.tagId ?? "";
            const tagName = tag?.tagName ?? "기타";
            const color = tag?.color ?? "";

            if (!tagMap.has(tagId)) {
              tagMap.set(
                tagId,
                {
                  tagId,
                  tagName,
                  color,
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
              .get(tagId)!
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
          type:"WEEKLY",
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
                (tag) => ({
                  tagId: tag.tagId ?? "",
                  tagName: tag.tagName ?? "",
                  color: tag.color ?? "",

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

    const tagInfoMap = new Map(
      weeklyDashboards.flatMap((dashboard) =>
        dashboard.tagAnalyses.map((tag) => [
          tag.tagId,
          {
            tagId: tag.tagId,
            tagName: tag.tagName,
            color: tag.color,
          },
        ]),
      ),
    );

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

    // 7. Rule 검증
    this.ruleEngine.validatePromptD(
      monthlyResult,
    );

    // 기존 월간 대시보드 조회
    const existingDashboard =
      await this.prisma.dashboard.findFirst({
        where: {
          userId,
          type: "MONTHLY",
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
        },
      });

    // 8. Dashboard 저장
    const dashboard = await this.prisma.$transaction(
      async (tx) => {
        let dashboard;

        if (existingDashboard) {
          // 기존 Dashboard의 하위 데이터 삭제
          await tx.dashboardKPI.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          await tx.dashboardInsight.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          await tx.dashboardTagAnalysis.deleteMany({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
          });

          // 기존 Dashboard 본체 갱신
          dashboard = await tx.dashboard.update({
            where: {
              dashboardId: existingDashboard.dashboardId,
            },
            data: {
              summary: monthlyResult.summary,
              journalDays: 0,
              performanceCount: weeklyDashboards.length,
              tagCount: monthlyResult.tagAnalyses.length,
            },
          });
        } else {
          // 기존 Dashboard가 없으면 새로 생성
          dashboard = await tx.dashboard.create({
            data: {
              userId,
              type: "MONTHLY",

              startDate: new Date(request.startDate),
              endDate: new Date(request.endDate),

              summary: monthlyResult.summary,

              journalDays: 0,
              performanceCount: weeklyDashboards.length,
              tagCount: monthlyResult.tagAnalyses.length,
            },
          });
        }

        // 공통 하위 데이터 생성
        await tx.dashboardKPI.createMany({
          data: monthlyResult.kpis.map((kpi) => ({
            dashboardId: dashboard.dashboardId,
            kpiName: kpi.kpiName,
            progress: kpi.progress,
          })),
        });

        await tx.dashboardInsight.create({
          data: {
            dashboardId: dashboard.dashboardId,
            journalDays: 0,
            performanceCount: weeklyDashboards.length,
            tagCount: monthlyResult.tagAnalyses.length,
          },
        });

        await tx.dashboardTagAnalysis.createMany({
          data: monthlyResult.tagAnalyses.map((tag) => {
            const tagInfo = tagInfoMap.get(tag.tagId);

            return {
              dashboardId: dashboard.dashboardId,

              tagId: tagInfo?.tagId ?? "",
              tagName: tagInfo?.tagName ?? "",
              color: tagInfo?.color ?? "",

              goal: null,
              expectedOutcome: null,
              achievementStatus: tag.achievementStatus,
              insight: tag.insight,

              periodStart: new Date(request.startDate),
              periodEnd: new Date(request.endDate),
            };
          }),
        });

        return dashboard;
      });

      // 9. Response 반환
      return {
        dashboardId: dashboard.dashboardId,
        startDate: request.startDate,
        endDate: request.endDate,
        summary: monthlyResult.summary,
        journalDays: 0,
        performanceCount: weeklyDashboards.length,
        tagCount: monthlyResult.tagAnalyses.length,

        kpis: monthlyResult.kpis.map(
          (kpi) => ({
            kpiName: kpi.kpiName,
            progress: kpi.progress,
          }),
        ),

        tagAnalyses: monthlyResult.tagAnalyses.map((tag) => {
          const tagInfo = tagInfoMap.get(tag.tagId);

          return {
            tagId: tagInfo?.tagId ?? "",
            tagName: tag.tagName,
            color: tagInfo?.color ?? "",

            objective: "",
            expectedOutcome: "",
            achievementStatus: tag.achievementStatus,
            insight: tag.insight,
          };
        }),
      };
  }
}
