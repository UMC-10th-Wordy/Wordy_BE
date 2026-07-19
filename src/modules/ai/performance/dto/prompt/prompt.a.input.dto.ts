export interface PromptAInputDto {
  tasks: PromptTaskDto[];
  reflection: string;
  projectTag?: PromptProjectDto;
  userJob: string;
  supplementAnswers?: SupplementAnswerDto[];
}

export interface PromptTaskDto {
  taskId: string;
  title: string;
  priority: string;
  completed: boolean;
  memo?: string;
  result?: string;
}

export interface PromptProjectDto {
  title: string;
  description?: string;
  kpis?: string[];
}

export interface SupplementAnswerDto {
  question:string;
  answer:string;
}