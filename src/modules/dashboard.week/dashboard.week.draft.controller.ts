import { Controller, Get, Post, Body, Query, Route, Tags, Example, Header, Path } from "tsoa";
import { saveDraft, getDraft } from "./dashboard.week.draft.service.js";
import { DraftType } from "../../generated/prisma/client.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

import {
  SaveDraftRequest,
  DraftResponse,
} from "./dashboard.week.draft.dto.js";

@Route("workspaces/{workspaceId}/dashboards/drafts")
@Tags("DashboardDraft")
export class DashboardDraftController extends Controller {
  /**
   * @summary 회고 draft 임시저장 (있으면 덮어쓰기)
   * @param type 주간(WEEKLY) / 월간(MONTHLY)
   */
  @Post()
  @Example<ApiResponse<DraftResponse>>({
    success: true,
    code: "S200",
    message: "임시 저장되었습니다.",
    result: {
      reflectionDraftId: "550e8400-e29b-41d4-a716-446655440000",
      type: "MONTHLY",
      workSummary: "이번 달 온보딩 리뉴얼 진행",
      resourcesUsed: "사용자 인터뷰, 로그 분석",
      learning: "데이터 기반 의사결정의 중요성",
      taskPlans: [
        { content: "리서치 일정 블록 확보", expectedTime: "7월 20일" },
        { content: "디자인 시스템 V2 마무리", expectedTime: "7월 20일~22일" },
      ],
      updatedAt: "2026-06-29T22:10:34.000Z",
    },
  })
  public async save(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Query() type: DraftType,
    @Query() baseDate: string,
    @Body() body: SaveDraftRequest
  ): Promise<ApiResponse<DraftResponse>> {
    const data = await saveDraft(authorization, workspaceId, type, baseDate, body);
    return success(SuccessCode.OK.code, "임시 저장되었습니다.", data);
  }

  /**
   * @summary 회고 draft 조회 (복원)
   * @param type 주간(WEEKLY) / 월간(MONTHLY)
   */
  @Get()
  @Example<ApiResponse<DraftResponse | null>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      reflectionDraftId: "550e8400-e29b-41d4-a716-446655440000",
      type: "MONTHLY",
      workSummary: "이번 달 온보딩 리뉴얼 진행",
      resourcesUsed: "사용자 인터뷰, 로그 분석",
      learning: "데이터 기반 의사결정의 중요성",
      taskPlans: [
        { content: "리서치 일정 블록 확보", expectedTime: "7월 20일" },
      ],
      updatedAt: "2026-06-29T22:10:34.000Z",
    },
  })
  public async get(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Query() type: DraftType,
    @Query() baseDate: string
  ): Promise<ApiResponse<DraftResponse | null>> {
    const data = await getDraft(authorization, workspaceId, type, baseDate);
    return success(SuccessCode.GET_SUCCESS.code, SuccessCode.GET_SUCCESS.message, data);
  }
}