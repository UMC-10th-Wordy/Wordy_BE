import { Example } from "tsoa";

export class KpiRequestDto {
  @Example("AI 업무 관리")
  tagName!: string;

  @Example("Wordy")
  projectName!: string;

  @Example("업무 생산성 향상")
  goal!: string;

  @Example("사용자가 매일 업무를 기록하고 성과를 확인할 수 있다.")
  expectedOutcome!: string;

  @Example("4주")
  period?: string;

  @Example("백엔드 개발자")
  userJob!: string;
}