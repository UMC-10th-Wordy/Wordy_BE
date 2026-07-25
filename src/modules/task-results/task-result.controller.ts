import {
  Body,
  Controller,
  Example,
  Header,
  Path,
  Put,
  Route,
  Tags,
} from 'tsoa';
import { TaskResultService } from './task-result.service';
import {
  TaskResultResponse,
  UpsertTaskResultRequest,
} from './task-result.dto';
import { ApiResponse } from '../../common/responses/api.response';
import { success } from '../../common/responses/response';
import { SuccessCode } from '../../common/responses/success.code';

@Route('tasks')
@Tags('Task Results')
export class TaskResultController extends Controller {
  private readonly taskResultService = new TaskResultService();

  /**
   * @summary 업무 결과 작성 및 수정
   */
  @Put('{taskId}/result')
  @Example<ApiResponse<TaskResultResponse>>({
    success: true,
    code: 'S200',
    message: '업무 결과가 저장되었습니다.',
    result: {
      taskResultId: 'f3a1e4c2-31b5-46f4-b134-a0e238a1ad01',
      taskId: '0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a',
      content: '백엔드 API 구현 및 Swagger 문서화를 완료했습니다.',
      createdAt: new Date('2026-07-23T12:00:00.000Z'),
      updatedAt: new Date('2026-07-23T12:30:00.000Z'),
    },
  })
  public async upsertTaskResult(
    @Header('authorization') authorization: string,
    @Path() taskId: string,
    @Body() body: UpsertTaskResultRequest,
  ): Promise<ApiResponse<TaskResultResponse>> {
    const data = await this.taskResultService.upsertTaskResult(
      authorization,
      taskId,
      body,
    );

    return success(
      SuccessCode.UPDATED.code,
      '업무 결과가 저장되었습니다.',
      data,
    );
  }
}