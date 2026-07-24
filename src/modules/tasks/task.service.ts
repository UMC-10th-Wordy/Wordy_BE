import jwt from 'jsonwebtoken';
import { TaskRepository } from './task.repository';
import {
  CreateTaskRequest,
  TaskResponse,
  TaskWithResultResponse,
  UpdateTaskRequest,
} from './task.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';

interface AccessTokenPayload {
  userId: string;
  email: string;
}

class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, ErrorCode.UNAUTHORIZED.message);
  }
}

class BadRequestError extends ApiError {
  constructor(message: string) {
    super(ErrorCode.BAD_REQUEST.status, ErrorCode.BAD_REQUEST.code, message);
  }
}

class NotFoundError extends ApiError {
  constructor(message: string) {
    super(ErrorCode.NOT_FOUND.status, ErrorCode.NOT_FOUND.code, message);
  }
}

export class TaskService {
  private readonly taskRepository = new TaskRepository();

  public async getTasksByDate(
    authorization: string | undefined,
    date: string,
  ): Promise<TaskWithResultResponse[]> {
    const userId = this.getUserIdFromAuthorization(authorization);

    this.validateDate(date);

    const tasks = await this.taskRepository.findManyByUserIdAndDate(userId, new Date(date));
    return tasks as unknown as TaskWithResultResponse[];
  }

  public async createTask(
    authorization: string | undefined,
    body: CreateTaskRequest,
  ): Promise<TaskResponse> {
    const userId = this.getUserIdFromAuthorization(authorization);

    this.validateCreateTaskRequest(body);

    const existsTag = await this.taskRepository.existsActiveTagByIdAndUserId(
      body.tagId,
      userId,
    );

    if (!existsTag) {
      throw new BadRequestError('존재하지 않거나 사용할 수 없는 태그입니다.');
    }

    const task = await this.taskRepository.create(userId, body);
    return task as unknown as TaskResponse;
  }

  public async getTask(
    authorization: string | undefined,
    taskId: string,
  ): Promise<TaskWithResultResponse> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(taskId, userId);

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    return task as unknown as TaskWithResultResponse;
  }

  public async updateTask(
    authorization: string | undefined,
    taskId: string,
    body: UpdateTaskRequest,
  ): Promise<TaskResponse> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(taskId, userId);

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    this.validateUpdateTaskRequest(body);

    if (body.tagId !== undefined) {
      const existsTag = await this.taskRepository.existsActiveTagByIdAndUserId(
        body.tagId,
        userId,
      );

      if (!existsTag) {
        throw new BadRequestError('존재하지 않거나 사용할 수 없는 태그입니다.');
      }
    }

    const updatedTask = await this.taskRepository.update(taskId, body);
    return updatedTask as unknown as TaskResponse;
  }

  public async deleteTask(
    authorization: string | undefined,
    taskId: string,
  ): Promise<void> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(taskId, userId);

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    await this.taskRepository.softDelete(taskId);
  }

  private getUserIdFromAuthorization(authorization: string | undefined): string {
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

  private validateCreateTaskRequest(body: CreateTaskRequest) {
    if (!body.title || body.title.trim().length === 0) {
      throw new BadRequestError('업무카드 제목은 필수입니다.');
    }

    if (body.title.length > 100) {
      throw new BadRequestError('업무카드 제목은 100자 이하로 입력해주세요.');
    }

    if (!body.priority) {
      throw new BadRequestError('우선순위는 필수입니다.');
    }

    if (!body.taskDate) {
      throw new BadRequestError('업무 날짜는 필수입니다.');
    }

    this.validateDate(body.taskDate);

    if (!body.tagId) {
      throw new BadRequestError('태그는 필수입니다.');
    }
  }

  private validateUpdateTaskRequest(body: UpdateTaskRequest) {
    if (body.title !== undefined) {
      if (!body.title || body.title.trim().length === 0) {
        throw new BadRequestError('업무카드 제목은 비워둘 수 없습니다.');
      }

      if (body.title.length > 100) {
        throw new BadRequestError('업무카드 제목은 100자 이하로 입력해주세요.');
      }
    }

    if (body.taskDate !== undefined) {
      this.validateDate(body.taskDate);
    }
  }

  private validateDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestError('날짜 형식이 올바르지 않습니다.');
    }
  }
}