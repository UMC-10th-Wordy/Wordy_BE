import { Example } from "tsoa";
import { TaskPriority } from "../../../../tasks/task.dto";
import { JobRole } from "../../../../users/users.dto";
export class PerformanceRequestDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  userId!: string;
  
  tasks!: TaskDto[];

  @Example("오늘 Swagger 문서를 작성하고 API 예시를 추가했다.")
  reflectionContent!: string;

  projectTag?: ProjectTagDto;

  @Example("DEVELOPMENT")
  userJob!: JobRole;
}

export class TaskDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  taskId!: string;

  @Example("SHOULD_DO")
  priority!: TaskPriority;

  @Example(true)
  completed!: boolean;

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
  result!: string;
}

export class ProjectTagDto {

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  projectTagId!: string;

  @Example("AI 기능")
  title!: string;

  description?: string;

  kpis?: string[];

  purpose?: string;

  expectedOutcome?: string;

  period?: string;
}