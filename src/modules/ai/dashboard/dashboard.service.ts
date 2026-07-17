import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { PrismaClient, DailyPerformance } from "../../../generated/prisma/client";

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

    // 일주일간 성과 변환 조회
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

    // 3회 미만이면 생성 불가
    if (performances.length < 3) {
      throw new Error(
        "일주일간 성과 변환 3회 이상부터 대시보드를 생성할 수 있습니다.",
      );
    }

    // Dashboard Prompt Input 생성
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
    this.ruleEngine.validatePromptC(
      dashboardResult,
    );

    // 8. Response 반환
    return {
      dashboardId:"",
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