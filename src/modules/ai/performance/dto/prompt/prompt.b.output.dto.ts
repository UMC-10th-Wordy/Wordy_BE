export interface PromptBOutputDto {
  summary: string;
  growthInsights: string[];
  nextActions: string[];
  taskPerformances: PromptBTaskPerformanceDto[];
}

export interface PromptBTaskPerformanceDto {
  taskId: string;
  output: string[];
  impact: string[];
}