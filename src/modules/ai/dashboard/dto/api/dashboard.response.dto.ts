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

  @Example("AI 성과 미리보기 기능을 구현하고 실제 데이터 기반 분석 흐름을 완성했습니다.")
  keyAchievement!: string;

  @Example([
    {
      tagId: "550e8400-e29b-41d4-a716-446655440000",
      tagName: "AI 업무 관리",
    },
    {
      tagId: "660e8400-e29b-41d4-a716-446655440000",
      tagName: "백엔드 개발",
    },
  ])
  focusedTags!: FocusedTagDto[];

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

export class FocusedTagDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  tagId!: string;

  @Example("AI 업무 관리")
  tagName!: string;
}

export class DashboardKpiDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  tagId!: string;

  @Example("Swagger API 문서 작성")
  kpiName!: string;

  @Example("100%")
  progress!: string;

  @Example("Swagger API 문서화를 완료하여 목표를 달성했습니다.")
  relatedAchievement!: string;
}

export class DashboardTagAnalysisDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  tagId!: string;

  @Example("AI 기능 구현")
  tagName!: string;

  @Example('#4F46E5')
  color!: string;

  @Example("제품의 AI 기능 개발 목표")
  objective!: string;

  @Example("성과 미리보기 기능 완성")
  expectedOutcome!: string;

  @Example("달성")
  achievementStatus!: string;

  @Example("AI 기반 업무 분석 기능을 구현하고 성과 정리를 완료했습니다.")
  insight!: string;

  @Example(3)
  taskCount!: number;
}