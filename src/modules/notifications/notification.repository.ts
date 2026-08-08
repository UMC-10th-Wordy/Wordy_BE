import { prisma } from "../../db.config.js";
import { NotificationType as PrismaNotificationType } from "../../generated/prisma/client.js";
import { CreateNotificationParams } from "./notification.dto.js";

export const findNotificationsByUserId = async (
  userId: string,
  options: { isRead?: boolean; skip: number; take: number }
) => {
  return prisma.notification.findMany({
    where: {
      userId,
      ...(options.isRead !== undefined ? { isRead: options.isRead } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: options.skip,
    take: options.take,
  });
};

export const countNotificationsByUserId = async (
  userId: string,
  isRead?: boolean
) => {
  return prisma.notification.count({
    where: { userId, ...(isRead !== undefined ? { isRead } : {}) },
  });
};

export const findNotificationById = async (
  userId: string,
  notificationId: string
) => {
  return prisma.notification.findFirst({
    where: { notificationId, userId },
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
      type: params.type as unknown as PrismaNotificationType,
      title: params.title,
      content: params.content,
      redirectUrl: params.redirectUrl ?? null,
    },
  });
};