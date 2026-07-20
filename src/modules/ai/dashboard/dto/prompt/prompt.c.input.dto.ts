export interface PromptCInputDto {
  startDate: string;
  endDate: string;
  weeklySummaryCandidates: WeeklySummaryCandidateDto[];
  tagAnalyses: DashboardTagInputDto[];
  kpiProgress: DashboardKpiInputDto[];
}

export interface WeeklySummaryCandidateDto {
  performanceId: string;
  projectTag: string;
  output: string;
  impact: string;
  highlight: boolean;
}

export interface DashboardTagInputDto {
  tagName: string;
  objective: string;
  expectedOutcome: string;
  performances:{
    output:string;
    impact:string;
  }[];
  kpis:string[];
}

export interface DashboardKpiInputDto {
  kpiName:string;
  target:string;
  relatedPerformances:string[];
}