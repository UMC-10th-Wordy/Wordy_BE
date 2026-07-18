import { Controller, Get, Post, Patch, Path, Body, Query, Route, Tags, Example } from "tsoa";
import {
  getEligibility,
  getDashboardList,
  getDashboardDetail,
  addWeeklyReflection,
  editWeeklyReflection,
  createDashboardWithAI,
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
export class DashboardController extends Controller {
  /**
   * @summary 주간 대시보드 생성 조건 조회
   * @param baseDate 조회할 주의 기준 날짜 (YYYY-MM-DD, 생략 시 이번 주)
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
  public async getDetail(
    @Path() dashboardId: string
  ): Promise<ApiResponse<DashboardDetail>> {
    const userId = "test-user-id";
    const data = await getDashboardDetail(dashboardId, userId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 주간 회고 작성
   * @example body {"workSummary": "이번 주 온보딩 리뉴얼 완료", "resourcesUsed": "인터뷰 데이터 분석", "learning": "사용자 관점의 중요성"}
   */
  @Post("{dashboardId}/reflection")
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
  public async updateReflection(
    @Path() dashboardId: string,
    @Path() reflectionId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const userId = "test-user-id";
    const data = await editWeeklyReflection(dashboardId, reflectionId, userId, body);
    return success(SuccessCode.UPDATED.code, SuccessCode.UPDATED.message, data);
  }

  /**
   * @summary 주간 대시보드 생성 (AI)
   * @example body {"startDate": "2026-06-15", "endDate": "2026-06-21"}
   */
  @Post()
  public async createDashboard(
    @Body() body: { startDate: string; endDate: string }
  ): Promise<ApiResponse<any>> {
    const userId = "test-user-id";
    const data = await createDashboardWithAI(userId, body.startDate, body.endDate);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }
}