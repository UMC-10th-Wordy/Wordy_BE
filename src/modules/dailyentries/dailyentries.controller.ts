import { Controller, Get, Delete, Path, Query, Route, Tags, Example } from "tsoa";
import {
  getDailyEntriesSummary,
  getMonthlyList,
  getMonthlyEntries,
  getDailyEntriesDetail,
  removeDailyEntry,
  searchDailyEntries,
} from "./dailyentries.service.js";
import {
  DailyEntriesSummaryResponse,
  MonthlyRecordItem,
  DailyRecordItem,
  DailyEntriesDetailResponse,
  DailyEntriesSearchResponse,
} from "./dailyentries.dto.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("daily-entries")
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
  public async getSummary(): Promise<ApiResponse<DailyEntriesSummaryResponse>> {
    const userId = "test-user-id";
    const data = await getDailyEntriesSummary(userId);
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
  public async getMonthly(): Promise<ApiResponse<MonthlyRecordItem[]>> {
    const userId = "test-user-id";
    const data = await getMonthlyList(userId);
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
        entryDate: "2026-08-21",
        day: 21,
        tags: [{ tagName: "회의", color: "#3B82F6" }],
        mainTaskTitle: "Product Strategy Alignment 회의 준비",
        extraTaskCount: 7,
        summary: "회의 준비와 디자인 시스템 V2 정리를 병행한 날이에요.",
      },
    ],
  })
  public async getMonthlyEntries(
    @Path() yearMonth: string
  ): Promise<ApiResponse<DailyRecordItem[]>> {
    const userId = "test-user-id";
    const data = await getMonthlyEntries(userId, yearMonth);
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
      entryCount: 7,
      tagCount: 3,
      results: [
        {
          dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
          entryDate: "2026-06-21",
          tags: [{ tagName: "온보딩 리뉴얼", color: "#10B981" }],
          title: "Product Strategy Alignment 회의 준비",
        },
      ],
    },
  })
  public async search(
    @Query() query: string,
    @Query() sort: "latest" | "oldest" = "latest"
  ): Promise<ApiResponse<DailyEntriesSearchResponse>> {
    const userId = "test-user-id";
    const data = await searchDailyEntries(userId, query, sort);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
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
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<DailyEntriesDetailResponse>> {
    const userId = "test-user-id";
    const data = await getDailyEntriesDetail(userId, dailyEntryId);
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
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<{ dailyEntryId: string }>> {
    const userId = "test-user-id";
    const data = await removeDailyEntry(userId, dailyEntryId);
    return success(SuccessCode.DELETED.code, SuccessCode.DELETED.message, data);
  }
}