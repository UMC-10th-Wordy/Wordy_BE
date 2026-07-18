import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { PrismaClient, DailyPerformance } from "../../../generated/prisma/client";
import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

import { DashboardRequestDto }from "./dto/api/dashboard.request.dto";
import { DashboardResponseDto }from "./dto/api/dashboard.response.dto";
import { PromptCInputDto }from "./dto/prompt/prompt.c.input.dto";
import { PromptCOutputDto }from "./dto/prompt/prompt.c.output";

export class DashboardService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
    private readonly prisma: PrismaClient,
  ){}

  // 대시보드 생성
  async generateDashboard(
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    // 1. 일주일간 성과 변환 조회
    const performances: DailyPerformance[] =
      await this.prisma.dailyPerformance.findMany({
        where: {
          reflectionSnapshot: {
            dailyEntry: {
              userId: request.userId,
            },
          },
          createdAt: {
            gte: new Date(request.startDate),
            lte: new Date(request.endDate),
          },
        },
      });

    // 2. 최소 생성 조건 확인
    if (performances.length < 3) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "일주일간 성과 변환 3회 이상부터 대시보드를 생성할 수 있습니다.",
      );
    }

    // 3. Dashboard(Prompt C) Input 생성
    const dashboardInput: PromptCInputDto = {
      startDate: request.startDate,
      endDate: request.endDate,

      performances:
        performances.map(
          (performance) => ({
            summary: performance.summary,
            growthInsight: performance.growthInsight,
            nextAction: performance.nextAction,
          })
        ),

      reflections: [],
      tasks: [],
    };

    // 4. Prompt 생성
    const dashboardPrompt =
      this.promptManager.buildDashboardPrompt(
        dashboardInput,
      );

    // 5. LLM 호출
    const dashboardResponse =
      await this.llmClient.generate(
        dashboardPrompt,
      );

    // 6. Parsing
    const dashboardResult =
      this.responseParser.parse<PromptCOutputDto>(
        dashboardResponse,
      );

    // 7. 룰 검증
    this.ruleEngine.validatePromptC(
      dashboardResult,
    );

    // 8. DB 저장
    const dashboard =
      await this.prisma.dashboard.create({
        data: {
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
          summary: dashboardResult.summary,
          journalDays: 0,
          performanceCount: performances.length,
          tagCount: dashboardResult.tagAnalyses.length,
          userId: request.userId,
        },
      });


      // DailyPerformance 연결
      await this.prisma.dashboardPerformance.createMany({
        data: performances.map((performance) => ({
          dashboardId: dashboard.dashboardId,
          dailyPerformanceId: performance.dailyPerformanceId,
        })),
      });


      // KPI 저장
      if (dashboardResult.kpis.length > 0) {
        await this.prisma.dashboardKPI.createMany({
          data: dashboardResult.kpis.map((kpi) => ({
            dashboardId: dashboard.dashboardId,
            kpiName: kpi.kpiName,
            progress: kpi.progress,
          })),
        });
      }


      // Tag Analysis 저장
      if (dashboardResult.tagAnalyses.length > 0) {
        await this.prisma.dashboardTagAnalysis.createMany({
          data: dashboardResult.tagAnalyses.map((analysis) => ({
            dashboardId: dashboard.dashboardId,
            goal: analysis.goal,
            expectedOutcome: analysis.expectedOutcome,
            taskCount: analysis.taskCount,
            achievementStatus: analysis.achievementStatus,
            periodStart: new Date(request.startDate),
            periodEnd: new Date(request.endDate),
          })),
        });
      }


      // Weekly Reflection 저장
      await this.prisma.weeklyReflection.create({
        data: {
          dashboardId: dashboard.dashboardId,
          workSummary:
            dashboardResult.weeklyReflection.workSummary,
          resourcesUsed:
            dashboardResult.weeklyReflection.resourcesUsed,
          learning:
            dashboardResult.weeklyReflection.learning,
        },
      });


      // Dashboard Insight 저장
      await this.prisma.dashboardInsight.create({
        data: {
          dashboardId: dashboard.dashboardId,
          journalDays: 0,
          performanceCount: performances.length,
          tagCount: dashboardResult.tagAnalyses.length,
        },
      });

    // 8. Response 반환
    return {
      dashboardId:dashboard.dashboardId,
      startDate:
        request.startDate,
      endDate:
        request.endDate,
      summary:
        dashboardResult.summary,
      journalDays: 0,
      performanceCount:
        performances.length,
      tagCount: 0,
      kpis:
        dashboardResult.kpis,
      tagAnalyses:
        dashboardResult.tagAnalyses,
      weeklyReflection:
        dashboardResult.weeklyReflection,
    };
  }
}