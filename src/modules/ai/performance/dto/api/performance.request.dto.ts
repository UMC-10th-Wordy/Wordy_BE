import { Example } from "tsoa";
import { TaskPriority } from "../../../../tasks/task.dto";
import { JobRole } from "../../../../users/users.dto";
export class PerformanceRequestDto {
  
  @Example("daily-entry-550e8400")
  dailyEntryId!: string;

  tasks!: TaskDto[];

  @Example("오늘 Swagger 문서를 작성하고 API 예시를 추가했다.")
  reflectionContent!: string;

  projectTag?: ProjectTagDto;

  @Example("DEVELOPMENT")
  userJob!: JobRole;
}

export class TaskDto {

  @Example("task-550e8400")
  taskId!: string;

  @Example("task-result-550e8400")
  taskResultId?: string;

  @Example("SHOULD_DO")
  priority!: TaskPriority;

  @Example(true)
  completed!: boolean;

  @Example("Swagger 문서 작성")
  title!: string;

  @Example("Request/Response 예시 추가")
  memo?: string;

  @Example("Swagger 문서를 모두 작성했다.")
  result?: string;
}

export class ProjectTagDto {

  @Example("project-tag-01")
  projectTagId!: string;

  @Example("AI 기능")
  title!: string;

  description?: string;

  kpis?: string[];

  purpose?: string;

  expectedOutcome?: string;

  period?: string;
}