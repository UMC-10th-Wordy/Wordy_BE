import { randomUUID } from 'crypto';
import path from 'path';
import { TaskRepository } from '../tasks/task.repository';
import { TaskStatus } from '../tasks/task.dto';
import { AttachmentInput, TaskResultRepository } from './task-result.repository';
import { FileType, TaskResultResponse } from './task-result.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';
import { uploadToGcs } from '../../common/storage/gcs.storage';
import { verifyAccessToken } from '../../auth.config';

class UnauthorizedError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      ErrorCode.UNAUTHORIZED.message,
    );
  }
}

class BadRequestError extends ApiError {
  constructor(message: string) {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      message,
    );
  }
}

class NotFoundError extends ApiError {
  constructor(message: string) {
    super(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      message,
    );
  }
}

export class TaskResultService {
  private readonly taskRepository = new TaskRepository();
  private readonly taskResultRepository = new TaskResultRepository();

  public async upsertTaskResult(
    authorization: string | undefined,
    taskId: string,
    content: string,
    removedAttachmentIds: string | undefined,
    files: Express.Multer.File[],
  ): Promise<TaskResultResponse> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(
      taskId,
      userId,
    );

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    if (task.status !== TaskStatus.COMPLETED) {
      throw new BadRequestError(
        '완료된 업무카드에만 업무 결과를 작성할 수 있습니다.',
      );
    }

    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      throw new BadRequestError('업무 결과 내용은 필수입니다.');
    }

    const taskResult = await this.taskResultRepository.upsert(
      taskId,
      trimmedContent,
    );

    await this.taskResultRepository.softDeleteAttachments(
      taskResult.taskResultId,
      this.parseRemovedAttachmentIds(removedAttachmentIds),
    );

    const newAttachments = await this.saveAttachments(files);
    await this.taskResultRepository.createAttachments(
      taskResult.taskResultId,
      newAttachments,
    );

    const attachments = await this.taskResultRepository.findActiveAttachments(
      taskResult.taskResultId,
    );

    return {
      ...taskResult,
      attachments,
    } as TaskResultResponse;
  }

  /**
   * removedAttachmentIds로 넘어온 JSON 배열 문자열을 파싱
   */
  private parseRemovedAttachmentIds(raw: string | undefined): string[] {
    if (!raw) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestError(
        'removedAttachmentIds는 JSON 배열 문자열이어야 합니다.',
      );
    }

    if (
      !Array.isArray(parsed) ||
      !parsed.every((id) => typeof id === 'string')
    ) {
      throw new BadRequestError(
        'removedAttachmentIds는 문자열 배열이어야 합니다.',
      );
    }

    return parsed;
  }

  /**
   * 첨부파일들을 디스크에 저장하고, DB에 넣을 형태(fileType/fileUrl/fileName)로 변환
   */
  private async saveAttachments(
    files: Express.Multer.File[],
  ): Promise<AttachmentInput[]> {
    if (files.length === 0) return [];

    return Promise.all(
      files.map(async (file) => {
        const extension = path.extname(file.originalname);
        const destination = `task-results/${randomUUID()}${extension}`;
        const fileUrl = await uploadToGcs(
          file.buffer,
          destination,
          file.mimetype,
        );

        return {
          fileType: file.mimetype.startsWith('image/')
            ? FileType.IMG
            : FileType.FILE,
          fileUrl,
          fileName: file.originalname,
        };
      }),
    );
  }

  private getUserIdFromAuthorization(
    authorization: string | undefined,
  ): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const payload = verifyAccessToken(token);

      return payload.userId;
    } catch {
      throw new UnauthorizedError();
    }
  }
}