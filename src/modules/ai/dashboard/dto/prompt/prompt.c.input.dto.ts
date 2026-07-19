export interface PromptCInputDto {
  startDate: string;
  endDate: string;
  performances: DashboardPerformanceDto[];
  reflections: DashboardReflectionDto[];
  tasks: DashboardTaskDto[];
}

export interface DashboardPerformanceDto {
  summary: string;
  growthInsight: any;
  nextAction: any;
}

export interface DashboardReflectionDto {
  date: string;
  content: string;
}

export interface DashboardTaskDto {
  taskId: string;
  title: string;
  tag: string;
  priority: string;
  completed: boolean;
  memo?: string;
}