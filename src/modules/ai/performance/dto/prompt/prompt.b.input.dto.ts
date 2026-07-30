import { PromptAOutputDto } from "./prompt.a.output.dto";

export interface PromptBInputDto {
  structuredData: PromptAOutputDto;
  userJob: string;
  yearsOfService: string;
  projectTag?: PromptProjectDto;
}

export interface PromptProjectDto {
  tagName: string;
  projectName?: string;
  projectPurpose?: string;
  expectedOutcome?: string;
  kpis?: string[];
}