import {
  DailyPerformance,
  Prisma,
  PrismaClient,
} from "../../generated/prisma/client.js";
import { TaskStatus } from "../tasks/task.dto.js";

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
    reflectionSnapshot: {
      include: {
        reflectionTaskSnapshots: {
          include: {
            resultSnapshots: true,
            task: {
              include: {
                tag: true;
              };
            };
          };
        };
      };
    };
    dailyEntry:true;
    performanceItems:{
      include:{
        task:{
          include:{
            tag:true;
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

  async transaction<T>(
    callback: (
      tx: Prisma.TransactionClient
    ) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async findReflectionSnapshot(
    reflectionSnapshotId: string,
    userId: string,
    workspaceId: string,
  ) {
    return this.prisma.reflectionSnapshot.findFirst({
      where: {
        reflectionSnapshotId,
        status: "TEMP",
        dailyEntry: {
          userId,
          workspaceId,
          deletedAt: null,
        },
      },
      include: {
        dailyEntry: true,
        reflectionTaskSnapshots: {
          include: {
            resultSnapshots: true,
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

  async findTasksByDailyEntry(
    dailyEntryId: string,
    userId: string,
    workspaceId: string,
  ): Promise<TaskWithResultAndTag[]> {
    return this.prisma.task.findMany({
      where: {
        userId,
        workspaceId,
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
    tx?: Prisma.TransactionClient,
  ): Promise<DailyPerformance> {
    const prisma = tx ?? this.prisma;

    return prisma.dailyPerformance.create({
      data,
    });
  }

  async createPerformanceItems(
    data: Prisma.PerformanceItemUncheckedCreateInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const prisma = tx ?? this.prisma;

    return prisma.performanceItem.createMany({
      data,
    });
  }

  async findDailyPerformanceById(
    dailyPerformanceId: string,
    userId: string,
    workspaceId: string,
  ): Promise<DailyPerformanceDetail | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyPerformanceId,
        userId,
        workspaceId,
      },
      include: {
        reflectionSnapshot: {
          include: {
            reflectionTaskSnapshots: {
              include: {
                resultSnapshots: true,
                task: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
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

  async findDailyPerformanceByDate(
    userId: string,
    workspaceId: string,
    date: Date,
  ): Promise<DailyPerformanceDetail | null> {

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.dailyPerformance.findFirst({
      where: {
        userId,
        workspaceId,
        dailyEntry: {
          entryDate: date,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reflectionSnapshot: {
          include: {
            reflectionTaskSnapshots: {
              include: {
                resultSnapshots: true,
                task: {
                  include: {
                    tag: true,
                  },
                },
              },
            },
          },
        },
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

  async findDailyPerformance(
    dailyPerformanceId: string,
    userId: string,
    workspaceId: string,
  ): Promise<DailyPerformance | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyPerformanceId,
        userId,
        workspaceId,
      },
    });
  }

  async findDailyPerformances(
    userId: string,
    workspaceId: string,
  ): Promise<PerformanceList[]> {
    return this.prisma.dailyPerformance.findMany({
      where: {
        userId,
        workspaceId,
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
    workspaceId: string,
  ) {
    return this.prisma.dailyEntry.findFirst({
      where: {
        dailyEntryId,
        userId,
        workspaceId,
        deletedAt: null,
      },
    });
  }

  async findIncompleteTasks(
    dailyEntryId: string,
    userId: string,
    workspaceId: string,
  ) {
    return this.prisma.task.findMany({
      where: {
        userId,
        workspaceId,
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

  async findDailyPerformanceByDailyEntry(
    dailyEntryId: string,
    reflectionSnapshotId: string,
    userId: string,
    workspaceId: string,
  ): Promise<DailyPerformance | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyEntryId,
        reflectionSnapshotId,
        userId,
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findReflectionSnapshotById(
    reflectionSnapshotId: string,
    userId: string,
    workspaceId: string,
  ) {
    return this.prisma.reflectionSnapshot.findFirst({
      where: {
        reflectionSnapshotId,
        dailyEntry: {
          userId,
          workspaceId,
          deletedAt: null,
        },
      },
      select: {
        reflectionSnapshotId: true,
        status: true,
        promptBResult: true,
        reflectionTaskSnapshots: {
          include: {
            resultSnapshots: true,
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

  async updateDailyPerformance(
    dailyPerformanceId: string,
    data: Prisma.DailyPerformanceUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<DailyPerformance> {
    const prisma = tx ?? this.prisma;

    return prisma.dailyPerformance.update({
      where: {
        dailyPerformanceId,
      },
      data,
    });
  }

  async confirmReflectionSnapshot(
    id:string,
    tx?: Prisma.TransactionClient,
  ){
    const prisma = tx ?? this.prisma;

    return prisma.reflectionSnapshot.update({
      where:{
        reflectionSnapshotId:id
      },
      data:{
        status:"SAVED"
      }
    })
  }

  async deletePerformanceItems(
    dailyPerformanceId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const prisma = tx ?? this.prisma;

    return prisma.performanceItem.deleteMany({
      where: {
        dailyPerformanceId,
      },
    });
  }
}