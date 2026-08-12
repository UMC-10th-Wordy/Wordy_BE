export interface PromptDOutputDto {
  summary: string;
  keyAchievement: string;
  focusedTags: FocusedTagOutputDto[];
  kpis: MonthlyKpiOutputDto[];
  tagAnalyses: MonthlyTagAnalysisOutputDto[];
}

export interface FocusedTagOutputDto {
  tagId: string;
  tagName: string;
}

export interface MonthlyKpiOutputDto {
  tagId: string;
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