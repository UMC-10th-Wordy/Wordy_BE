import { Example } from 'tsoa';

export class CreateDailyEntryRequest {
  @Example('2026-07-24')
  entryDate!: string;

  @Example('오늘 업무 결과 API 구현과 Swagger 문서화를 완료했다.')
  reflectionContent!: string;
}

export class CreateDailyEntryResponse {
  @Example('550e8400-e29b-41d4-a716-446655440000')
  dailyEntryId!: string;

  @Example('2026-07-24')
  entryDate!: string;

  @Example('오늘 업무 결과 API 구현과 Swagger 문서화를 완료했다.')
  reflectionContent!: string;

  @Example(3)
  linkedTaskCount!: number;

  createdAt!: Date;
}