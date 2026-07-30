import { prisma } from '../../db.config.js';
import { FileType } from '../../generated/prisma/client.js';

export interface AttachmentInput {
  fileType: FileType;
  fileUrl: string;
  fileName: string;
}

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

  public async softDeleteAttachments(
    taskResultId: string,
    attachmentIds: string[],
  ) {
    if (attachmentIds.length === 0) return;

    await prisma.attachment.updateMany({
      where: {
        attachmentId: { in: attachmentIds },
        taskResultId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }

  public async createAttachments(
    taskResultId: string,
    attachments: AttachmentInput[],
  ) {
    if (attachments.length === 0) return;

    await prisma.attachment.createMany({
      data: attachments.map((attachment) => ({
        ...attachment,
        taskResultId,
      })),
    });
  }

  public async findActiveAttachments(taskResultId: string) {
    return prisma.attachment.findMany({
      where: { taskResultId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }
}