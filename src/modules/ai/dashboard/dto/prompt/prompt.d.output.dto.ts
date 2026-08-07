export interface PromptDOutputDto {
  summary: string;
  kpis: MonthlyKpiOutputDto[];
  tagAnalyses: MonthlyTagAnalysisOutputDto[];
}

export interface MonthlyKpiOutputDto {
  kpiName:string;
  progress:string;
  relatedAchievement:string;
}

export interface MonthlyTagAnalysisOutputDto {
  tagId: string;
  tagName:string;
  achievementStatus:string;
  insight:string;
}