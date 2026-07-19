// 월간 생성 조건 충족 여부
export interface MonthlyEligibilityResponse {
  eligible: boolean;          // 생성 가능 여부
  weeklyDashboardCount: number; // 이번 달 주간 대시보드 수
  requiredCount: number;
  monthStart: string;
  monthEnd: string;
  weeklyDashboards: WeeklyDashboardItem[]; // 재료가 될 주간 대시보드 목록
}

// 재료가 될 주간 대시보드 항목
export interface WeeklyDashboardItem {
  dashboardId: string;
  startDate: string;
  endDate: string;
  summary: string;
}

// 월간 대시보드 목록의 각 항목
export interface MonthlyDashboardListItem {
  dashboardId: string;
  startDate: string;
  endDate: string;
  summary: string;
  createdAt: string;
}

// 월간 대시보드 상세 (완성 화면)
export interface MonthlyDashboardDetail {
  dashboardId: string;
  startDate: string;
  endDate: string;
  summary: string;
  journalDays: number;
  performanceCount: number;
  tagCount: number;
  insights: MonthlyInsight[];
  kpis: MonthlyKpi[];
  tagAnalyses: MonthlyTagAnalysis[];
  weeklyReflections: MonthlyReflectionItem[];
  performances: MonthlyPerformanceDto[];
}

export interface MonthlyInsight {
  journalDays: number;
  performanceCount: number;
  tagCount: number;
}

export interface MonthlyKpi {
  kpiName: string | null;
  progress: string | null;
}

export interface MonthlyTagAnalysis {
  goal: string | null;
  expectedOutcome: string | null;
  taskCount: number | null;
  periodStart: string | null;
  periodEnd: string | null;
  achievementStatus: string | null;
}

export interface MonthlyReflectionItem {
  workSummary: string | null;
  resourcesUsed: string | null;
  learning: string | null;
}

// 월간 회고 작성 요청
export interface CreateMonthlyReflectionRequest {
  workSummary?: string;
  resourcesUsed?: string;
  learning?: string;
}

// 성과 항목 (output, impact) — 스키마상 Json 타입
export interface MonthlyPerformanceItemDto {
  output: any;
  impact: any;
}

// 일일 성과 요약
export interface MonthlyPerformanceDto {
  achievementRate: number;
  summary: string;
  growthInsight: any;   // 스키마상 Json
  nextAction: any;      // 스키마상 Json
  items: MonthlyPerformanceItemDto[];
}