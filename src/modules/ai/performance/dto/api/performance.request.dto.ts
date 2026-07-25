import { Example } from "tsoa";
import { TaskPriority, TaskStatus } from "../../../../tasks/task.dto";
import { JobRole, YearsOfService } from "../../../../users/users.dto";
export class PerformanceRequestDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  userId!: string;

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  dailyEntryId!: string;
  
  tasks!: TaskDto[];

  @Example("오늘 Swagger 문서를 작성하고 API 예시를 추가했다.")
  reflectionContent!: string;

  projectTag?: ProjectTagDto;

  @Example("DEVELOPMENT")
  userJob!: JobRole;

  @Example("ONE_TO_THREE_YEARS")
  yearsOfService!: YearsOfService;
}

export class TaskDto {

  @Example("550e8400-e29b-41d4-a716-446655440000")
  taskId!: string;

  @Example("SHOULD_DO")
  priority!: TaskPriority;

  @Example("COMPLETED")
  status!: TaskStatus;

  @Example("2026-07-25T10:00:00Z")
  completedAt?: string;

  @Example("Swagger 문서 작성")
  title!: string;

  @Example("Request/Response 예시 추가")
  memo?: string;

  taskResult!: TaskResultDto;
}

export class TaskResultDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  taskResultId?: string;

  @Example("Swagger 문서를 모두 작성했다.")
  content!: string;
}

export class ProjectTagDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  projectTagId!: string;

  @Example("AI 기능")
  tagName!: string;

  description?: string;

  kpis?: string[];

  projectPurpose?: string;

  expectedOutcome?: string;

  period?: string;
}