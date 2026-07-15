import {
  Body,
  Controller,
  Delete,
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
import {
  TaskApiResponseDto,
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from './task.dto';

@Route('tasks')
@Tags('Tasks')
export class TaskController extends Controller {
  private readonly taskService = new TaskService();

  @Get()
  public async getTasksByDate(
    @Header('authorization') authorization: string,
    @Query() date: string,
  ): Promise<TaskApiResponseDto<TaskResponse[]>> {
    try {
      return await this.taskService.getTasksByDate(authorization, date);
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Post()
  public async createTask(
    @Header('authorization') authorization: string,
    @Body() body: CreateTaskRequest,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
    try {
      this.setStatus(201);
      return await this.taskService.createTask(authorization, body);
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Get('{taskId}')
  public async getTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
    try {
      return await this.taskService.getTask(authorization, taskId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Patch('{taskId}')
  public async updateTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
    @Body() body: UpdateTaskRequest,
  ): Promise<TaskApiResponseDto<TaskResponse>> {
    try {
      return await this.taskService.updateTask(authorization, taskId, body);
    } catch (error) {
      return this.handleError(error);
    }
  }

  @Delete('{taskId}')
  public async deleteTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<TaskApiResponseDto<null>> {
    try {
      return await this.taskService.deleteTask(authorization, taskId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): TaskApiResponseDto<any> {
    const statusCode =
      error instanceof Error && 'statusCode' in error
        ? Number((error as any).statusCode)
        : 500;

    this.setStatus(statusCode);

    return {
      success: false,
      statusCode,
      message: error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      data: null,
    };
  }
}