import { prisma } from "../../db.config.js";
import {
  NotificationType as PrismaNotificationType,
  AgreementType,
} from "../../generated/prisma/client.js";
import { NotificationType } from "./notification.dto.js";

export const findNotificationSettings = async (userId: string) => {
  return prisma.notificationSetting.findMany({ where: { userId } });
};

export const upsertNotificationSetting = async (
  userId: string,
  type: NotificationType,
  isEnabled: boolean
) => {
  return prisma.notificationSetting.upsert({
    where: {
      userId_type: { userId, type: type as unknown as PrismaNotificationType },
    },
    update: { isEnabled },
    create: {
      userId,
      type: type as unknown as PrismaNotificationType,
      isEnabled,
    },
  });
};

export const isNotificationTypeEnabled = async (
  userId: string,
  type: NotificationType
): Promise<boolean> => {
  const setting = await prisma.notificationSetting.findUnique({
    where: {
      userId_type: { userId, type: type as unknown as PrismaNotificationType },
    },
  });

  return setting?.isEnabled ?? true;
};

export const findMarketingAgreement = async (userId: string) => {
  return prisma.userAgreement.findUnique({
    where: { userId_type: { userId, type: AgreementType.MARKETING } },
  });
};

export const upsertMarketingAgreement = async (
  userId: string,
  isAgreed: boolean
) => {
  const now = new Date();

  return prisma.userAgreement.upsert({
    where: { userId_type: { userId, type: AgreementType.MARKETING } },
    update: {
      isAgreed,
      agreedAt: isAgreed ? now : undefined,
      revokedAt: isAgreed ? null : now,
    },
    create: {
      userId,
      type: AgreementType.MARKETING,
      isAgreed,
      revokedAt: isAgreed ? null : now,
    },
  });
};