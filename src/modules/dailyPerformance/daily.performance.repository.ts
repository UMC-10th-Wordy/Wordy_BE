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

  async findReflectionSnapshot(
    reflectionSnapshotId: string,
    userId: string,
  ) {
    return this.prisma.reflectionSnapshot.findFirst({
      where: {
        reflectionSnapshotId,
        status:"TEMP",
        dailyEntry: {
          userId,
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
    date: Date,
  ): Promise<DailyPerformanceDetail | null> {

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.dailyPerformance.findFirst({
      where: {
        userId,
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
  ): Promise<DailyPerformance | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyPerformanceId,
        userId,
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

  async findDailyPerformanceByDailyEntry(
    dailyEntryId: string,
    userId: string,
  ): Promise<DailyPerformance | null> {
    return this.prisma.dailyPerformance.findFirst({
      where: {
        dailyEntryId,
        userId,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async findReflectionSnapshotById(
    reflectionSnapshotId: string,
    userId: string,
  ) {
    return this.prisma.reflectionSnapshot.findFirst({
      where:{
        reflectionSnapshotId,
        dailyEntry:{
          userId,
          deletedAt:null,
        },
      },
      select:{
        reflectionSnapshotId:true,
        status:true,
        promptBResult:true,
        reflectionTaskSnapshots:{
          include:{
            resultSnapshots:true,
            task:{
              include:{
                tag:true,
              },
            },
          },
        },
      }
    });
  }

  async updateDailyPerformance(
    dailyPerformanceId: string,
    data: Prisma.DailyPerformanceUncheckedUpdateInput,
  ): Promise<DailyPerformance> {
    return this.prisma.dailyPerformance.update({
      where: {
        dailyPerformanceId,
      },
      data,
    });
  }

  async confirmReflectionSnapshot(
    id:string
  ){
    return this.prisma.reflectionSnapshot.update({
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
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.performanceItem.deleteMany({
      where: {
        dailyPerformanceId,
      },
    });
  }
}