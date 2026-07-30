import { Example } from "tsoa";

// 생성 조건 충족 여부
export class EligibilityResponse {
  @Example(true)
  eligible!: boolean; // 생성 가능 여부

  @Example(5)
  journalDays!: number; // 이번 주 작성한 일지 수

  @Example(3)
  requiredDays!: number; // 생성에 필요한 최소 일지 수

  @Example("2026-07-20")
  weekStart!: string; // 이번 주 시작일 (YYYY-MM-DD)

  @Example("2026-07-26")
  weekEnd!: string; // 이번 주 종료일 (YYYY-MM-DD)

  @Example([
    {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
      entryDate: "2026-07-20",
    },
  ])
  entries!: DailyEntryItem[];
}
// 날짜 형식은 웬만하면 YYYY-MM-DD

// 대시보드 목록의 각 항목
export class DashboardListItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dashboardId!: string;

  @Example("2026-07-20")
  startDate!: string;

  @Example("2026-07-26")
  endDate!: string;

  @Example("이번 주 업무 성과 및 회고 요약")
  summary!: string;

  @Example("2026-07-26T12:00:00Z")
  createdAt!: string;
}

// 대시보드 상세 (완성 화면)
export class DashboardDetail {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dashboardId!: string;

  @Example("2026-07-20")
  startDate!: string;

  @Example("2026-07-26")
  endDate!: string;

  @Example("이번 주 업무 성과 및 회고 요약")
  summary!: string;

  @Example(5)
  journalDays!: number;

  @Example(8)
  performanceCount!: number;

  @Example(3)
  tagCount!: number;

  @Example([
    {
      journalDays: 5,
      performanceCount: 8,
      tagCount: 3,
    },
  ])
  insights!: Insight[];

  @Example([
    {
      kpiName: "API 성능 개선",
      progress: "80%",
    },
  ])
  kpis!: Kpi[];

  @Example([
    {
      goal: "백엔드 성능 개선",
      expectedOutcome: "응답 속도 개선",
      taskCount: 5,
      periodStart: "2026-07-20",
      periodEnd: "2026-07-26",
      achievementStatus: "완료",
    },
  ])
  tagAnalyses!: TagAnalysis[];

  @Example([
    {
      workSummary: "주요 기능 개발 완료",
      resourcesUsed: "개발 시간 30시간",
      learning: "Prisma relation 설계 경험",
    },
  ])
  weeklyReflections!: WeeklyReflection[];

  @Example([
    {
      achievementRate: 95,
      summary: "JWT 인증 기능 개발 완료",
      growthInsight: {
        insight: "인증 구조 이해도 향상",
      },
      nextAction: {
        action: "Refresh Token 개선",
      },
      items: [],
    },
  ])
  performances!: PerformanceDto[];
}


export class Insight {
  @Example(5)
  journalDays!: number;

  @Example(8)
  performanceCount!: number;

  @Example(3)
  tagCount!: number;
}

export class Kpi {
  @Example("API 성능 개선")
  kpiName!: string | null;

  @Example("80%")
  progress!: string | null;
}

export class TagAnalysis {
  @Example("백엔드 성능 개선")
  goal!: string | null;

  @Example("API 응답 시간 감소")
  expectedOutcome!: string | null;

  @Example(5)
  taskCount!: number | null;

  @Example("2026-07-20")
  periodStart!: string | null;

  @Example("2026-07-26")
  periodEnd!: string | null;

  @Example("COMPLETED")
  achievementStatus!: string | null;
}

export class WeeklyReflection {
  @Example("이번 주 주요 업무 진행 내용 정리")
  workSummary!: string | null;

  @Example("개발 시간 30시간 사용")
  resourcesUsed!: string | null;

  @Example("새로운 기술과 설계 방식 학습")
  learning!: string | null;
}

// 주간 회고 작성 요청
export class CreateWeeklyReflectionRequest {
  @Example("이번 주 업무 정리")
  workSummary?: string; // 이번 주 업무 정리

  @Example("개발 시간 및 사용 리소스")
  resourcesUsed?: string; // 사용한 시간/리소스

  @Example("배우고 느낀 점")
  learning?: string; // 배우고 느낀 점
}

// 성과 항목 (output, impact) — 스키마상 Json 타입
export class PerformanceItemDto {
  @Example({
    title: "로그인 API 구현",
    detail: "JWT 인증 로직 추가",
  })
  output: any;

  @Example({
    description: "사용자 인증 안정성 향상",
  })
  impact: any;
}

// 일일 성과 요약
export class PerformanceDto {
  @Example(95)
  achievementRate!: number;

  @Example("회원 인증 기능 개발 완료")
  summary!: string;

  @Example({
    insight: "인증 구조 이해도 향상",
  })
  growthInsight: any; // 스키마상 Json

  @Example({
    action: "Refresh Token 개선 필요",
  })
  nextAction: any; // 스키마상 Json

  @Example([
    {
      output: {
        title: "JWT 인증 구현",
      },
      impact: {
        description: "보안성 향상",
      },
    },
  ])
  items!: PerformanceItemDto[];
}

// 일지 항목 (생성에 사용할 업무 일지)
export class DailyEntryItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;

  @Example("2026-07-20")
  entryDate!: string;
}