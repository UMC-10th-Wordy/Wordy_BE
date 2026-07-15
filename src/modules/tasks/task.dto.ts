export enum TaskPriority {
  MUST_DO = 'MUST_DO',
  SHOULD_DO = 'SHOULD_DO',
  COULD_DO = 'COULD_DO',
}

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface TaskApiResponseDto<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
  taskDate: string;
  tagId: string;
  memo?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  taskDate?: string;
  tagId?: string;
  memo?: string | null;
}

export interface TaskResponse {
  taskId: string;
  title: string;
  priority: TaskPriority;
  memo: string | null;
  status: TaskStatus;
  taskDate: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
  tagId: string;
  tag?: {
    tagId: string;
    tagName: string;
    color: string | null;
    projectName: string | null;
  };
}