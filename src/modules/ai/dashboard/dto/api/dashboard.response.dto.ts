import { Example } from "tsoa";

export class DashboardResponseDto {
  @Example("dashboard-550e8400")
  dashboardId!: string;

  @Example("2026-07-07")
  startDate!: string;

  @Example("2026-07-13")
  endDate!: string;

  @Example("이번 주에는 Swagger 문서화와 AI 성과 미리보기 기능을 구현했습니다.")
  summary!: string;

  @Example(7)
  journalDays!: number;

  @Example(12)
  performanceCount!: number;

  @Example(3)
  tagCount!: number;

  kpis!: DashboardKpiDto[];
  tagAnalyses!: DashboardTagAnalysisDto[];
  weeklyReflection!: WeeklyReflectionDto;
}

export class DashboardKpiDto {
  @Example("Swagger API 문서 작성")
  kpiName!: string;

  @Example("100%")
  progress!: string;
}

export class DashboardTagAnalysisDto {
  @Example("AI 기능 구현")
  goal!: string;

  @Example("성과 미리보기 기능 완성")
  expectedOutcome!: string;

  @Example(8)
  taskCount!: number;

  @Example("달성")
  achievementStatus!: string;
}

export class WeeklyReflectionDto {
  @Example("AI 기능 개발과 문서화를 완료했다.")
  workSummary!: string;

  @Example("OpenAI API, Prisma, TSOA")
  resourcesUsed!: string;

  @Example("Prompt 설계와 응답 파싱 구조를 익혔다.")
  learning!: string;
}