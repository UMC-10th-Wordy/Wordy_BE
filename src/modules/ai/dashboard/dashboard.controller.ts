console.log("dashboard.controller.ts loaded");

import { Body, Controller, Example, Header, Path, Post, Route, Tags } from "tsoa";

import { prisma } from "../../../common/prisma/prisma.client.js";
import { LlmClient } from "../common/llm.client.js";
import { PromptManager } from "../common/prompt.manager.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { DashboardRequestDto } from "./dto/api/dashboard.request.dto.js";
import { DashboardResponseDto } from "./dto/api/dashboard.response.dto.js";
import { DashboardService } from "./dashboard.service.js";
import { ApiResponse } from "../../../common/responses/api.response.js";
import { success } from "../../../common/responses/response.js";
import { SuccessCode } from "../../../common/responses/success.code.js";

@Route("ai/workspaces/{workspaceId}/dashboard")
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
  @Post("weekly")
  @Example<ApiResponse<DashboardResponseDto>>({
    success: true,
    code: "S200",
    message: "주간 대시보드 생성에 성공했습니다.",
    result: {
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-07-07",
      endDate: "2026-07-13",

      summary:
        "이번 주에는 AI 성과 분석 기능과 Swagger 문서화를 완료했습니다.",

      journalDays: 7,
      performanceCount: 12,
      tagCount: 3,

      kpis: [
        {
          kpiName: "Swagger API 문서 작성",
          progress: "100%",
        },
        {
          kpiName: "AI 기능 구현",
          progress: "80%",
        },
      ],

      tagAnalyses: [
        {
          tagId: "550e8400-e29b-41d4-a716-446655440000",
          tagName: "AI 기능 구현",
          color: "#4F46E5",
          objective: "업무 성과를 분석하고 시각화하는 AI 기능 개발",
          expectedOutcome: "사용자가 자신의 업무 성과를 확인할 수 있음",
          achievementStatus: "COMPLETED",
          insight:
            "AI 기반 업무 분석 기능을 구현하고 성과 정리를 완료했습니다.",
          taskCount: 3,
        },
      ],
    },
  })
  public async createDashboard(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Body() request: DashboardRequestDto,
  ): Promise<ApiResponse<DashboardResponseDto>> {
    const result =
      await this.dashboardService.generateWeeklyDashboard(
        authorization,
        workspaceId,
        request,
      );

    return success(
      SuccessCode.OK.code,
      "주간 대시보드 생성에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary 월간 대시보드 생성
   */
  @Post("monthly")
  @Example<ApiResponse<DashboardResponseDto>>({
    success: true,
    code: "S200",
    message: "월간 대시보드 생성에 성공했습니다.",
    result: {
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-07-01",
      endDate: "2026-07-31",

      summary:
        "이번 달에는 AI 기능 개발과 업무 관리 시스템 개선을 중심으로 성장했습니다.",

      journalDays: 20,
      performanceCount: 4,
      tagCount: 2,

      kpis: [
        {
          kpiName: "AI 기능 개발 완료율",
          progress: "90%",
        },
        {
          kpiName: "주간 회고 작성률",
          progress: "100%",
        },
      ],

      tagAnalyses: [
        {
          tagId: "550e8400-e29b-41d4-a716-446655440001",
          tagName: "AI 개발",
          color: "#22C55E",
          objective: "AI 기반 업무 분석 시스템 구축",
          expectedOutcome:
            "사용자가 업무 성과를 정리하고 확인할 수 있음",
          achievementStatus: "달성",
          insight:
            "주간 성과 데이터를 기반으로 월간 성장 흐름을 분석했습니다.",
          taskCount: 3,
        },
        {
          tagId: "550e8400-e29b-41d4-a716-446655440002",
          tagName: "백엔드 개발",
          color: "#F59E0B",
          objective: "안정적인 API 구조 설계",
          expectedOutcome:
            "서비스의 원활한 API 연동",
          achievementStatus: "IN_PROGRESS",
          insight:
            "API 구조 개선과 코드 안정화 작업을 진행했습니다.",
          taskCount: 3,
        },
      ],
    },
  })
  public async createMonthlyDashboard(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Body() request: DashboardRequestDto,
  ): Promise<ApiResponse<DashboardResponseDto>> {
    const result =
      await this.dashboardService.generateMonthlyDashboard(
        authorization,
        workspaceId,
        request,
      );

    return success(
      SuccessCode.OK.code,
      "월간 대시보드 생성에 성공했습니다.",
      result,
    );
  }
}