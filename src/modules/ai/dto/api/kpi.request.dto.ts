export interface KpiRequestDto {
  tagName:string;
  projectName:string;
  goal:string;
  expectedOutcome:string;
  period?:string;
  userJob:string;
}