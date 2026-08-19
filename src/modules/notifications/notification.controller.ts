import {
  Controller,
  Get,
  Patch,
  Path,
  Query,
  Route,
  Tags,
  Example,
  Header,
} from "tsoa";

import {
  listNotifications,
  markNotificationRead,
} from "./notification.service.js";

import {
  MarkNotificationReadResponse,
  NotificationListResponse,
  NotificationStatusFilter,
  NotificationType,
} from "./notification.dto.js";

import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("workspaces/{workspaceId}/notifications")
@Tags("Notifications")
export class NotificationController extends Controller {
  /**
   * @summary 알림 목록 조회 (읽음/안읽음 상태 포함, 페이지네이션)
   * @param authorization
   * @param workspaceId
   * @param status 조회 범위. all(기본값) / read / unread
   * @param page 페이지 번호 (1부터 시작, 기본값 1)
   * @param size 페이지당 항목 수 (기본값 10, 최대 50)
   */
  @Get()
  @Example<ApiResponse<NotificationListResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      items: [
        {
          notificationId: "550e8400-e29b-41d4-a716-446655440000",
          type: NotificationType.DASHBOARD_COMPLETED,
          title: "성과 대시보드가 완성됐어요",
          content: "이번 주 성과 리포트를 확인해보세요.",
          redirectUrl:
            "/dashboard/weekly/550e8400-e29b-41d4-a716-446655440000",
          isRead: false,
          createdAt: new Date("2026-08-04T09:00:00.000Z"),
        },
      ],
      page: 1,
      size: 10,
      totalCount: 23,
      totalPages: 3,
      hasNext: true,
    },
  })
  public async getNotifications(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Query() status?: NotificationStatusFilter,
    @Query() page?: number,
    @Query() size?: number
  ): Promise<ApiResponse<NotificationListResponse>> {
    const data = await listNotifications(
      authorization,
      workspaceId,
      status,
      page,
      size
    );
    return success(
      SuccessCode.GET_SUCCESS.code,
      SuccessCode.GET_SUCCESS.message,
      data
    );
  }

  /**
   * @summary 알림 읽음 처리
   */
  @Patch("{notificationId}/read")
  @Example<ApiResponse<MarkNotificationReadResponse>>({
    success: true,
    code: "S200",
    message: "수정에 성공했습니다.",
    result: {
      notificationId: "550e8400-e29b-41d4-a716-446655440000",
      isRead: true,
      redirectUrl:
        "/dashboard/weekly/550e8400-e29b-41d4-a716-446655440000",
    },
  })
  public async markAsRead(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() notificationId: string
  ): Promise<ApiResponse<MarkNotificationReadResponse>> {
    const data = await markNotificationRead(
      authorization,
      workspaceId,
      notificationId
    );

    return success(
      SuccessCode.UPDATED.code,
      SuccessCode.UPDATED.message,
      data
    );
  }
}