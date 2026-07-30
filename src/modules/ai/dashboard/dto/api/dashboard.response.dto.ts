import { Example } from "tsoa";

export class DashboardResponseDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
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

  @Example([
    {
      kpiName: "Swagger API 문서 작성",
      progress: "100%"
    },
    {
      kpiName: "AI 기능 구현",
      progress: "80%"
    }
  ])
  kpis!: DashboardKpiDto[];

  @Example([
    {
      tagName: "AI 기능 구현",
      objective: "제품의 AI 기능 개발 목표",
      expectedOutcome: "성과 미리보기 기능 완성",
      achievementStatus: "달성",
      insight: "AI 기반 업무 분석 기능을 구현하고 성과 정리를 완료했습니다."
    }
  ])
  tagAnalyses!: DashboardTagAnalysisDto[];
}

export class DashboardKpiDto {
  @Example("Swagger API 문서 작성")
  kpiName!: string;

  @Example("100%")
  progress!: string;
}

export class DashboardTagAnalysisDto {
  @Example("AI 기능 구현")
  tagName!: string;

  @Example("제품의 AI 기능 개발 목표")
  objective!: string;

  @Example("성과 미리보기 기능 완성")
  expectedOutcome!: string;

  @Example("달성")
  achievementStatus!: string;

  @Example("AI 기반 업무 분석 기능을 구현하고 성과 정리를 완료했습니다.")
  insight!: string;
}