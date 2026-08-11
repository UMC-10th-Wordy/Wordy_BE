import { prisma } from '../../db.config.js';

export const findTasksByUserIdAndDate = async (
  userId: string,
  workspaceId: string,
  entryDate: Date,
) => {
  return prisma.task.findMany({
    where: {
      userId,
      workspaceId,
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
  workspaceId: string,
  entryDate: Date,
) => {
  return prisma.dailyEntry.findUnique({
    where: {
      userId_workspaceId_entryDate: {
        userId,
        workspaceId,
        entryDate,
      },
    },
  });
};

export const createDailyEntryWithTasks = async (
  userId: string,
  workspaceId: string,
  entryDate: Date,
  title: string,
  reflectionContent: string,
  taskIds: string[],
) => {
  return prisma.$transaction(async (tx) => {
    if (taskIds.length > 0) {
      await tx.reflectionTask.deleteMany({
        where: {
          taskId: {
            in: taskIds,
          },
        },
      });
    }

    return tx.dailyEntry.create({
      data: {
        userId,
        workspaceId,
        entryDate,
        title,
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
  });
};

export const restoreDailyEntryWithTasks = async (
  dailyEntryId: string,
  workspaceId: string,
  reflectionContent: string,
  taskIds: string[],
) => {
  return prisma.$transaction(async (tx) => {
    await tx.reflectionTask.deleteMany({
      where: {
        OR: [
          {
            dailyEntryId,
          },
          ...(taskIds.length > 0
            ? [
                {
                  taskId: {
                    in: taskIds,
                  },
                },
              ]
            : []),
        ],
      },
    });

    return tx.dailyEntry.update({
      where: {
        dailyEntryId,
        workspaceId,
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