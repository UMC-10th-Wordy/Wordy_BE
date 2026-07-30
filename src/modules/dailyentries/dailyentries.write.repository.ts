import { prisma } from '../../db.config.js';

export const findTasksByUserIdAndDate = async (
  userId: string,
  entryDate: Date,
) => {
  return prisma.task.findMany({
    where: {
      userId,
      taskDate: entryDate,
      deletedAt: null,
    },
    select: {
      taskId: true,
    },
  });
};

export const findDailyEntryByUserIdAndDate = async (
  userId: string,
  entryDate: Date,
) => {
  return prisma.dailyEntry.findUnique({
    where: {
      userId_entryDate: {
        userId,
        entryDate,
      },
    },
  });
};

export const createDailyEntryWithTasks = async (
  userId: string,
  entryDate: Date,
  reflectionContent: string,
  taskIds: string[],
) => {
  return prisma.dailyEntry.create({
    data: {
      userId,
      entryDate,
      reflectionContent,

      reflectionTasks: {
        create: taskIds.map((taskId) => ({
          taskId,
        })),
      },
    },

    include: {
      reflectionTasks: {
        select: {
          taskId: true,
        },
      },
    },
  });
};

export const restoreDailyEntryWithTasks = async (
  dailyEntryId: string,
  reflectionContent: string,
  taskIds: string[],
) => {
  return prisma.$transaction(async (tx) => {
    await tx.reflectionTask.deleteMany({
      where: {
        dailyEntryId,
      },
    });

    return tx.dailyEntry.update({
      where: {
        dailyEntryId,
      },
      data: {
        reflectionContent,
        deletedAt: null,
        reflectionTasks: {
          create: taskIds.map((taskId) => ({
            taskId,
          })),
        },
      },
      include: {
        reflectionTasks: {
          select: {
            taskId: true,
          },
        },
      },
    });
  });
};

export const updateDailyEntryReflectionContent = async (
  dailyEntryId: string,
  reflectionContent: string,
) => {
  return prisma.dailyEntry.update({
    where: {
      dailyEntryId,
    },
    data: {
      reflectionContent,
    },
    include: {
      reflectionTasks: true,
    },
  });
};