import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Query,
  Route,
  Tags,
} from 'tsoa';
import { TaskService } from './task.service';
import { CreateTaskRequest, TaskResponse, TaskWithResultResponse, UpdateTaskRequest, TaskPriority, TaskStatus } from './task.dto';
import { ApiResponse } from '../../common/responses/api.response';
import { success } from '../../common/responses/response';
import { SuccessCode } from '../../common/responses/success.code';

@Route('tasks')
@Tags('Tasks')
export class TaskController extends Controller {
  private readonly taskService = new TaskService();

/**
 * 특정 날짜의 업무카드 목록을 조회합니다.
 *
 * @summary 날짜별 업무카드 목록 조회
 * @param date 조회 날짜는 YYYY-MM-DD 형식으로 전달합니다. 예: /tasks?date=2026-07-21
 */
  @Get()
  @Example<ApiResponse<TaskWithResultResponse[]>>({
    success: true,
    code: "COMMON200",
    message: "업무카드 목록 조회가 완료되었습니다.",
    result: [
      {
        taskId: '0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a',
        title: '백엔드 API 구현',
        priority: TaskPriority.MUST_DO,
        memo: 'Swagger Example 추가',
        status: TaskStatus.COMPLETED,
        taskDate: new Date('2026-07-21'),
        completedAt: new Date('2026-07-21T14:30:00.000Z'),
        createdAt: new Date('2026-07-20T09:00:00.000Z'),
        updatedAt: new Date('2026-07-21T14:40:00.000Z'),
        deletedAt: null,
        userId: '5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a',
        tagId: '7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2',
        tag: {
          tagId: '7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2',
          tagName: 'Wordy',
          color: '#4F46E5',
          projectName: 'Wordy 프로젝트',
        },
        taskResult: {
          taskResultId: 'f3a1e4c2-31b5-46f4-b134-a0e238a1ad01',
          taskId: '0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a',
          content: '백엔드 API 구현 및 Swagger 문서화를 완료했습니다.',
          createdAt: new Date('2026-07-21T14:30:00.000Z'),
          updatedAt: new Date('2026-07-21T14:40:00.000Z'),
        },
      },

      {
        taskId: '1a6d55f5-48c0-4a6d-8f43-9ef5c41d2e6b',
        title: '프론트 연동 테스트',
        priority: TaskPriority.SHOULD_DO,
        memo: null,
        status: TaskStatus.IN_PROGRESS,
        taskDate: new Date('2026-07-21'),
        completedAt: null,
        createdAt: new Date('2026-07-21T09:00:00.000Z'),
        updatedAt: new Date('2026-07-21T09:00:00.000Z'),
        deletedAt: null,
        userId: '5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a',
        tagId: '7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2',
        tag: {
          tagId: '7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2',
          tagName: 'Wordy',
          color: '#4F46E5',
          projectName: 'Wordy 프로젝트',
        },
        taskResult: null,
      },
    ],
  })
  public async getTasksByDate(
    @Header('authorization') authorization: string,
    @Query() date: string,
): Promise<ApiResponse<TaskWithResultResponse[]>> {
    const data = await this.taskService.getTasksByDate(authorization, date);
    return success(SuccessCode.GET_SUCCESS.code, '업무카드 목록 조회가 완료되었습니다.', data);
  }

  /**
   * @summary 업무카드 생성
   */
  @Post()
  @Example<CreateTaskRequest>({
    title: "백엔드 API 구현",
    priority: TaskPriority.MUST_DO,
    taskDate: "2026-07-21",
    tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
    memo: "Swagger Example 추가",
  })
  @Example<ApiResponse<TaskResponse>>({
    success: true,
    code: "COMMON201",
    message: "업무카드가 생성되었습니다.",
    result: {
      taskId: "0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a",
      title: "백엔드 API 구현",
      priority: TaskPriority.MUST_DO,
      memo: "Swagger Example 추가",
      status: TaskStatus.IN_PROGRESS,
      taskDate: new Date("2026-07-21"),
      completedAt: null,
      createdAt: new Date("2026-07-21T09:00:00.000Z"),
      updatedAt: new Date("2026-07-21T09:00:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      tag: {
        tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
        tagName: "Wordy",
        color: "#4F46E5",
        projectName: "Wordy 프로젝트",
      },
    },
  })
  public async createTask(
    @Header('authorization') authorization: string,
    @Body() body: CreateTaskRequest,
  ): Promise<ApiResponse<TaskResponse>> {
    const data = await this.taskService.createTask(authorization, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, '업무카드가 생성되었습니다.', data);
  }

