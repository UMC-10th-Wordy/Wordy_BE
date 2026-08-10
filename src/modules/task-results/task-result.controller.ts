import {
  Controller,
  Example,
  FormField,
  Header,
  Path,
  Put,
  Route,
  Tags,
  UploadedFiles,
} from 'tsoa';
import { TaskResultService } from './task-result.service.js';
import { FileType, TaskResultResponse } from './task-result.dto.js';
import { ApiResponse } from '../../common/responses/api.response.js';
import { success } from '../../common/responses/response.js';
import { SuccessCode } from '../../common/responses/success.code.js';

@Route('workspaces/{workspaceId}/tasks')
@Tags('Task Results')
export class TaskResultController extends Controller {
  private readonly taskResultService = new TaskResultService();

  /**
   * content와 함께 첨부파일 multipart/form-data로 첨부 가능.
   * removedAttachmentIds에 삭제할 attachmentId 배열을 JSON 문자열로 담아 보내면 해당 첨부파일은 삭제되고,
   * files로 넘긴 파일은 새로 추가됩.
   * files는 GCS 버킷에 업로드되며, 파일명 충돌을 피하기 위해 원본 파일명이 아닌 난수(UUID) 파일명으로 저장되고
   * 그 공개 URL이 fileUrl로 반환/저장됨.
   * @summary 업무 결과 작성 및 수정
   * @example removedAttachmentIds '["b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10"]'
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
      attachments: [
        {
          attachmentId: 'b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10',
          fileType: FileType.IMG,
          fileUrl:
            'https://storage.googleapis.com/wordy-gsc/task-results/b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10.png',
          fileName: 'result.png',
        },
      ],
      createdAt: new Date('2026-07-23T12:00:00.000Z'),
      updatedAt: new Date('2026-07-23T12:30:00.000Z'),
    },
  })
  public async upsertTaskResult(
    @Header('authorization') authorization: string,
    @Path() workspaceId: string,
    @Path() taskId: string,
    @FormField() content: string,
    @FormField() removedAttachmentIds?: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ApiResponse<TaskResultResponse>> {
    const data = await this.taskResultService.upsertTaskResult(
      authorization,
      workspaceId,
      taskId,
      content,
      removedAttachmentIds,
      files ?? [],
    );

    return success(
      SuccessCode.UPDATED.code,
      '업무 결과가 저장되었습니다.',
      data,
    );
  }
}