import { Controller, Get, Post, Path, Body, Query, Route, Tags, Example, Header } from "tsoa";
import {
  getMonthlyEligibility,
  getMonthlyDashboardList,
  getMonthlyDashboardDetail,
  addMonthlyReflection,
  createMonthlyDashboardWithAI,
} from "./dashboard.month.service.js";
import {
  MonthlyEligibilityResponse,
  MonthlyDashboardListItem,
  MonthlyDashboardDetail,
  CreateMonthlyReflectionRequest,
  MonthlyReflectionItem,
} from "./dashboard.month.dto.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("dashboards/monthly")
@Tags("MonthlyDashboard")
export class MonthlyDashboardController extends Controller {
  /**
   * @summary 월간 대시보드 생성 조건 조회
   * @param baseDate 조회할 달의 기준 날짜 (YYYY-MM-DD, 생략 시 이번 달)
   */
  @Get("eligibility")
  @Example<ApiResponse<MonthlyEligibilityResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      eligible: true,
      weeklyDashboardCount: 4,
      requiredCount: 3,
      monthStart: "2026-06-01",
      monthEnd: "2026-06-30",
      weeklyDashboards: [
        {
          dashboardId: "uuid-week-1",
          startDate: "2026-06-01",
          endDate: "2026-06-07",
          summary: "1주차: 온보딩 리뉴얼 착수",
        },
        {
          dashboardId: "uuid-week-2",
          startDate: "2026-06-08",
          endDate: "2026-06-14",
          summary: "2주차: 프로토타입 진행",
        },
      ],
    },
  })
  public async getEligibility(
    @Query() baseDate?: string
  ): Promise<ApiResponse<MonthlyEligibilityResponse>> {
    const userId = "test-user-id";
    const data = await getMonthlyEligibility(userId, baseDate);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 월간 대시보드 목록 조회
   */
  @Get()
  @Example<ApiResponse<MonthlyDashboardListItem[]>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: [
      {
        dashboardId: "uuid-month-1",
        startDate: "2026-06-01",
        endDate: "2026-06-30",
        summary: "6월은 온보딩 개선에 집중한 달이었습니다.",
        createdAt: "2026-06-30T10:00:00.000Z",
      },
    ],
  })
  public async getList(): Promise<ApiResponse<MonthlyDashboardListItem[]>> {
    const userId = "test-user-id";
    const data = await getMonthlyDashboardList(userId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 월간 대시보드 상세 조회
   */
  @Get("{dashboardId}")
  @Example<ApiResponse<MonthlyDashboardDetail>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      dashboardId: "uuid-month-1",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      summary: "6월은 온보딩 개선에 집중한 달이었습니다.",
      journalDays: 20,
      performanceCount: 30,
      tagCount: 5,
      insights: [{ journalDays: 20, performanceCount: 30, tagCount: 5 }],
      kpis: [{ kpiName: "월간 핵심 목표 달성률", progress: "85% 달성" }],
      tagAnalyses: [
        {
          goal: "온보딩 전면 개선",
          expectedOutcome: "이탈률 30% 감소",
          taskCount: 30,
          periodStart: "2026-06-01",
          periodEnd: "2026-06-30",
          achievementStatus: "목표 초과 달성",
        },
      ],
      weeklyReflections: [
        {
          workSummary: "6월 온보딩 리뉴얼 완료",
          resourcesUsed: "사용자 인터뷰, 로그 분석",
          learning: "데이터 기반 의사결정의 중요성",
        },
      ],
      performances: [
        {
          achievementRate: 85,
          summary: "월간 목표 대부분 달성",
          growthInsight: "팀 협업 효율 향상",
          nextAction: "다음 달 확장 작업 준비",
          items: [{ output: "온보딩 전면 개편", impact: "이탈률 30% 감소" }],
        },
      ],
    },
  })
  public async getDetail(
    @Path() dashboardId: string
  ): Promise<ApiResponse<MonthlyDashboardDetail>> {
    const userId = "test-user-id";
    const data = await getMonthlyDashboardDetail(dashboardId, userId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 월간 회고 작성
   * @example body {"workSummary": "6월 한 달간 온보딩 리뉴얼 완료", "resourcesUsed": "사용자 인터뷰와 로그 데이터 분석", "learning": "데이터 기반 의사결정의 중요성을 배웠다"}
   */
  @Post("{dashboardId}/reflection")
  @Example<ApiResponse<MonthlyReflectionItem>>({
    success: true,
    code: "S201",
    message: "생성에 성공했습니다.",
    result: {
      workSummary: "6월 한 달간 온보딩 리뉴얼 완료",
      resourcesUsed: "사용자 인터뷰와 로그 데이터 분석",
      learning: "데이터 기반 의사결정의 중요성을 배웠다",
    },
  })
  public async createReflection(
    @Path() dashboardId: string,
    @Body() body: CreateMonthlyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const userId = "test-user-id";
    const data = await addMonthlyReflection(dashboardId, userId, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }

  /**
   * @summary 월간 대시보드 생성 (AI)
   * @example body {"startDate": "2026-06-01", "endDate": "2026-06-30"}
   */
  @Post()
  @Example<ApiResponse<MonthlyDashboardDetail>>({
    success: true,
    code: "S201",
    message: "생성에 성공했습니다.",
    result: {
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      summary: "AI가 생성한 6월 월간 업무 성과 요약",

      journalDays: 20,
      performanceCount: 30,
      tagCount: 5,

      insights: [
        {
          journalDays: 20,
          performanceCount: 30,
          tagCount: 5,
        },
      ],

      kpis: [
        {
          kpiName: "월간 핵심 목표 달성률",
          progress: "85%",
        },
      ],

      tagAnalyses: [
        {
          goal: "온보딩 전면 개선",
          expectedOutcome: "사용자 경험 향상",
          taskCount: 30,
          periodStart: "2026-06-01",
          periodEnd: "2026-06-30",
          achievementStatus: "COMPLETED",
        },
      ],

      weeklyReflections: [
        {
          workSummary: "6월 주요 업무 정리",
          resourcesUsed: "사용자 인터뷰 및 로그 분석",
          learning: "데이터 기반 의사결정 경험",
        },
      ],

      performances: [
        {
          achievementRate: 85,
          summary: "월간 목표 대부분 달성",
          growthInsight: {
            insight: "팀 협업 효율 향상",
          },
          nextAction: {
            action: "다음 달 확장 작업 준비",
          },
          items: [
            {
              output: {
                title: "온보딩 전면 개편",
              },
              impact: {
                description: "사용자 경험 개선",
              },
            },
          ],
        },
      ],
    },
  })
  public async createDashboard(
    @Header("Authorization") authorization: string | undefined,
    @Body() body: { startDate: string; endDate: string }
  ): Promise<ApiResponse<any>> {
    const data = await createMonthlyDashboardWithAI(authorization, body.startDate, body.endDate);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }
}