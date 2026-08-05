import {
  Controller,
  Get,
  Patch,
  Delete,
  Path,
  Route,
  Tags,
  Example,
  Header,
} from "tsoa";

import {
  getTrashedDailyEntries,
  restoreDailyEntry,
  deleteDailyEntryPermanently,
} from "./trash.service.js";

import { TrashDailyEntryItem } from "./trash.dto.js";

import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("trash/daily-entries")
@Tags("Trash")
export class TrashController extends Controller {
  /**
   * @summary 휴지통 목록 조회
   */
  @Get()
  @Example<ApiResponse<TrashDailyEntryItem[]>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: [
      {
        dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
        entryDate: "2026-07-31",
        reflectionContent:
          "오늘 업무에서 잘한 점과 아쉬운 점을 정리했다.",
        deletedAt: new Date("2026-08-01T12:34:56.000Z"),
      },
    ],
  })
  public async getTrash(
    @Header("Authorization") authorization: string | undefined
  ): Promise<ApiResponse<TrashDailyEntryItem[]>> {
    const data = await getTrashedDailyEntries(authorization);
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