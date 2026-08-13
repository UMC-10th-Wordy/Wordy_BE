import { TaskRepository } from './task.repository.js';
import {
  CreateTaskRequest,
  TaskCalendarDayResponse,
  TaskPriority,
  TaskReorderRequest,
  TaskReorderResponse,
  TaskResponse,
  TaskStatus,
  TaskWithResultResponse,
  UpdateTaskRequest,
} from './task.dto.js';
import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';
import { verifyAccessToken } from '../../auth.config.js';
import { Prisma } from '../../generated/prisma/client.js';

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

export class TaskService {
  private readonly taskRepository = new TaskRepository();

  public async getTasksByDate(
    authorization: string | undefined,
    workspaceId: string,
    date: string,
  ): Promise<TaskWithResultResponse[]> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    this.validateDate(date);

    const tasks =
      await this.taskRepository.findManyByUserIdAndDate(
        userId,
        workspaceId,
        new Date(date),
      );

    return tasks as unknown as TaskWithResultResponse[];
  }

    public async getCalendarSummary(
    authorization: string | undefined,
    workspaceId: string,
    startDate: string,
    endDate: string,
  ): Promise<TaskCalendarDayResponse[]> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    this.validateDate(startDate);
    this.validateDate(endDate);

    const start =
      new Date(`${startDate}T00:00:00.000Z`);

    const end =
      new Date(`${endDate}T00:00:00.000Z`);

    if (start.getTime() > end.getTime()) {
      throw new BadRequestError(
        '시작 날짜는 종료 날짜보다 이후일 수 없습니다.',
      );
    }

    const groupedTasks =
      await this.taskRepository.findCalendarSummary(
        userId,
        workspaceId,
        start,
        end,
      );

    const summaryMap =
      new Map<string, TaskCalendarDayResponse>();

    for (const group of groupedTasks) {
      const date =
        group.taskDate.toISOString().slice(0, 10);

      const existing =
        summaryMap.get(date) ?? {
          date,
          completedCount: 0,
          incompleteCount: 0,
        };

      if (group.status === TaskStatus.COMPLETED) {
        existing.completedCount +=
          group._count._all;
      } else {
        existing.incompleteCount +=
          group._count._all;
      }

      summaryMap.set(date, existing);
    }

    return Array.from(summaryMap.values());
  }

  public async createTask(
    authorization: string | undefined,
    workspaceId: string,
    body: CreateTaskRequest,
  ): Promise<TaskResponse> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    this.validateCreateTaskRequest(body);

    if (body.tagId !== undefined && body.tagId !== null) {
      const existsTag =
        await this.taskRepository.existsActiveTagByIdAndUserId(
          body.tagId,
          userId,
          workspaceId,
        );

      if (!existsTag) {
        throw new BadRequestError(
          '존재하지 않거나 사용할 수 없는 태그입니다.',
        );
      }
    }

    const taskDate = new Date(body.taskDate);

    /**
     * 새 업무는 해당 날짜 / priority 그룹의 맨 뒤에 배치
     */
    const sortOrder =
      await this.taskRepository.findNextSortOrder(
        userId,
        workspaceId,
        taskDate,
        body.priority,
      );

    const task = await this.taskRepository.create(
      userId,
      workspaceId,
      body,
      sortOrder,
    );

    return task as unknown as TaskResponse;
  }

  public async getTask(
    authorization: string | undefined,
    workspaceId: string,
    taskId: string,
  ): Promise<TaskWithResultResponse> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    const task =
      await this.taskRepository.findActiveByIdAndUserId(
        taskId,
        userId,
        workspaceId,
      );

    if (!task) {
      throw new NotFoundError(
        '업무카드를 찾을 수 없습니다.',
      );
    }

    return task as unknown as TaskWithResultResponse;
  }

  /**
   * 드래그 앤 드롭으로 업무 순서 및 우선순위를 변경합니다.
   */
  public async reorderTasks(
    authorization: string | undefined,
    workspaceId: string,
    body: TaskReorderRequest,
  ): Promise<TaskReorderResponse> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    this.validateReorderRequest(body);

    const taskIds =
      body.tasks.map((task) => task.taskId);

    const ownedTasks =
      await this.taskRepository.findTasksByIdsAndUserId(
        taskIds,
        userId,
        workspaceId,
      );

    /**
     * 존재하지 않거나 다른 사용자의 Task가 하나라도 포함되면 전체 요청 실패
     */
    if (ownedTasks.length !== taskIds.length) {
      throw new BadRequestError(
        '존재하지 않거나 수정할 수 없는 업무가 포함되어 있습니다.',
      );
    }

    const updatedCount =
      await this.taskRepository.reorderTasks(body.tasks);

    return {
      updatedCount,
    };
  }

  public async updateTask(
    authorization: string | undefined,
    workspaceId: string,
    taskId: string,
    body: UpdateTaskRequest,
  ): Promise<TaskResponse> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    const task =
      await this.taskRepository.findActiveByIdAndUserId(
        taskId,
        userId,
        workspaceId,
      );

    if (!task) {
      throw new NotFoundError(
        '업무카드를 찾을 수 없습니다.',
      );
    }

    this.validateUpdateTaskRequest(body);

    if (body.tagId !== undefined && body.tagId !== null) {
      const existsTag =
        await this.taskRepository.existsActiveTagByIdAndUserId(
          body.tagId,
          userId,
          workspaceId,
        );

      if (!existsTag) {
        throw new BadRequestError(
          '존재하지 않거나 사용할 수 없는 태그입니다.',
        );
      }
    }

    let nextSortOrder: number | undefined;

    /**
     * priority 또는 날짜가 변경되면
     * 새 날짜 / priority 그룹의 맨 뒤로 이동합니다.
     *
     * 예:
     * MUST_DO → SHOULD_DO
     * 오늘 → 내일
     */
    const targetPriority =
      body.priority ??
      (task.priority as TaskPriority);

    const targetTaskDate =
      body.taskDate !== undefined
        ? new Date(body.taskDate)
        : task.taskDate;

    const priorityChanged =
      body.priority !== undefined &&
      body.priority !== task.priority;

    const dateChanged =
      body.taskDate !== undefined &&
      targetTaskDate.getTime() !==
        task.taskDate.getTime();

    if (priorityChanged || dateChanged) {
      nextSortOrder =
        await this.taskRepository.findNextSortOrder(
          userId,
          workspaceId,
          targetTaskDate,
          targetPriority,
        );
    }

    const updatedTask =
      await this.taskRepository.update(
        taskId,
        userId,
        workspaceId,
        body,
        nextSortOrder,
      );

    return updatedTask as unknown as TaskResponse;
  }

  public async deleteTask(
    authorization: string | undefined,
    workspaceId: string,
    taskId: string,
  ): Promise<void> {
    const userId =
      this.getUserIdFromAuthorization(authorization);

    const task =
      await this.taskRepository.findActiveByIdAndUserId(
        taskId,
        userId,
        workspaceId,
      );

    if (!task) {
      throw new NotFoundError(
        '업무카드를 찾을 수 없습니다.',
      );
    }

    await this.taskRepository.softDelete(taskId);
  }

  private getUserIdFromAuthorization(
    authorization: string | undefined,
  ): string {
    if (
      !authorization ||
      !authorization.startsWith('Bearer ')
    ) {
      throw new UnauthorizedError();
    }

    const token =
      authorization.replace('Bearer ', '');

    try {
      const payload = verifyAccessToken(token);

      return payload.userId;
    } catch {
      throw new UnauthorizedError();
    }
  }

  private validateCreateTaskRequest(
    body: CreateTaskRequest,
  ) {
    if (
      !body.title ||
      body.title.trim().length === 0
    ) {
      throw new BadRequestError(
        '업무카드 제목은 필수입니다.',
      );
    }

    if (body.title.length > 100) {
      throw new BadRequestError(
        '업무카드 제목은 100자 이하로 입력해주세요.',
      );
    }

    if (!body.priority) {
      throw new BadRequestError(
        '우선순위는 필수입니다.',
      );
    }

    if (!body.taskDate) {
      throw new BadRequestError(
        '업무 날짜는 필수입니다.',
      );
    }

    this.validateDate(body.taskDate);
  }

  private validateUpdateTaskRequest(
    body: UpdateTaskRequest,
  ) {
    if (body.title !== undefined) {
      if (
        !body.title ||
        body.title.trim().length === 0
      ) {
        throw new BadRequestError(
          '업무카드 제목은 비워둘 수 없습니다.',
        );
      }

      if (body.title.length > 100) {
        throw new BadRequestError(
          '업무카드 제목은 100자 이하로 입력해주세요.',
        );
      }
    }

    if (body.taskDate !== undefined) {
      this.validateDate(body.taskDate);
    }
  }

  private validateReorderRequest(
    body: TaskReorderRequest,
  ) {
    if (
      !body.tasks ||
      !Array.isArray(body.tasks) ||
      body.tasks.length === 0
    ) {
      throw new BadRequestError(
        '변경할 업무가 존재하지 않습니다.',
      );
    }

    const taskIds =
      body.tasks.map((task) => task.taskId);

    const uniqueTaskIds =
      new Set(taskIds);

    if (
      uniqueTaskIds.size !== taskIds.length
    ) {
      throw new BadRequestError(
        '중복된 업무가 포함되어 있습니다.',
      );
    }

    const hasInvalidSortOrder =
      body.tasks.some(
        (task) =>
          !Number.isInteger(task.sortOrder) ||
          task.sortOrder < 0,
      );

    if (hasInvalidSortOrder) {
      throw new BadRequestError(
        '업무 순서는 0 이상의 정수여야 합니다.',
      );
    }

    /**
     * 같은 priority 안에서 동일한 sortOrder가 중복되는 요청 방지
     */
    const orderKeys =
      body.tasks.map(
        (task) =>
          `${task.priority}:${task.sortOrder}`,
      );

    const uniqueOrderKeys =
      new Set(orderKeys);

    if (
      uniqueOrderKeys.size !== orderKeys.length
    ) {
      throw new BadRequestError(
        '같은 우선순위 내에 중복된 업무 순서가 존재합니다.',
      );
    }
  }

  private validateDate(date: string) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      throw new BadRequestError(
        '날짜는 YYYY-MM-DD 형식으로 입력해주세요.',
      );
    }

    const parsedDate =
      new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate
        .toISOString()
        .slice(0, 10) !== date
    ) {
      throw new BadRequestError(
        '유효하지 않은 날짜입니다.',
      );
    }
  }
}