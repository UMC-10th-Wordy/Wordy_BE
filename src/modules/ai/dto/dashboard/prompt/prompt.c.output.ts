export interface PromptCOutputDto {
  summary: string;
  kpis: DashboardKpiOutputDto[];
  tagAnalyses: DashboardTagAnalysisOutputDto[];
  weeklyReflection: WeeklyReflectionOutputDto;
}

export interface DashboardKpiOutputDto {
  kpiName: string;
  progress: string;
}

export interface DashboardTagAnalysisOutputDto {
  goal: string;
  expectedOutcome: string;
  taskCount: number;
  achievementStatus: string;
}

export interface WeeklyReflectionOutputDto {
  workSummary: string;
  resourcesUsed: string;
  learning: string;
}