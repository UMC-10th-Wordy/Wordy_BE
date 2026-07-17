import { Example } from "tsoa";

export class DashboardRequestDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  userId!: string;

  @Example("2026-07-07")
  startDate!: string;

  @Example("2026-07-13")
  endDate!: string;
}