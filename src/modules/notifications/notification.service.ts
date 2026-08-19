import {
  findNotificationsByUserId,
  countNotificationsByUserId,
  findNotificationById,
  markNotificationAsRead,
  createNotificationRecord,
} from "./notification.repository.js";
import { isNotificationTypeEnabled } from "./notification-setting.repository.js";

import {
  CreateNotificationParams,
  MarkNotificationReadResponse,
  NotificationItem,
  NotificationListResponse,
  NotificationStatusFilter,
  NotificationType,
} from "./notification.dto.js";

import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { verifyAccessToken } from "../../auth.config.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";

const workspaceRepository = new WorkspaceRepository();

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const MAX_SIZE = 50;

const statusToIsRead = (
  status: NotificationStatusFilter
): boolean | undefined => {
  if (status === NotificationStatusFilter.READ) return true;
  if (status === NotificationStatusFilter.UNREAD) return false;
  return undefined;
};

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
  authorization: string | undefined,
  workspaceId: string,
  status: NotificationStatusFilter = NotificationStatusFilter.ALL,
  page: number = DEFAULT_PAGE,
  size: number = DEFAULT_SIZE
): Promise<NotificationListResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  const workspace = await workspaceRepository.findByIdAndUserId(
    workspaceId,
    userId
  );
  if (!workspace) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "워크스페이스를 찾을 수 없습니다."
    );
  }

  const isRead = statusToIsRead(status);
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.min(MAX_SIZE, Math.max(1, Math.floor(size)));
  const skip = (safePage - 1) * safeSize;

  const [notifications, totalCount] = await Promise.all([
    findNotificationsByUserId(userId, workspaceId, {
      isRead,
      skip,
      take: safeSize,
    }),
    countNotificationsByUserId(userId, workspaceId, isRead),
  ]);

  const totalPages = Math.ceil(totalCount / safeSize);

  return {
    items: notifications.map((notification) => ({
      notificationId: notification.notificationId,
      type: notification.type as unknown as NotificationType,
      title: notification.title,
      content: notification.content,
      redirectUrl: notification.redirectUrl,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    })),
    page: safePage,
    size: safeSize,
    totalCount,
    totalPages,
    hasNext: safePage < totalPages,
  };
};

export const markNotificationRead = async (
  authorization: string | undefined,
  workspaceId: string,
  notificationId: string
): Promise<MarkNotificationReadResponse> => {
  const userId = getUserIdFromAuthorization(authorization);

  const found = await findNotificationById(userId, workspaceId, notificationId);

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