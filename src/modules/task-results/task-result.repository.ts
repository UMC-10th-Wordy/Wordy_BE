import { prisma } from '../../db.config';

export class TaskResultRepository {
  public async upsert(taskId: string, content: string) {
    return prisma.taskResult.upsert({
      where: {
        taskId,
      },
      create: {
        taskId,
        content,
      },
      update: {
        content,
        deletedAt: null,
      },
    });
  }
}