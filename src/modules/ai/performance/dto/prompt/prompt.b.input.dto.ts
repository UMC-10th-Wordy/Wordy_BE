import { StructuredTaskDto } from "./prompt.a.output.dto";

export interface PromptBInputDto {
  tasks: StructuredTaskDto[];
  reflection: string;
  userJob: string;
  projectTag?: PromptProjectDto;
}

export interface PromptProjectDto {
  title: string;
  description?: string;
  kpis?: string[];
}