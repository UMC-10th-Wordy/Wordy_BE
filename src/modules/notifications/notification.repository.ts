import { prisma } from "../../db.config.js";
import { NotificationType as PrismaNotificationType } from "../../generated/prisma/client.js";
import { CreateNotificationParams } from "./notification.dto.js";

export const findNotificationsByUserId = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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