import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../db.config.js';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskPriority,
  TaskReorderItem,
} from './task.dto.js';

export class TaskRepository {
  private async findOrCreateDailyEntry(
  tx: Prisma.TransactionClient,
  userId: string,
  entryDate: Date,
) {
  return tx.dailyEntry.upsert({
    where: {
      userId_entryDate: {
        userId,
        entryDate,
      },
    },
    update: {},
    create: {
      userId,
      entryDate,
      title: '',
      reflectionContent: '',
    },
    select: {
      dailyEntryId: true,
    },
  });
}

private async syncReflectionTask(
  tx: Prisma.TransactionClient,
  taskId: string,
  userId: string,
  taskDate: Date,
) {
  const dailyEntry =
    await this.findOrCreateDailyEntry(
      tx,
      userId,
      taskDate,
    );

  /**
   * 하나의 현재 Task는 현재 날짜의 DailyEntry 하나에만 연결되도록
   * 기존 연결을 정리한 뒤 다시 연결합니다.
   */
  await tx.reflectionTask.deleteMany({
    where: {
      taskId,
    },
  });

  await tx.reflectionTask.create({
    data: {
      taskId,
      dailyEntryId: dailyEntry.dailyEntryId,
    },
  });
}

  public async findManyByUserIdAndDate(
    userId: string,
    taskDate: Date,
  ) {
    return prisma.task.findMany({
      where: {
        userId,
        taskDate,
        deletedAt: null,
      },
      include: {
        tag: {
          select: {
            tagId: true,
            tagName: true,
            color: true,
            projectName: true,
          },
        },
        taskResult: {
          select: {
            taskResultId: true,
            taskId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            attachments: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });
  }

  public async findActiveByIdAndUserId(
    taskId: string,
    userId: string,
  ) {
    return prisma.task.findFirst({
      where: {
        taskId,
        userId,
        deletedAt: null,
      },
      include: {
        tag: {
          select: {
            tagId: true,
            tagName: true,
            color: true,
            projectName: true,
          },
        },
        taskResult: {
          select: {
            taskResultId: true,
            taskId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            attachments: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * 특정 사용자 / 날짜 / 우선순위 그룹의 다음 sortOrder를 반환합니다.
   *
   * 예:
   * 0, 1, 2가 존재하면 3 반환
   * 업무가 없으면 0 반환
   */
  public async findNextSortOrder(
    userId: string,
    taskDate: Date,
    priority: TaskPriority,
  ): Promise<number> {
    const result = await prisma.task.aggregate({
      where: {
        userId,
        taskDate,
        priority,
        deletedAt: null,
      },
      _max: {
        sortOrder: true,
      },
    });

    return (result._max.sortOrder ?? -1) + 1;
  }

  public async create(
  userId: string,
  body: CreateTaskRequest,
  sortOrder: number,
) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        userId,
        title: body.title,
        priority: body.priority,
        sortOrder,
        memo: body.memo,
        taskDate: new Date(body.taskDate),

        status:
          body.status ?? TaskStatus.IN_PROGRESS,

        completedAt:
          body.status === TaskStatus.COMPLETED
            ? new Date()
            : null,

        tagId: body.tagId ?? null,
      },
      include: {
        tag: {
          select: {
            tagId: true,
            tagName: true,
            color: true,
            projectName: true,
          },
        },
      },
    });

    await this.syncReflectionTask(
      tx,
      task.taskId,
      userId,
      task.taskDate,
    );

    return task;
  });
}

  public async update(
  taskId: string,
  userId: string,
  body: UpdateTaskRequest,
  sortOrder?: number,
) {
  return prisma.$transaction(async (tx) => {
    const shouldComplete =
      body.status === TaskStatus.COMPLETED;

    const shouldUncomplete =
      body.status !== undefined &&
      body.status !== TaskStatus.COMPLETED;

    const task = await tx.task.update({
      where: {
        taskId,
      },
      data: {
        ...(body.title !== undefined && {
          title: body.title,
        }),

        ...(body.priority !== undefined && {
          priority: body.priority,
        }),

        ...(sortOrder !== undefined && {
          sortOrder,
        }),

        ...(body.memo !== undefined && {
          memo: body.memo,
        }),

        ...(body.taskDate !== undefined && {
          taskDate: new Date(body.taskDate),
        }),

        ...(body.tagId !== undefined && {
          tagId: body.tagId,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),

        ...(shouldComplete && {
          completedAt: new Date(),
        }),

        ...(shouldUncomplete && {
          completedAt: null,
        }),
      },
      include: {
        tag: {
          select: {
            tagId: true,
            tagName: true,
            color: true,
            projectName: true,
          },
        },
      },
    });

    await this.syncReflectionTask(
      tx,
      task.taskId,
      userId,
      task.taskDate,
    );

    return task;
  });
}

  public async softDelete(taskId: string) {
    return prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: {
          taskId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.reflectionTask.deleteMany({
        where: {
          taskId,
        },
      });

      return task;
    });
  }

  public async existsActiveTagByIdAndUserId(
    tagId: string,
    userId: string,
  ) {
    const tag = await prisma.tag.findFirst({
      where: {
        tagId,
        userId,
        deletedAt: null,
      },
      select: {
        tagId: true,
      },
    });

    return !!tag;
  }

  /**
   * reorder 요청에 포함된 Task가 모두 현재 사용자 소유인지 확인하기 위한 조회
   */
  public async findTasksByIdsAndUserId(
    taskIds: string[],
    userId: string,
  ) {
    return prisma.task.findMany({
      where: {
        taskId: {
          in: taskIds,
        },
        userId,
        deletedAt: null,
      },
      select: {
        taskId: true,
      },
    });
  }

  /**
   * 여러 Task의 priority / sortOrder를 하나의 transaction으로 변경
   */
  public async reorderTasks(
    tasks: TaskReorderItem[],
  ): Promise<number> {
    await prisma.$transaction(
      tasks.map((task) =>
        prisma.task.update({
          where: {
            taskId: task.taskId,
          },
          data: {
            priority: task.priority,
            sortOrder: task.sortOrder,
          },
        }),
      ),
    );

    return tasks.length;
  }
}