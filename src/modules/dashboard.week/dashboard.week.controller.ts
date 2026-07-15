import { Controller, Get, Post, Patch, Path, Body, Query, Route, Tags } from "tsoa";
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

@Route("dashboards")
@Tags("Dashboard")
export class DashboardController extends Controller {
/**
   * 생성 조건 충족 여부 조회
   * @param baseDate 조회할 주의 기준 날짜 (YYYY-MM-DD, 생략 시 이번 주)
   */
  @Get("eligibility")
  public async getEligibility(
    @Query() baseDate?: string
  ): Promise<EligibilityResponse> {
    const userId = "test-user-id";
    return getEligibility(userId, baseDate);
  }

  /**
   * 목록 조회
   */
  @Get()
  public async getList(): Promise<DashboardListItem[]> {
    const userId = "test-user-id";
    return getDashboardList(userId);
  }

  /**
   * 대시보드 상세 조회
   */
  @Get("{dashboardId}")
  public async getDetail(
    @Path() dashboardId: string
  ): Promise<DashboardDetail> {
    const userId = "test-user-id";
    return getDashboardDetail(dashboardId, userId);
  }

  /**
   * 주간 회고 작성
   */
  @Post("{dashboardId}/reflection")
  public async createReflection(
    @Path() dashboardId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<any> {
    const userId = "test-user-id";
    return addWeeklyReflection(dashboardId, userId, body);
  }

  //회고 수정
  @Patch("{dashboardId}/reflection/{reflectionId}")
  public async updateReflection(
    @Path() dashboardId: string,
    @Path() reflectionId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<any> {
    const userId = "test-user-id";
    return editWeeklyReflection(dashboardId, reflectionId, userId, body);
  }

}

