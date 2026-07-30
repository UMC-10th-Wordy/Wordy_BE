export interface PromptAInputDto {
  tasks: PromptTaskDto[];
  reflection: string;
  projectTag?: PromptProjectDto;
  userJob: string;
  yearsOfService: string;
  supplementAnswers?: SupplementAnswerDto[];
}

export interface PromptTaskDto {
  taskId: string;
  title: string;
  priority: string;
  status: string;
  memo?: string;
  result?: string;
}

export interface PromptProjectDto {
  tagName: string;
  projectName?: string;
  projectPurpose?: string;
  expectedOutcome?: string;
  kpis?: string[];
}

export interface SupplementAnswerDto {
  question:string;
  answer:string;
}