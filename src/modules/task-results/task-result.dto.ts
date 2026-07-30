import { Example } from 'tsoa';

export enum FileType {
  FILE = 'FILE',
  IMG = 'IMG',
}

export class UpsertTaskResultRequest {
  content!: string;
  removedAttachmentIds?: string[];
}

export class AttachmentResponse {
  @Example('b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10')
  attachmentId!: string;

  @Example(FileType.IMG)
  fileType!: FileType;

  @Example(
    'https://storage.googleapis.com/wordy-gsc/task-results/b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10.png',
  )
  fileUrl!: string;

  @Example('result.png')
  fileName!: string;
}

export class TaskResultResponse {
  @Example('f3a1e4c2-31b5-46f4-b134-a0e238a1ad01')
  taskResultId!: string;

  @Example('0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a')
  taskId!: string;

  @Example('백엔드 API 구현 및 Swagger 문서화를 완료했습니다.')
  content!: string;

  @Example([
    {
      attachmentId: 'b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10',
      fileType: FileType.IMG,
      fileUrl:
        'https://storage.googleapis.com/wordy-gsc/task-results/b4b6b402-6c1a-4b2a-9b0a-2f6b1b9f2b10.png',
      fileName: 'result.png',
    },
  ])
  attachments!: AttachmentResponse[];

  @Example('2026-07-23T12:00:00.000Z')
  createdAt!: Date;

  @Example('2026-07-23T12:30:00.000Z')
  updatedAt!: Date;
}