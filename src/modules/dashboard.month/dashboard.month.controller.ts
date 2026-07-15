import { Controller, Get, Post, Path, Body, Query, Route, Tags } from "tsoa";
import {
  getMonthlyEligibility,
  getMonthlyDashboardList,
  getMonthlyDashboardDetail,
  addMonthlyReflection,
} from "./dashboard.month.service.js";
import {
  MonthlyEligibilityResponse,
  MonthlyDashboardListItem,
  MonthlyDashboardDetail,
  CreateMonthlyReflectionRequest,
} from "./dashboard.month.dto.js";

@Route("dashboards/monthly")
@Tags("MonthlyDashboard")
export class MonthlyDashboardController extends Controller {
  /**
   * 월간 생성 조건 충족 여부 조회
   * @param baseDate 조회할 달의 기준 날짜 (YYYY-MM-DD, 생략 시 이번 달)
   */
  @Get("eligibility")
  public async getEligibility(
    @Query() baseDate?: string
  ): Promise<MonthlyEligibilityResponse> {
    const userId = "test-user-id";
    return getMonthlyEligibility(userId, baseDate);
  }

  /**
   * 월간 대시보드 목록 조회
   */
  @Get()
  public async getList(): Promise<MonthlyDashboardListItem[]> {
    const userId = "test-user-id";
    return getMonthlyDashboardList(userId);
  }

  /**
   * 월간 대시보드 상세 조회
   */
  @Get("{dashboardId}")
  public async getDetail(
    @Path() dashboardId: string
  ): Promise<MonthlyDashboardDetail> {
    const userId = "test-user-id";
    return getMonthlyDashboardDetail(dashboardId, userId);
  }

  /**
   * 월간 회고 작성
   */
  @Post("{dashboardId}/reflection")
  public async createReflection(
    @Path() dashboardId: string,
    @Body() body: CreateMonthlyReflectionRequest
  ): Promise<any> {
    const userId = "test-user-id";
    return addMonthlyReflection(dashboardId, userId, body);
  }
}