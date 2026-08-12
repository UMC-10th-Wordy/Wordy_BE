export interface PromptCOutputDto {
  summary: string;
  keyAchievement: string;
  focusedTags: FocusedTagOutputDto[];
  kpis: DashboardKpiOutputDto[];
  tagAnalyses: DashboardTagAnalysisOutputDto[];
}

export interface FocusedTagOutputDto {
  tagId: string;
  tagName: string;
}

export interface DashboardKpiOutputDto {
  tagId: string;
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