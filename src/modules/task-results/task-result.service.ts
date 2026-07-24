import jwt from 'jsonwebtoken';
import { TaskRepository } from '../tasks/task.repository';
import { TaskStatus } from '../tasks/task.dto';
import { TaskResultRepository } from './task-result.repository';
import {
  TaskResultResponse,
  UpsertTaskResultRequest,
} from './task-result.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';

interface AccessTokenPayload {
  userId: string;
  email: string;
}

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
    body: UpsertTaskResultRequest,
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

    const content = body.content?.trim();

    if (!content) {
      throw new BadRequestError('업무 결과 내용은 필수입니다.');
    }

    const taskResult = await this.taskResultRepository.upsert(
      taskId,
      content,
    );

    return taskResult as TaskResultResponse;
  }

  private getUserIdFromAuthorization(
    authorization: string | undefined,
  ): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET!,
      ) as AccessTokenPayload;

      return payload.userId;
    } catch {
      throw new UnauthorizedError();
    }
  }
}