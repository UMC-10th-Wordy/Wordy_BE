import {
  Body,
  Controller,
  Get,
  Patch,
  Path,
  Route,
  Tags,
  Example,
  Header,
} from "tsoa";

import {
  getNotificationSettings,
  updateNotificationSetting,
} from "./notification-setting.service.js";

import {
  NotificationSettingItemResponse,
  NotificationSettingKey,
  NotificationSettingsResponse,
  UpdateNotificationSettingRequest,
} from "./notification-setting.dto.js";

import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

@Route("notification-settings")
@Tags("Notifications")
export class NotificationSettingController extends Controller {
  /**
   * @summary 알림 설정 조회 (이메일 마케팅 / 알림함 마케팅 / 성과 준비 / 성과 리마인드)
   */
  @Get()
  @Example<ApiResponse<NotificationSettingsResponse>>({
    success: true,
    code: "S200",
    message: "조회에 성공했습니다.",
    result: {
      emailMarketing: true,
      inboxMarketingPromotion: true,
      dashboardCompleted: true,
      dashboardInduce: true,
    },
  })
  public async getSettings(
    @Header("Authorization") authorization: string | undefined
  ): Promise<ApiResponse<NotificationSettingsResponse>> {
    const data = await getNotificationSettings(authorization);

    return success(
      SuccessCode.GET_SUCCESS.code,
      SuccessCode.GET_SUCCESS.message,
      data
    );
  }

  /**
   *
   * @summary 알림 설정 항목 하나 수정
   */
  @Patch("{settingKey}")
  @Example<ApiResponse<NotificationSettingItemResponse>>({
    success: true,
    code: "S200",
    message: "수정에 성공했습니다.",
    result: {
      settingKey: NotificationSettingKey.DASHBOARD_COMPLETED,
      isEnabled: false,
    },
  })
  public async updateSetting(
    @Header("Authorization") authorization: string | undefined,
    @Path() settingKey: NotificationSettingKey,
    @Body() body: UpdateNotificationSettingRequest
  ): Promise<ApiResponse<NotificationSettingItemResponse>> {
    const data = await updateNotificationSetting(
      authorization,
      settingKey,
      body.isEnabled
    );

    return success(
      SuccessCode.UPDATED.code,
      SuccessCode.UPDATED.message,
      data
    );
  }
}