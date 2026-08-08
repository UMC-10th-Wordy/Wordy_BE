import { Example } from "tsoa";

export class TrashDailyEntryItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;

  @Example("2026-07-31")
  entryDate!: string;

  @Example("오늘 업무에서 잘한 점과 아쉬운 점을 정리했다.")
  reflectionContent!: string;

  @Example("2026-08-01T12:34:56.000Z")
  deletedAt!: Date;
}

export class TrashDailyEntryListResponse {
  items!: TrashDailyEntryItem[];

  @Example(1)
  page!: number;

  @Example(10)
  size!: number;

  @Example(23)
  totalCount!: number;

  @Example(3)
  totalPages!: number;

  @Example(true)
  hasNext!: boolean;
}