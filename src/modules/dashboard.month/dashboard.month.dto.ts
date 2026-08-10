import { Example } from "tsoa";

// 월간 생성 조건 충족 여부
export class MonthlyEligibilityResponse {
  @Example("8c2d4f6a-7e91-4b23-a567-123456789abc")
  workspaceId!: string;

  @Example(true)
  eligible!: boolean; // 생성 가능 여부

  @Example(4)
  weeklyDashboardCount!: number; // 이번 달 주간 대시보드 수

  @Example(3)
  requiredCount!: number;

  @Example("2026-06-01")
  monthStart!: string;

  @Example("2026-06-30")
  monthEnd!: string;

  @Example([
    {
      dashboardId: "550e8400-e29b-41d4-a716-446655440000",
      startDate: "2026-06-01",
      endDate: "2026-06-07",
      summary: "첫째 주 업무 성과 요약",
    },
  ])
  weeklyDashboards!: WeeklyDashboardItem[]; // 재료가 될 주간 대시보드 목록
}


// 재료가 될 주간 대시보드 항목
export class WeeklyDashboardItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dashboardId!: string;

  @Example("2026-06-01")
  startDate!: string;

  @Example("2026-06-07")
  endDate!: string;

  @Example("첫째 주 업무 성과 요약")
  summary!: string;
}


// 월간 대시보드 목록의 각 항목
export class MonthlyDashboardListItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dashboardId!: string;

  @Example("8c2d4f6a-7e91-4b23-a567-123456789abc")
  workspaceId!: string;

  @Example("2026-06-01")
  startDate!: string;

  @Example("2026-06-30")
  endDate!: string;

  @Example("이번 달 업무 성과 및 회고 요약")
  summary!: string;

  @Example("2026-06-30T10:00:00.000Z")
  createdAt!: string;
}


// 월간 대시보드 상세 (완성 화면)
export class MonthlyDashboardDetail {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dashboardId!: string;

  @Example("8c2d4f6a-7e91-4b23-a567-123456789abc")
  workspaceId!: string;

  @Example("2026-06-01")
  startDate!: string;

  @Example("2026-06-30")
  endDate!: string;

  @Example("이번 달 업무 성과 및 회고 요약")
  summary!: string;

  @Example(20)
  journalDays!: number;

  @Example(30)
  performanceCount!: number;

  @Example(5)
  tagCount!: number;

  @Example([
    {
      journalDays: 20,
      performanceCount: 30,
      tagCount: 5,
    },
  ])
  insights!: MonthlyInsight[];

  @Example([
    {
      kpiName: "서비스 안정성 개선",
      progress: "90%",
    },
  ])
  kpis!: MonthlyKpi[];

  @Example([
    {
      goal: "백엔드 품질 개선",
      expectedOutcome: "장애 발생률 감소",
      taskCount: 15,
      periodStart: "2026-06-01",
      periodEnd: "2026-06-30",
      achievementStatus: "COMPLETED",
    },
  ])
  tagAnalyses!: MonthlyTagAnalysis[];

  @Example([
    {
      workSummary: "이번 달 주요 개발 업무 정리",
      resourcesUsed: "개발 시간 120시간",
      learning: "대규모 데이터 처리 경험",
    },
  ])
  weeklyReflections!: MonthlyReflectionItem[];

  @Example([
    {
      achievementRate: 90,
      summary: "월간 주요 성과 요약",
      growthInsight: {
        insight: "프로젝트 구조 이해도 향상",
      },
      nextAction: {
        action: "성능 최적화 진행",
      },
      items: [],
    },
  ])
  performances!: MonthlyPerformanceDto[];
}


export class MonthlyInsight {
  @Example(20)
  journalDays!: number;

  @Example(30)
  performanceCount!: number;

  @Example(5)
  tagCount!: number;

  @Example(75)
  completionRate!: number;    // 추가
}


export class MonthlyKpi {
  @Example("서비스 안정성 개선")
  kpiName!: string | null;

  @Example("90%")
  progress!: string | null;
}


export class MonthlyTagAnalysis {
  @Example("백엔드 품질 개선")
  goal!: string | null;

  @Example("장애 발생률 감소")
  expectedOutcome!: string | null;

  @Example(15)
  taskCount!: number | null;

  @Example("2026-06-01")
  periodStart!: string | null;

  @Example("2026-06-30")
  periodEnd!: string | null;

  @Example("COMPLETED")
  achievementStatus!: string | null;

  @Example("550e8400-e29b-41d4-a716-446655440000")
  tagId!: string | null;      //  추가

  @Example("백엔드")
  tagName!: string | null;    //  추가

  @Example("#4A90E2")
  color!: string | null;      //  추가
}


export class MonthlyReflectionItem {
  @Example("이번 달 주요 개발 업무 정리")
  workSummary!: string | null;

  @Example("개발 시간 120시간 사용")
  resourcesUsed!: string | null;

  @Example("대규모 데이터 처리 경험")
  learning!: string | null;
}


// 월간 회고 작성 요청
export class CreateMonthlyReflectionRequest {
  @Example("이번 달 업무 정리")
  workSummary?: string;

  @Example("개발 시간 및 사용 리소스")
  resourcesUsed?: string;

  @Example("배우고 느낀 점")
  learning?: string;
}


// 성과 항목 (output, impact) — 스키마상 Json 타입
export class MonthlyPerformanceItemDto {
  @Example({
    title: "대시보드 API 개선",
    detail: "월간 데이터 집계 로직 구현",
  })
  output!: any;

  @Example({
    description: "데이터 분석 효율 향상",
  })
  impact!: any;
}


// 일일 성과 요약
export class MonthlyPerformanceDto {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;      // ← 추가

  @Example(90)
  achievementRate!: number;

  @Example("월간 주요 성과 요약")
  summary!: string;

  @Example({
    insight: "프로젝트 구조 이해도 향상",
  })
  growthInsight!: any; // 스키마상 Json

  @Example({
    action: "성능 최적화 진행",
  })
  nextAction!: any; // 스키마상 Json

  @Example([
    {
      output: {
        title: "대시보드 API 개선",
      },
      impact: {
        description: "응답 속도 개선",
      },
    },
  ])
  items!: MonthlyPerformanceItemDto[];
}