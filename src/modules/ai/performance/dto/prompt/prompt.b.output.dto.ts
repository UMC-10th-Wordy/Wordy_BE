export interface PromptBOutputDto {
  summary: string;
  growthInsights: string[];
  nextActions: string[];
  taskPerformances: TaskPerformanceDto[];
}

export interface TaskPerformanceDto {
  taskId: string;
  output: string[];
  impact: string[];
}