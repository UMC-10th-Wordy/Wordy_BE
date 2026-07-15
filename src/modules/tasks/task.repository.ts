import { prisma } from '../../db.config';
import { CreateTaskRequest, UpdateTaskRequest, TaskStatus } from './task.dto';


export class TaskRepository {
  public async findManyByUserIdAndDate(userId: string, taskDate: Date) {
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  public async findActiveByIdAndUserId(taskId: string, userId: string) {
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
      },
    });
  }

  public async create(userId: string, body: CreateTaskRequest) {
    return prisma.task.create({
      data: {
        userId,
        title: body.title,
        priority: body.priority,
        memo: body.memo,
        taskDate: new Date(body.taskDate),
        tagId: body.tagId,
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
  }

  public async update(taskId: string, body: UpdateTaskRequest) {
    const shouldComplete = body.status === TaskStatus.COMPLETED;
    const shouldUncomplete =
        body.status !== undefined && body.status !== TaskStatus.COMPLETED;

    return prisma.task.update({
      where: {
        taskId,
      },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.memo !== undefined && { memo: body.memo }),
        ...(body.taskDate !== undefined && { taskDate: new Date(body.taskDate) }),
        ...(body.tagId !== undefined && { tagId: body.tagId }),
        ...(body.status !== undefined && { status: body.status }),
        ...(shouldComplete && { completedAt: new Date() }),
        ...(shouldUncomplete && { completedAt: null }),
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
  }

  public async softDelete(taskId: string) {
    return prisma.task.update({
      where: {
        taskId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async existsActiveTagByIdAndUserId(tagId: string, userId: string) {
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
}