import { prisma } from "../../db.config.js";
import { NotificationType as PrismaNotificationType } from "../../generated/prisma/client.js";
import { CreateNotificationParams } from "./notification.dto.js";

export const findNotificationsByUserId = async (
  userId: string,
  workspaceId: string,
  options: { isRead?: boolean; skip: number; take: number }
) => {
  return prisma.notification.findMany({
    where: {
      userId,
      OR: [{ workspaceId }, { workspaceId: null }],
      ...(options.isRead !== undefined ? { isRead: options.isRead } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { notificationId: "desc" }],
    skip: options.skip,
    take: options.take,
  });
};

export const countNotificationsByUserId = async (
  userId: string,
  workspaceId: string,
  isRead?: boolean
) => {
  return prisma.notification.count({
    where: {
      userId,
      OR: [{ workspaceId }, { workspaceId: null }],
      ...(isRead !== undefined ? { isRead } : {}),
    },
  });
};

export const findNotificationById = async (
  userId: string,
  workspaceId: string,
  notificationId: string
) => {
  return prisma.notification.findFirst({
    where: { notificationId, userId, OR: [{ workspaceId }, { workspaceId: null }] },
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { notificationId },
    data: { isRead: true, readAt: new Date() },
  });
};

export const createNotificationRecord = async (
  params: CreateNotificationParams
) => {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      workspaceId: params.workspaceId ?? null,
      type: params.type as unknown as PrismaNotificationType,
      title: params.title,
      content: params.content,
      redirectUrl: params.redirectUrl ?? null,
    },
  });
};