import { Body, Controller, Example, Post, Route, Tags } from "tsoa";

import { prisma } from "../../../common/prisma/prisma.client";
import { LlmClient } from "../common/llm.client";
import { PromptManager } from "../common/prompt.manager";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { DashboardRequestDto } from "./dto/api/dashboard.request.dto";
import { DashboardResponseDto } from "./dto/api/dashboard.response.dto";
import { DashboardService } from "./dashboard.service";

@Route("api/v1/ai")
@Tags("AI")
export class DashboardAiController extends Controller {
  private readonly dashboardService: DashboardService;

  constructor() {
    super();
    this.dashboardService = new DashboardService(
      new LlmClient(),
      new PromptManager(),
      new ResponseParser(),
      new RuleEngine(),
      prisma,
    );
  }

  /**
   * @summary 주간 대시보드 생성
   */
  @Post("dashboard")
  @Example<DashboardRequestDto>({
    userId: "550e8400-e29b-41d4-a716-446655440000",
    startDate: "2026-07-07",
    endDate: "2026-07-13"
  })
  @Example<DashboardResponseDto>({
    dashboardId: "dashboard-01",
    startDate: "2026-07-07",
    endDate: "2026-07-13",
    summary: "이번 주에는 AI 기능과 Swagger 문서화를 완료했습니다.",
    journalDays: 7,
    performanceCount: 12,
    tagCount: 3,
    kpis: [
      {
        kpiName: "Swagger 문서 작성",
        progress: "100%"
      }
    ],
    tagAnalyses: [
      {
        goal: "AI 기능 구현",
        expectedOutcome: "성과 미리보기 기능 완성",
        taskCount: 8,
        achievementStatus: "달성"
      }
    ],
    weeklyReflection: {
      workSummary: "AI 기능 개발",
      resourcesUsed: "OpenAI API, Prisma",
      learning: "Prompt 설계와 응답 파싱을 익혔다."
    }
  })
  public async createDashboard(
    @Body() request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.generateDashboard(
      request,
    );
  }
}