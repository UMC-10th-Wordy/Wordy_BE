export interface PromptCOutputDto {
  summary: string;
  kpis: DashboardKpiOutputDto[];
  tagAnalyses: DashboardTagAnalysisOutputDto[];
}

export interface DashboardKpiOutputDto {
  kpiName: string;
  progress: string;
  relatedAchievement: string;
}

export interface DashboardTagAnalysisOutputDto {
  tagId: string;
  tagName: string;
  objective: string;
  expectedOutcome: string;
  achievementStatus: string;
  insight: string;
}