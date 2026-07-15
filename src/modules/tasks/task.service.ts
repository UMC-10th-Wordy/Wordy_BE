import jwt from 'jsonwebtoken';
import { TaskRepository } from './task.repository';
import {
  TaskApiResponseDto,
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from './task.dto';

interface AccessTokenPayload {
  userId: string;
  email: string;
}

class UnauthorizedError extends Error {
  public statusCode = 401;

  constructor() {
    super('인증이 필요합니다.');
  }
}

class BadRequestError extends Error {
  public statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

class NotFoundError extends Error {
  public statusCode = 404;

  constructor(message: string) {
    super(message);
  }
}

export class TaskService {
  private readonly taskRepository = new TaskRepository();

  public async getTasksByDate(
    authorization: string | undefined,
    date: string,
  ): Promise<TaskApiResponseDto<TaskResponse[]>> {
    const userId = this.getUserIdFromAuthorization(authorization);

    this.validateDate(date);

    const tasks = await this.taskRepository.findManyByUserIdAndDate(
      userId,
      new Date(date),
    );

    return {
      success: true,
      statusCode: 200,
      message: '업무카드 목록 조회가 완료되었습니다.',
      data: tasks,
    };
  }

  public async createTask(
    authorization: string | undefined,
    body: CreateTaskRequest,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
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

    return {
      success: true,
      statusCode: 201,
      message: '업무카드가 생성되었습니다.',
      data: task,
    };
  }

  public async getTask(
    authorization: string | undefined,
    taskId: string,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(taskId, userId);

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    return {
      success: true,
      statusCode: 200,
      message: '업무카드 상세 조회가 완료되었습니다.',
      data: task,
    };
  }

  public async updateTask(
    authorization: string | undefined,
    taskId: string,
    body: UpdateTaskRequest,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
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

    return {
      success: true,
      statusCode: 200,
      message: '업무카드가 수정되었습니다.',
      data: updatedTask,
    };
  }

  public async deleteTask(
    authorization: string | undefined,
    taskId: string,
  ): Promise<TaskApiResponseDto<null>> {
    const userId = this.getUserIdFromAuthorization(authorization);

    const task = await this.taskRepository.findActiveByIdAndUserId(taskId, userId);

    if (!task) {
      throw new NotFoundError('업무카드를 찾을 수 없습니다.');
    }

    await this.taskRepository.softDelete(taskId);

    return {
      success: true,
      statusCode: 200,
      message: '업무카드가 삭제되었습니다.',
      data: null,
    };
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