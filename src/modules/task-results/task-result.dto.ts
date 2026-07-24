import { Example } from 'tsoa';

export class UpsertTaskResultRequest {
  @Example('백엔드 API 구현 및 Swagger 문서화를 완료했습니다.')
  content!: string;
}

export class TaskResultResponse {
  @Example('f3a1e4c2-31b5-46f4-b134-a0e238a1ad01')
  taskResultId!: string;

  @Example('0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a')
  taskId!: string;

  @Example('백엔드 API 구현 및 Swagger 문서화를 완료했습니다.')
  content!: string;

  @Example('2026-07-23T12:00:00.000Z')
  createdAt!: Date;

  @Example('2026-07-23T12:30:00.000Z')
  updatedAt!: Date;
}