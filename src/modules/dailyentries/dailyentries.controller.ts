import { Controller, Get, Delete, Path, Query, Route, Tags, Example, Header } from "tsoa";
import {
  getDailyEntriesSummary,
  getMonthlyList,
  getMonthlyEntries,
  getDailyEntryByDate,
  getDailyEntriesDetail,
  removeDailyEntry,
  searchDailyEntries,
} from "./dailyentries.service.js";
import {
  DailyEntriesSummaryResponse,
  MonthlyRecordItem,
  DailyRecordItem,
  DailyEntryByDateResponse,
  DailyEntriesDetailResponse,
  DailyEntriesSearchResponse,
} from "./dailyentries.dto.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { verifyAccessToken } from "../../auth.config.js";

@Route("workspaces/{workspaceId}/daily-entries")
@Tags("DailyEntries")
export class DailyEntriesController extends Controller {
  /**
   * @summary 나의 요약 (상단 카드 3개)
   */
  @Get("summary")
  @Example<ApiResponse<DailyEntriesSummaryResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      monthlyCount: { count: 4, diffFromLastMonth: 2 },
      streak: { currentStreak: 12, maxStreak: 21 },
      topCategory: { tagName: "온보딩 리뉴얼", color: "#7C3AED", percentage: 38 },
    },
  })
  public async getSummary(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<DailyEntriesSummaryResponse>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
    throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getDailyEntriesSummary(userId, workspaceId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 월별 기록 목록 (접힌 상태)
   */
  @Get("monthly")
  @Example<ApiResponse<MonthlyRecordItem[]>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: [
      {
        yearMonth: "2026-08",
        year: 2026,
        month: 8,
        totalDays: 5,
        tags: [
          { tagName: "광고", color: "#F59E0B" },
          { tagName: "회의", color: "#3B82F6" },
          { tagName: "디자인", color: "#EC4899" },
        ],
        summary: "광고, 회의, 디자인 중심으로 총 5일의 기록을 남긴 달이에요.",
      },
    ],
  })
  public async getMonthly(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<MonthlyRecordItem[]>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
    throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getMonthlyList(userId, workspaceId);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 월별 일자 목록 (월 펼쳤을 때)
   * @param yearMonth 조회할 연월 (YYYY-MM)
   */
  @Get("monthly/{yearMonth}")
  @Example<ApiResponse<DailyRecordItem[]>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: [
      {
        dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
        workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
        entryDate: "2026-08-21",
        day: 21,
        tags: [{ tagName: "회의", color: "#3B82F6" }],
        mainTaskTitle: "Product Strategy Alignment 회의 준비",
        extraTaskCount: 7,
        summary: "회의 준비와 디자인 시스템 V2 정리를 병행한 날이에요.",
        converted: false,
      },
    ],
  })
  public async getMonthlyEntries(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() yearMonth: string
    ): Promise<ApiResponse<DailyRecordItem[]>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await getMonthlyEntries(userId, workspaceId, yearMonth);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }

  /**
   * @summary 일지 검색
   * @param query 검색어 (업무 내용 또는 키워드)
   * @param sort 정렬 (latest: 최신순 / oldest: 오래된순)
   */
  @Get("search")
  @Example<ApiResponse<DailyEntriesSearchResponse>>({
  success: true,
  code: "S200",
  message: "조회에 성공했습니다.",
  result: {
    keyword: "회의",
    journalTab: {
      count: 7,
      results: [
        {
          dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
          workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
          entryDate: "2026-06-21",
          tags: [{ tagName: "온보딩 리뉴얼", color: "#10B981" }],
          title: "Product Strategy Alignment 회의 준비",
        },
      ],
    },
    tagTab: {
      count: 3,
      results: [
        {
          dailyEntryId: "660e8400-e29b-41d4-a716-446655440001",
          workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
          entryDate: "2026-06-20",
          tags: [{ tagName: "회의", color: "#3B82F6" }],
          title: "주간 회의록 정리",
        },
      ],
    },
  },
  })
  public async search(
  @Header("Authorization") authorization: string | undefined,
  @Path() workspaceId: string,
  @Query() query: string,
  @Query() sort: "latest" | "oldest" = "latest"
): Promise<ApiResponse<DailyEntriesSearchResponse>> {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
  }
  const userId = verifyAccessToken(token).userId;
  const data = await searchDailyEntries(userId, workspaceId, query, sort);
  return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
}

