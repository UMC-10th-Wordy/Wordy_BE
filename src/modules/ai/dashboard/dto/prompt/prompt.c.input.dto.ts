export interface PromptCInputDto {
  startDate: string;
  endDate: string;
  weeklySummaryCandidates: WeeklySummaryCandidateDto[];
  tagAnalyses: DashboardTagInputDto[];
  kpiProgress: DashboardKpiInputDto[];
}

export interface WeeklySummaryCandidateDto {
  performanceId: string;
  summary: string;
  items: {
    output: string;
    impact: string;
  }[];
  achievementRate: number;
}

export interface DashboardTagInputDto {
  tagId: string;
  tagName: string;
  color: string;
  projectName?: string;
  projectPurpose?: string;
  expectedOutcome?: string;
  performances:{
    output:string;
    impact:string;
  }[];
  kpis:string[];
}

export interface DashboardKpiInputDto {
  tagId: string;
  kpiName:string;
  target:string;
  relatedPerformances:{
    output:string;
    impact:string;
  }[];
}