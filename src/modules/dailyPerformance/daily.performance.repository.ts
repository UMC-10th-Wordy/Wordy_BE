import {
  DailyPerformance,
  PerformanceItem,
  Prisma,
  PrismaClient,
  ReflectionSnapshot,
} from "../../generated/prisma/client";
import { TaskStatus } from "../tasks/task.dto";

type TaskWithResultAndTag = Prisma.TaskGetPayload<{
  include: {
    taskResult: true;
    tag: true;
  };
}>;

type PerformanceList = Prisma.DailyPerformanceGetPayload<{
  select: {
    dailyPerformanceId: true;
    achievementRate: true;
    summary: true;
    createdAt: true;
  };
}>;

export type DailyPerformanceDetail = Prisma.DailyPerformanceGetPayload<{
  include: {
    reflectionSnapshot: true;
    dailyEntry: true;
    performanceItems: {
      include: {
        task: {
          include: {
            tag: true;
          };
        };
      };
    };
  };
}>;

export class DailyPerformanceRepository {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  async findReflectionSnapshot(
    reflectionSnapshotId: string,
    userId: string,
  ) {
    return this.prisma.reflectionSnapshot.findFirst({
      where: {
        reflectionSnapshotId,
        dailyEntry: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        dailyEntry: true,
      },
    });
  }

  async findTasksByDailyEntry(
    dailyEntryId: string,
    userId: string,
  ): Promise<TaskWithResultAndTag[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        reflectionTasks: {
          some: {
            dailyEntryId,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        taskResult: true,
        tag: true,
      },
    });
  }

  async createDailyPerformance(
    data: Prisma.DailyPerformanceUncheckedCreateInput,
  ): Promise<DailyPerformance> {
    return this.prisma.dailyPerformance.create({
      data,
    });
  }

  async createPerformanceItems(
    data: Prisma.PerformanceItemUncheckedCreateInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.performanceItem.createMany({
      data,
    });
  }

  async findDailyPerformanceById(
    dailyPerformanceId: string,
    userId: string,
  ): Promise<DailyPerformanceDetail | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyPerformanceId,
        userId,
      },
      include: {
        reflectionSnapshot: true,
        dailyEntry: true,
        performanceItems: {
          include: {
            task: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  async findDailyPerformances(
    userId: string,
  ): Promise<PerformanceList[]> {
    return this.prisma.dailyPerformance.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        dailyPerformanceId: true,
        achievementRate: true,
        summary: true,
        createdAt: true,
      },
    });
  }

  async findDailyEntry(
    dailyEntryId: string,
    userId: string,
  ) {
    return this.prisma.dailyEntry.findFirst({
      where: {
        dailyEntryId,
        userId,
        deletedAt: null,
      },
    });
  }

  async findIncompleteTasks(
    dailyEntryId: string,
    userId: string,
  ) {
    return this.prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.IN_PROGRESS,
        reflectionTasks: {
          some: {
            dailyEntryId,
          },
        },
      },
      include: {
        tag: true,
      },
    });
  }
}