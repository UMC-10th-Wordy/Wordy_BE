export interface PerformanceResponseDto {
  status:
    | "QUESTION_REQUIRED"
    | "COMPLETED";

  supplementQuestions?: SupplementQuestionDto[];
  summary?: string;
  growthInsights?: string[];
  nextActions?: string[];
  taskPerformances?: TaskPerformanceDto[];
}


export interface SupplementQuestionDto {
  question: string;
  reason: string;
}


export interface TaskPerformanceDto {
  taskId:string;
  output:string[];
  impact:string[];
}