/**
 * 날짜를 기준으로 저장된 일지를 조회합니다.
 * 오늘의 업무 화면 재진입 시 저장된 회고를 복원하는 용도입니다.
 *
 * @summary 날짜별 일지 조회
 * @param date 조회할 날짜 (YYYY-MM-DD)
 */
@Get()
@Example<ApiResponse<DailyEntryByDateResponse | null>>({
  success: true,
  code: "S200",
  message: "날짜별 일지 조회가 완료되었습니다.",
  result: {
    dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
    workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
    entryDate: "2026-07-31",
    reflectionContent:
      "오늘 업무에서 잘한 점과 아쉬운 점을 정리했다.",
  },
})
public async getByDate(
  @Header("Authorization")
  authorization: string | undefined,

  @Path() workspaceId: string,

  @Query()
  date: string,
): Promise<
  ApiResponse<DailyEntryByDateResponse | null>
> {
  const token = authorization?.startsWith(
    "Bearer ",
  )
    ? authorization.slice(7)
    : null;

  if (!token) {
    throw new ApiError(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "인증이 필요합니다.",
    );
  }

  const userId = verifyAccessToken(token).userId;

  const data = await getDailyEntryByDate(
    userId,
    workspaceId,
    date,
  );

  return success(
    SuccessCode.GET_SUCCESS.code,
    "날짜별 일지 조회가 완료되었습니다.",
    data,
  );
}

  /**
   * @summary 일자 상세 조회
   */
  @Get("{dailyEntryId}")
  @Example<ApiResponse<DailyEntriesDetailResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      dailyPerformanceId: "550e8400-e29b-41d4-a716-446655440000",
      entryDate: "2026-08-21",
      reflectionContent: "오늘은 JWT 인증 기능 구현을 완료했다.",

      converted: true,
      completedCount: 2,
      incompleteCount: 1,

      tasks: [
        {
          taskId: "550e8400-e29b-41d4-a716-446655440001",
          tag: {
            tagName: "백엔드",
            color: "#4A90E2",
          },
          title: "JWT 인증 구현",
          memo: "Refresh Token 추가 필요",
          priority: "MUST_DO",
          status: "COMPLETED",
          result: {
            taskResultId: "result-001",
            content: "JWT 인증 API 구현 완료",
            attachments: [
              {
                fileType: "img",
                fileUrl: "https://example.com/result.png",
                fileName: "result.png",
              },
            ],
          },
        },
      ],
    },
  })
  public async getDetail(
  @Header("Authorization") authorization: string | undefined,
  @Path() workspaceId: string,
  @Path() dailyEntryId: string
): Promise<ApiResponse<DailyEntriesDetailResponse>> {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
  }
  const userId = verifyAccessToken(token).userId;
  const data = await getDailyEntriesDetail(userId, workspaceId, dailyEntryId);
  return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
}

  /**
   * @summary 일지 삭제 (소프트 삭제)
   */
  @Delete("{dailyEntryId}")
  @Example<ApiResponse<{ dailyEntryId: string }>>({
    success: true,
    code: "S204",
    message: "삭제에 성공했습니다.",
    result: {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
    },
  })
  public async deleteDailyEntry(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<{ dailyEntryId: string }>> {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
      throw new ApiError(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
    }
    const userId = verifyAccessToken(token).userId;
    const data = await removeDailyEntry(userId, workspaceId, dailyEntryId);
    return success(SuccessCode.DELETED.code, SuccessCode.DELETED.message, data);
  }
}