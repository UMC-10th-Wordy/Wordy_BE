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
import { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from './task.dto';
import { ApiResponse } from '../../common/responses/api.response';
import { success } from '../../common/responses/response';
import { SuccessCode } from '../../common/responses/success.code';

@Route('tasks')
@Tags('Tasks')
export class TaskController extends Controller {
  private readonly taskService = new TaskService();

  @Get()
  public async getTasksByDate(
    @Header('authorization') authorization: string,
    @Query() date: string,
  ): Promise<ApiResponse<TaskResponse[]>> {
    const data = await this.taskService.getTasksByDate(authorization, date);
    return success(SuccessCode.GET_SUCCESS.code, '업무카드 목록 조회가 완료되었습니다.', data);
  }

  @Post()
  public async createTask(
    @Header('authorization') authorization: string,
    @Body() body: CreateTaskRequest,
  ): Promise<ApiResponse<TaskResponse>> {
    const data = await this.taskService.createTask(authorization, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, '업무카드가 생성되었습니다.', data);
  }

  @Get('{taskId}')
  public async getTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<ApiResponse<TaskResponse>> {
    const data = await this.taskService.getTask(authorization, taskId);
    return success(SuccessCode.GET_SUCCESS.code, '업무카드 상세 조회가 완료되었습니다.', data);
  }

  @Patch('{taskId}')
  public async updateTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
    @Body() body: UpdateTaskRequest,
  ): Promise<ApiResponse<TaskResponse>> {
    const data = await this.taskService.updateTask(authorization, taskId, body);
    return success(SuccessCode.UPDATED.code, '업무카드가 수정되었습니다.', data);
  }

  @Delete('{taskId}')
  public async deleteTask(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
  ): Promise<ApiResponse<null>> {
    await this.taskService.deleteTask(authorization, taskId);
    return success(SuccessCode.DELETED.code, '업무카드가 삭제되었습니다.', null);
  }
}