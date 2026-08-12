export interface PromptDInputDto {
  startDate: string;
  endDate: string;
  weeklyDashboards: WeeklyDashboardInputDto[];
}

export interface WeeklyDashboardInputDto {
  dashboardId:string;
  startDate:string;
  endDate:string;
  summary:string;
  kpis: WeeklyKpiInputDto[];
  tagAnalyses: WeeklyTagAnalysisInputDto[];
  weeklyReflection?: WeeklyReflectionInputDto;
}

export interface WeeklyKpiInputDto {
  tagId: string;
  kpiName:string;
  progress:string;
}

export interface WeeklyTagAnalysisInputDto {
  tagId: string;
  tagName: string;
  color: string;
  goal: string | null;
  expectedOutcome: string | null;
  achievementStatus: string | null;
}

export interface WeeklyReflectionInputDto {
  workSummary:string;
  resourcesUsed:string;
  learning:string;
}