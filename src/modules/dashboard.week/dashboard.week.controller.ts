import { Controller, Get, Post, Patch, Path, Body, Query, Route, Tags, Example } from "tsoa";
import {
  getEligibility,
  getDashboardList,
  getDashboardDetail,
  addWeeklyReflection,
  editWeeklyReflection,
} from "./dashboard.week.service.js";
import {
  EligibilityResponse,
  DashboardListItem,
  DashboardDetail,
  CreateWeeklyReflectionRequest,
} from "./dashboard.week.dto.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("dashboards")
@Tags("Dashboard")
export class WeeklyDashboardController extends Controller {
  /**
   * @summary 주간 대시보드 생성 조건 조회
   * @param baseDate 조회할 주의 기준 날짜
   */
  @Get("eligibility")
  @Example<ApiResponse<EligibilityResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      eligible: true,
      journalDays: 4,
      requiredDays: 3,
      weekStart: "2026-06-15",
      weekEnd: "2026-06-21",
      entries: [
        { dailyEntryId: "uuid-1", entryDate: "2026-06-15" },
        { dailyEntryId: "uuid-2", entryDate: "2026-06-16" },
      ],
    },
  })
  public async getEligibility(
    @Query() baseDate?: string
  ): Promise<ApiResponse<EligibilityResponse>> {
    const userId = "test-user-id";
    const data = await getEligibility(userId, baseDate);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 주간 대시보드 목록 조회
   */
  @Get()
  @Example<ApiResponse<DashboardListItem[]>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: [
      {
        dashboardId: "uuid-dashboard-1",
        startDate: "2026-06-15",
        endDate: "2026-06-21",
        summary: "이번 주는 온보딩 리뉴얼에 집중했습니다.",
        createdAt: "2026-06-21T10:00:00.000Z",
      },
    ],
  })
  public async getList(): Promise<ApiResponse<DashboardListItem[]>> {
    const userId = "test-user-id";
    const data = await getDashboardList(userId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 주간 대시보드 상세 조회
   */
  @Get("{dashboardId}")
  @Example<ApiResponse<DashboardDetail>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      dashboardId: "uuid-dashboard-1",
      startDate: "2026-06-15",
      endDate: "2026-06-21",
      summary: "이번 주는 온보딩 리뉴얼에 집중했습니다.",
      journalDays: 4,
      performanceCount: 9,
      tagCount: 3,
      insights: [{ journalDays: 4, performanceCount: 9, tagCount: 3 }],
      kpis: [{ kpiName: "1주차 핵심 액션 도달률", progress: "70% 진척" }],
      tagAnalyses: [
        {
          goal: "온보딩 흐름 단순화",
          expectedOutcome: "이탈 구간 3곳 제거",
          taskCount: 9,
          periodStart: "2026-06-02",
          periodEnd: "2026-06-27",
          achievementStatus: "80% 개선 완료",
        },
      ],
      weeklyReflections: [
        {
          workSummary: "온보딩 와이어프레임 정리",
          resourcesUsed: "인터뷰 데이터",
          learning: "구조화의 중요성",
        },
      ],
      performances: [
        {
          achievementRate: 80,
          summary: "온보딩 개선 완료",
          growthInsight: "사용자 관점 이해도 향상",
          nextAction: "다음 주 테스트 진행",
          items: [{ output: "와이어프레임 12종", impact: "이탈률 감소" }],
        },
      ],
    },
  })
  public async getDetail(
    @Path() dashboardId: string
  ): Promise<ApiResponse<DashboardDetail>> {
    const userId = "test-user-id";
    const data = await getDashboardDetail(dashboardId, userId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 주간 회고 작성
   * @example body {"workSummary": "이번 주 온보딩 리뉴얼 완료", "resourcesUsed": "인터뷰 데이터 분석에 시간 투자", "learning": "사용자 관점의 중요성을 배웠다"}
   */
  @Post("{dashboardId}/reflection")
  @Example<ApiResponse<any>>({
    success: true,
    code: "S201",
    message: "생성에 성공했습니다.",
    result: {
      weeklyReflectionId: "uuid-reflection-1",
      workSummary: "이번 주 온보딩 리뉴얼 완료",
      resourcesUsed: "인터뷰 데이터 분석에 시간 투자",
      learning: "사용자 관점의 중요성을 배웠다",
      createdAt: "2026-06-21T10:00:00.000Z",
    },
  })
  public async createReflection(
    @Path() dashboardId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const userId = "test-user-id";
    const data = await addWeeklyReflection(dashboardId, userId, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }

  /**
   * @summary 주간 회고 수정
   * @example body {"workSummary": "수정된 업무 정리", "learning": "수정된 배운 점"}
   */
  @Patch("{dashboardId}/reflection/{reflectionId}")
  @Example<ApiResponse<any>>({
    success: true,
    code: "S200",
    message: "수정에 성공했습니다.",
    result: {
      weeklyReflectionId: "uuid-reflection-1",
      workSummary: "수정된 업무 정리",
      resourcesUsed: "인터뷰 데이터",
      learning: "수정된 배운 점",
    },
  })
  public async updateReflection(
    @Path() dashboardId: string,
    @Path() reflectionId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const userId = "test-user-id";
    const data = await editWeeklyReflection(dashboardId, reflectionId, userId, body);
    return success(SuccessCode.UPDATED.code, SuccessCode.UPDATED.message, data);
  }
}