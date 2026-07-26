import { Example } from "tsoa";

export class DashboardRequestDto {

  @Example("2026-07-07")
  startDate!: string;

  @Example("2026-07-13")
  endDate!: string;
}