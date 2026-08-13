import { Controller, Get, Post, Patch, Path, Body, Query, Route, Tags, Example, Header } from "tsoa";
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
  WeeklyReflection,
} from "./dashboard.week.dto.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { verifyAccessToken } from "../../auth.config.js";

@Route("workspaces/{workspaceId}/dashboards")
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
        { dailyEntryId: "550e8400-e29b-41d4-a716-446655440000", entryDate: "2026-06-15", converted: false },
        { dailyEntryId: "550e8400-e29b-41d4-a716-446655440000", entryDate: "2026-06-16", converted: true },      ],
    },
  })
  public async getEligibility(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Query() baseDate?: string
  ): Promise<ApiResponse<EligibilityResponse>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getEligibility(userId, workspaceId, baseDate);
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
        dashboardId: "550e8400-e29b-41d4-a716-446655440000",
        startDate: "2026-06-15",
        endDate: "2026-06-21",
        summary: "이번 주는 온보딩 리뉴얼에 집중했습니다.",
        createdAt: "2026-06-21T10:00:00.000Z",
      },
    ],
  })
  public async getList(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<DashboardListItem[]>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getDashboardList(userId, workspaceId);
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
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-06-15",
      endDate: "2026-06-21",
      summary: "이번 주 업무 성과 및 회고 요약",
      journalDays: 5,
      performanceCount: 8,
      tagCount: 3,
      completionRate: 85,
      insights: [{ journalDays: 20, performanceCount: 30, tagCount: 5 }],
      kpis: [
        {
          kpiName: "API 성능 개선",
          progress: "80%",
        },
      ],
      tagAnalyses: [
        {
          goal: "백엔드 성능 개선",
          expectedOutcome: "응답 속도 개선",
          taskCount: 5,
          periodStart: "2026-06-15",
          periodEnd: "2026-06-21",
          achievementStatus: "COMPLETED",
          tagId: "550e8400-e29b-41d4-a716-446655440000",
          tagName: "백엔드",
          color: "#4A90E2",
        },
      ],
      weeklyReflections: [
        {
          weeklyReflectionId: "550e8400-e29b-41d4-a716-446655440000",
          workSummary: "주요 기능 개발 완료",
          resourcesUsed: "개발 시간 30시간",
          learning: "Prisma relation 설계 경험",
          createdAt: "2026-08-13T10:00:00.000Z",
        },
      ],
      performances: [
        {
          dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
          achievementRate: 95,
          summary: "JWT 인증 기능 개발 완료",
          growthInsight: {
            insight: "인증 구조 이해도 향상",
          },
          nextAction: {
            action: "Refresh Token 개선 필요",
          },
          items: [
            {
              output: {
                title: "JWT 인증 구현",
              },
              impact: {
                description: "보안성 향상",
              },
            },
          ],
        },
      ],
    },
  })
  public async getDetail(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() dashboardId: string
  ): Promise<ApiResponse<DashboardDetail>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getDashboardDetail(dashboardId, userId, workspaceId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 주간 회고 작성
   * @example body {"workSummary": "이번 주 온보딩 리뉴얼 완료", "resourcesUsed": "인터뷰 데이터 분석", "learning": "사용자 관점의 중요성"}
   */
  @Post("{dashboardId}/reflection")
  public async createReflection(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() dashboardId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await addWeeklyReflection(dashboardId, userId, workspaceId, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }

  
  /**
   * @summary 주간 회고 수정
   * @example body {"workSummary": "수정된 업무 정리", "learning": "수정된 배운 점"}
   */
  @Patch("{dashboardId}/reflection/{reflectionId}")
  @Example<ApiResponse<WeeklyReflection>>({
    success: true,
    code: "S200",
    message: "수정에 성공했습니다.",
    result: {
          weeklyReflectionId: "550e8400-e29b-41d4-a716-446655440000",
          workSummary: "주요 기능 개발 완료",
          resourcesUsed: "개발 시간 30시간",
          learning: "Prisma relation 설계 경험",
          createdAt: "2026-08-13T10:00:00.000Z",
        },
  })
  public async updateReflection(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() dashboardId: string,
    @Path() reflectionId: string,
    @Body() body: CreateWeeklyReflectionRequest
  ): Promise<ApiResponse<any>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await editWeeklyReflection(dashboardId, reflectionId, userId, workspaceId, body);
    return success(SuccessCode.UPDATED.code, SuccessCode.UPDATED.message, data);
  }

  /**
   * @summary 주간 대시보드 생성 (AI)
   * @example body {"startDate": "2026-06-15", "endDate": "2026-06-21"}
   */
  @Post()
  @Example<ApiResponse<DashboardDetail>>({
    success: true,
    code: "S201",
    message: "생성에 성공했습니다.",
    result: {
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-06-15",
      endDate: "2026-06-21",
      summary: "AI가 생성한 이번 주 업무 성과 요약",

      journalDays: 5,
      performanceCount: 8,
      tagCount: 3,

      completionRate: 85,
      insights: [{ journalDays: 20, performanceCount: 30, tagCount: 5 }],

      kpis: [
        {
          kpiName: "API 성능 개선",
          progress: "80%",
        },
      ],

      tagAnalyses: [
        {
          goal: "백엔드 성능 개선",
          expectedOutcome: "응답 속도 개선",
          taskCount: 5,
          periodStart: "2026-06-15",
          periodEnd: "2026-06-21",
          achievementStatus: "COMPLETED",
          tagId: "550e8400-e29b-41d4-a716-446655440000",
          tagName: "백엔드",
          color: "#4A90E2",
        },
      ],

      weeklyReflections: [],

      performances: [
        {
          dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
          achievementRate: 95,
          summary: "JWT 인증 기능 개발 완료",
          growthInsight: {
            insight: "인증 구조 이해도 향상",
          },
          nextAction: {
            action: "Refresh Token 개선 필요",
          },
          items: [
            {
              output: {
                title: "JWT 인증 구현",
              },
              impact: {
                description: "보안성 향상",
              },
            },
          ],
        },
      ],
    },
  })
  public async createDashboard(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Body() body: { startDate: string; endDate: string }
  ): Promise<ApiResponse<any>> {
    const data = await createDashboardWithAI(authorization, workspaceId, body.startDate, body.endDate); 
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, SuccessCode.CREATED.message, data);
  }
}