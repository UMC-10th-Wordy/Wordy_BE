export interface PerformanceRequestDto {
  tasks: TaskDto[];
  reflection: ReflectionDto;
  projectTag?: ProjectTagDto;
  userJob: string;
}

export interface TaskDto {
  taskId: string;
  priority: string;
  completed: boolean;
  title: string;
  memo?: string;
}

export interface ReflectionDto {
  good?: string;
  bad?: string;
  learned?: string;
  nextPlan?: string;
}

export interface ProjectTagDto {
  projectTagId: string;
  title: string;
  description?: string;
  kpis?: string[];
}