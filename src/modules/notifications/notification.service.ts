import {
  findNotificationsByUserId,
  findNotificationById,
  markNotificationAsRead,
  createNotificationRecord,
} from "./notification.repository.js";
import { isNotificationTypeEnabled } from "./notification-setting.repository.js";

import {
  CreateNotificationParams,
  MarkNotificationReadResponse,
  NotificationItem,
  NotificationType,
} from "./notification.dto.js";

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

export const listNotifications = async (
  authorization: string | undefined
): Promise<NotificationItem[]> => {
  const userId = getUserIdFromAuthorization(authorization);

  const notifications = await findNotificationsByUserId(userId);

  return notifications.map((notification) => ({
    notificationId: notification.notificationId,
    type: notification.type as unknown as NotificationType,
    title: notification.title,
    content: notification.content,
    redirectUrl: notification.redirectUrl,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  }));
};

export const markNotificationRead = async (
  authorization: string | undefined,
  notificationId: string
): Promise<MarkNotificationReadResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  const found = await findNotificationById(userId, notificationId);

  if (!found) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "알림을 찾을 수 없습니다."
    );
  }

  const notification = found.isRead
    ? found
    : await markNotificationAsRead(notificationId);

  return {
    notificationId: notification.notificationId,
    isRead: true,
    redirectUrl: notification.redirectUrl,
  };
};

export const createNotification = async (
  params: CreateNotificationParams
): Promise<void> => {
  const enabled = await isNotificationTypeEnabled(params.userId, params.type);

  if (!enabled) {
    return;
  }

  await createNotificationRecord(params);
};