  /**
   * @summary 업무카드 상세 조회
   */
  @Get('{taskId}')
  @Example<ApiResponse<TaskWithResultResponse>>({
    success: true,
    code: "COMMON200",
    message: "업무카드 상세 조회가 완료되었습니다.",
    result: {
      taskId: "0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a",
      title: "백엔드 API 구현",
      priority: TaskPriority.MUST_DO,
      memo: "Swagger Example 추가",
      status: TaskStatus.IN_PROGRESS,
      taskDate: new Date("2026-07-21"),
      completedAt: null,
      createdAt: new Date("2026-07-20T09:00:00.000Z"),
      updatedAt: new Date("2026-07-21T10:15:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      tag: {
        tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
        tagName: "Wordy",
        color: "#4F46E5",
        projectName: "Wordy 프로젝트",
      },
      taskResult: {
      taskResultId: 'f3a1e4c2-31b5-46f4-b134-a0e238a1ad01',
      taskId: '0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a',
      content: '백엔드 API 구현 및 Swagger 문서화를 완료했습니다.',
      createdAt: new Date('2026-07-21T14:30:00.000Z'),
      updatedAt: new Date('2026-07-21T14:40:00.000Z'),
      },
    },
  })
  public async getTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<ApiResponse<TaskWithResultResponse>> {
    const data = await this.taskService.getTask(authorization, taskId);
    return success(SuccessCode.GET_SUCCESS.code, '업무카드 상세 조회가 완료되었습니다.', data);
  }

  /**
   * @summary 업무카드 수정
   */
  @Patch('{taskId}')
  @Example<UpdateTaskRequest>({
    title: "백엔드 API 수정",
    priority: TaskPriority.SHOULD_DO,
    status: TaskStatus.COMPLETED,
    taskDate: "2026-07-22",
    tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
    memo: "메모 수정",
  })
  @Example<ApiResponse<TaskResponse>>({
    success: true,
    code: "COMMON200",
    message: "업무카드가 수정되었습니다.",
    result: {
      taskId: "0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a",
      title: "백엔드 API 수정",
      priority: TaskPriority.SHOULD_DO,
      memo: "메모 수정",
      status: TaskStatus.COMPLETED,
      taskDate: new Date("2026-07-22"),
      completedAt: new Date("2026-07-22T14:30:00.000Z"),
      createdAt: new Date("2026-07-20T09:00:00.000Z"),
      updatedAt: new Date("2026-07-22T14:30:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      tag: {
        tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
        tagName: "Wordy",
        color: "#4F46E5",
        projectName: "Wordy 프로젝트",
      },
    },
  })
  public async updateTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
    @Body() body: UpdateTaskRequest,
  ): Promise<ApiResponse<TaskResponse>> {
    const data = await this.taskService.updateTask(authorization, taskId, body);
    return success(SuccessCode.UPDATED.code, '업무카드가 수정되었습니다.', data);
  }

  /**
   * @summary 업무카드 삭제
   */
  @Delete('{taskId}')
  @Example<ApiResponse<null>>({
    success: true,
    code: "COMMON204",
    message: "업무카드가 삭제되었습니다.",
    result: null,
  })
  public async deleteTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<ApiResponse<null>> {
    await this.taskService.deleteTask(authorization, taskId);
    return success(SuccessCode.DELETED.code, '업무카드가 삭제되었습니다.', null);
  }
}