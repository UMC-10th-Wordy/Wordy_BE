import { Example } from "tsoa";

export class PerformanceRequestDto {
  tasks!: TaskDto[];

  reflection!: ReflectionDto;

  projectTag?: ProjectTagDto;

  @Example("백엔드 개발자")
  userJob!: string;
}

export class TaskDto {
  @Example("task-550e8400")
  taskId!: string;

  @Example("HIGH")
  priority!: string;

  @Example(true)
  completed!: boolean;

  @Example("Swagger 문서 작성")
  title!: string;

  @Example("Request/Response 예시 추가")
  memo?: string;
}

export class ReflectionDto {
  @Example("Swagger 문서가 깔끔하게 작성되었다.")
  good?: string;

  @Example("예시 데이터 작성에 시간이 오래 걸렸다.")
  bad?: string;

  @Example("TSOA Example 사용법을 익혔다.")
  learned?: string;

  @Example("Dashboard API도 구현할 예정이다.")
  nextPlan?: string;
}

export class ProjectTagDto {
  @Example("project-tag-01")
  projectTagId!: string;

  @Example("AI 기능")
  title!: string;

  @Example("AI 관련 업무")
  description?: string;

  @Example([
    "업무 완료율 90%",
    "주간 회고 작성"
  ])
  kpis?: string[];
}