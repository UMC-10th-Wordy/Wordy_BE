// 생성 조건 충족 여부
export interface EligibilityResponse {
  eligible: boolean;        // 생성 가능 여부
  journalDays: number;      // 이번 주 작성한 일지 수
  requiredDays: number;     // 생성에 필요한 최소 일지 수
  weekStart: string;        // 이번 주 시작일 (YYYY-MM-DD)
  weekEnd: string;          // 이번 주 종료일 (YYYY-MM-DD)
  entries: DailyEntryItem[];
}
// 날짜 형식은 웬만하면 YYYY-MM-DD

// 대시보드 목록의 각 항목
export interface DashboardListItem {
  dashboardId: string;
  startDate: string;
  endDate: string;
  summary: string;
  createdAt: string;
}

// 대시보드 상세 (완성 화면)
export interface DashboardDetail {
  dashboardId: string;
  startDate: string;
  endDate: string;
  summary: string;
  journalDays: number;
  performanceCount: number;
  tagCount: number;
  insights: Insight[];
  kpis: Kpi[];
  tagAnalyses: TagAnalysis[];
  weeklyReflections: WeeklyReflection[];
  performances: PerformanceDto[];
}

export interface Insight {
  journalDays: number;
  performanceCount: number;
  tagCount: number;
}

export interface Kpi {
  kpiName: string | null;
  progress: string | null;
}

export interface TagAnalysis {
  goal: string | null;
  expectedOutcome: string | null;
  taskCount: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  achievementStatus: string | null;
}

export interface WeeklyReflection {
  workSummary: string | null;
  resourcesUsed: string | null;
  learning: string | null;
}

// 주간 회고 작성 요청
export interface CreateWeeklyReflectionRequest {
  workSummary?: string;      // 이번 주 업무 정리
  resourcesUsed?: string;    // 사용한 시간/리소스
  learning?: string;         // 배우고 느낀 점
}

// 성과 항목 (output, impact) — 스키마상 Json 타입
export interface PerformanceItemDto {
  output: any;
  impact: any;
}

// 일일 성과 요약
export interface PerformanceDto {
  achievementRate: number;
  summary: string;
  growthInsight: any;   // 스키마상 Json
  nextAction: any;      // 스키마상 Jsonn
  items: PerformanceItemDto[];
}

// 일지 항목 (생성에 사용할 업무 일지)
export interface DailyEntryItem {
  dailyEntryId: string;
  entryDate: string;
}