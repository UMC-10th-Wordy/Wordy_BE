import {
  Controller,
  Get,
  Patch,
  Delete,
  Path,
  Query,
  Route,
  Tags,
  Example,
  Header,
} from "tsoa";

import {
  getTrashedDailyEntries,
  getTrashedDailyEntryDetail,
  restoreDailyEntry,
  deleteDailyEntryPermanently,
} from "./trash.service.js";

import { TrashDailyEntryListResponse } from "./trash.dto.js";
import { DailyEntriesDetailResponse } from "../dailyentries/dailyentries.dto.js";

import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("trash/daily-entries")
@Tags("Trash")
export class TrashController extends Controller {
  /**
   * @summary 휴지통 목록 조회
   * @param page 페이지 번호 (1부터 시작, 기본값 1)
   * @param size 페이지당 항목 수 (기본값 10, 최대 50)
   */
  @Get()
  @Example<ApiResponse<TrashDailyEntryListResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      items: [
        {
          dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
          entryDate: "2026-07-31",
          reflectionContent:
            "오늘 업무에서 잘한 점과 아쉬운 점을 정리했다.",
          deletedAt: new Date("2026-08-01T12:34:56.000Z"),
        },
      ],
      page: 1,
      size: 10,
      totalCount: 23,
      totalPages: 3,
      hasNext: true,
    },
  })
  public async getTrash(
    @Header("Authorization") authorization: string | undefined,
    @Query() page?: number,
    @Query() size?: number
  ): Promise<ApiResponse<TrashDailyEntryListResponse>> {
    const data = await getTrashedDailyEntries(authorization, page, size);
    return success(
      SuccessCode.GET_SUCCESS.code,
      SuccessCode.GET_SUCCESS.message,
      data
    );
  }

/**
 * @summary 휴지통 일지 상세 조회
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
            attachments: [],
          },
        },
      ],
    },
  })
  public async getDetail(
    @Header("Authorization") authorization: string | undefined,
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<DailyEntriesDetailResponse>> {
    const data = await getTrashedDailyEntryDetail(
      authorization,
      dailyEntryId
    );

    return success(
      SuccessCode.GET_SUCCESS.code,
      SuccessCode.GET_SUCCESS.message,
      data
    );
  }

  /**
   * @summary 일지 복원
   */
  @Patch("{dailyEntryId}/restore")
  @Example<ApiResponse<{ dailyEntryId: string }>>({
    success: true,
    code: "S200",
    message: "복원에 성공했습니다.",
    result: {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
    },
  })
  public async restore(
    @Header("Authorization") authorization: string | undefined,
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<{ dailyEntryId: string }>> {
    const data = await restoreDailyEntry(authorization, dailyEntryId);
    return success(
      SuccessCode.RESTORED.code,
      SuccessCode.RESTORED.message,
      data
    );
  }

  /**
   * @summary 일지 영구 삭제
   */
  @Delete("{dailyEntryId}")
  @Example<ApiResponse<{ dailyEntryId: string }>>({
    success: true,
    code: "S200",
    message: "삭제에 성공했습니다.",
    result: {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
    },
  })
  public async deletePermanently(
    @Header("Authorization") authorization: string | undefined,
    @Path() dailyEntryId: string
  ): Promise<ApiResponse<{ dailyEntryId: string }>> {
    const data = await deleteDailyEntryPermanently(authorization, dailyEntryId);
    return success(
      SuccessCode.DELETED.code,
      SuccessCode.DELETED.message,
      data
    );
  }
}