import {
  findNotificationSettings,
  upsertNotificationSetting,
  findMarketingAgreement,
  upsertMarketingAgreement,
} from "./notification-setting.repository.js";

import { NotificationType } from "./notification.dto.js";
import {
  NotificationSettingItemResponse,
  NotificationSettingKey,
  NotificationSettingsResponse,
} from "./notification-setting.dto.js";
import { NotificationType as PrismaNotificationType } from "../../generated/prisma/client.js";

import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { verifyAccessToken } from "../../auth.config.js";

class UnauthorizedError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      ErrorCode.UNAUTHORIZED.message
    );
  }
}

const getUserIdFromAuthorization = (
  authorization: string | undefined
): string => {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }

  const token = authorization.replace("Bearer ", "");

  try {
    return verifyAccessToken(token).userId;
  } catch {
    throw new UnauthorizedError();
  }
};

// NotificationSettingKey-> NotificationType 매핑 + EMAIL_MARKETING은 UserAgreement
const settingKeyToNotificationType: Partial<
  Record<NotificationSettingKey, NotificationType>
> = {
  [NotificationSettingKey.INBOX_MARKETING_PROMOTION]:
    NotificationType.MARKETING_PROMOTION,
  [NotificationSettingKey.DASHBOARD_COMPLETED]:
    NotificationType.DASHBOARD_COMPLETED,
  [NotificationSettingKey.DASHBOARD_INDUCE]: NotificationType.DASHBOARD_INDUCE,
};

const buildSettingsResponse = async (
  userId: string
): Promise<NotificationSettingsResponse> => {
  const [agreement, settings] = await Promise.all([
    findMarketingAgreement(userId),
    findNotificationSettings(userId),
  ]);

  const isEnabled = (type: NotificationType) =>
    settings.find(
      (setting) => setting.type === (type as unknown as PrismaNotificationType)
    )?.isEnabled ?? true;

  return {
    emailMarketing: agreement?.isAgreed ?? false,
    inboxMarketingPromotion: isEnabled(NotificationType.MARKETING_PROMOTION),
    dashboardCompleted: isEnabled(NotificationType.DASHBOARD_COMPLETED),
    dashboardInduce: isEnabled(NotificationType.DASHBOARD_INDUCE),
  };
};

// 알림 설정 조회
export const getNotificationSettings = async (
  authorization: string | undefined
): Promise<NotificationSettingsResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  return buildSettingsResponse(userId);
};

// 알림 설정 항목 수정
export const updateNotificationSetting = async (
  authorization: string | undefined,
  settingKey: NotificationSettingKey,
  isEnabled: boolean
): Promise<NotificationSettingItemResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  if (settingKey === NotificationSettingKey.EMAIL_MARKETING) {
    await upsertMarketingAgreement(userId, isEnabled);
  } else {
    const notificationType = settingKeyToNotificationType[settingKey];

    if (!notificationType) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "존재하지 않는 알림 설정 항목입니다."
      );
    }

    await upsertNotificationSetting(userId, notificationType, isEnabled);
  }

  return { settingKey, isEnabled };
};