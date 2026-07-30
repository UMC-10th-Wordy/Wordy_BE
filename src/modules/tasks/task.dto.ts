import { Example } from 'tsoa';
import { TaskResultResponse } from '../task-results/task-result.dto';

export enum TaskPriority {
  MUST_DO = 'MUST_DO',
  SHOULD_DO = 'SHOULD_DO',
  COULD_DO = 'COULD_DO',
}

export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskRequest {
  @Example('백엔드 API 구현')
  title!: string;

  @Example(TaskPriority.MUST_DO)
  priority!: TaskPriority;

  @Example('2026-07-21')
  taskDate!: string;

  @Example(TaskStatus.IN_PROGRESS)
  status?: TaskStatus;

  @Example('7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2')
  tagId?: string | null;

  @Example('Swagger Example 추가')
  memo?: string;
}

export class UpdateTaskRequest {
  @Example('백엔드 API 수정')
  title?: string;

  @Example(TaskPriority.SHOULD_DO)
  priority?: TaskPriority;

  @Example(TaskStatus.COMPLETED)
  status?: TaskStatus;

  @Example('2026-07-22')
  taskDate?: string;

  @Example('7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2')
  tagId?: string | null;

  @Example('메모 수정')
  memo?: string | null;
}

export class TaskTagResponse {
  @Example('7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2')
  tagId!: string;

  @Example('Wordy')
  tagName!: string;

  @Example('#4F46E5')
  color!: string | null;

  @Example('Wordy 프로젝트')
  projectName!: string | null;
}

export class TaskResponse {
  @Example('0c5d55f5-48c0-4a6d-8f43-9ef5c41d2e6a')
  taskId!: string;

  @Example('백엔드 API 구현')
  title!: string;

  @Example(TaskPriority.MUST_DO)
  priority!: TaskPriority;

  @Example(0)
  sortOrder!: number;

  @Example('Swagger Example 추가')
  memo!: string | null;

  @Example(TaskStatus.IN_PROGRESS)
  status!: TaskStatus;

  @Example('2026-07-21T00:00:00.000Z')
  taskDate!: Date;

  @Example('2026-07-21T14:30:00.000Z')
  completedAt!: Date | null;

  @Example('2026-07-20T09:00:00.000Z')
  createdAt!: Date;

  @Example('2026-07-21T10:15:00.000Z')
  updatedAt!: Date;

  @Example(null)
  deletedAt!: Date | null;

  @Example('5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d0a')
  userId!: string;

  @Example('7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2')
  tagId!: string | null;

  tag?: TaskTagResponse | null;
}

export class TaskWithResultResponse extends TaskResponse {
  @Example(null)
  taskResult!: TaskResultResponse | null;
}

export class TaskReorderItem {
  @Example('11111111-1111-1111-1111-111111111111')
  taskId!: string;

  @Example(TaskPriority.MUST_DO)
  priority!: TaskPriority;

  @Example(0)
  sortOrder!: number;
}

export class TaskReorderRequest {
  tasks!: TaskReorderItem[];
}

export class TaskReorderResponse {
  @Example(3)
  updatedCount!: number;
}