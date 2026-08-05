import { Example } from "tsoa";

export enum NotificationSettingKey {
  EMAIL_MARKETING = "EMAIL_MARKETING",
  INBOX_MARKETING_PROMOTION = "INBOX_MARKETING_PROMOTION",
  DASHBOARD_COMPLETED = "DASHBOARD_COMPLETED",
  DASHBOARD_INDUCE = "DASHBOARD_INDUCE",
}

//이메일 마케팅 수신은 회원가입 시 받은 UserAgreement(MARKETING) 동의 값을 그대로 사용
export class NotificationSettingsResponse {
  @Example(true)
  emailMarketing!: boolean;

  @Example(true)
  inboxMarketingPromotion!: boolean;

  @Example(true)
  dashboardCompleted!: boolean;

  @Example(true)
  dashboardInduce!: boolean;
}

export class UpdateNotificationSettingRequest {
  @Example(false)
  isEnabled!: boolean;
}

export class NotificationSettingItemResponse {
  @Example(NotificationSettingKey.DASHBOARD_COMPLETED)
  settingKey!: NotificationSettingKey;

  @Example(false)
  isEnabled!: boolean;
}