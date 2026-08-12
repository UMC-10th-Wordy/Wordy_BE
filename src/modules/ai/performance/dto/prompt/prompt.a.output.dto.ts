export interface PromptAOutputDto {
  tasks: StructuredTaskDto[];
  followUpQuestions: SupplementQuestionDto[];
}

export interface StructuredTaskDto {
  taskId: string;
  action: string;
  outputCandidates: string[];
  resultCandidates: string[];
  impactCandidates: string[];
  tagLinkedKpiCandidates?: string[];
  growthSignals: string[];
  nextActionCandidates: string[];
}

export interface SupplementQuestionDto {
  taskId: string;
  question: string;
  reason: string;
}