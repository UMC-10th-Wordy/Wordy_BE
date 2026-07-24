import { Example } from "tsoa";

export class PerformanceResponseDto {
  @Example("COMPLETED")
  status!: "QUESTION_REQUIRED" | "COMPLETED";

  supplementQuestions?: SupplementQuestionDto[];

  @Example("오늘은 Swagger 문서화와 AI 기능 구현을 완료했습니다.")
  summary?: string;

  @Example([
    "응답 구조 설계 능력이 향상되었습니다.",
    "API 문서화 경험을 쌓았습니다."
  ])
  growthInsights?: string[];

  @Example([
    "Dashboard API 구현",
    "응답 파서 테스트"
  ])
  nextActions?: string[];

  taskPerformances?: TaskPerformanceDto[];

  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  reflectionSnapshotId?: string;
}

export class SupplementQuestionDto {
  @Example("이 업무에서 가장 어려웠던 점은 무엇인가요?")
  question!: string;

  @Example("성과를 더 정확히 분석하기 위해 필요한 정보입니다.")
  reason!: string;
}

export class TaskPerformanceDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  taskId!: string;

  @Example([
    "Swagger 문서를 작성했습니다.",
    "API 예시를 추가했습니다."
  ])
  output!: string[];

  @Example([
    "프론트 개발 생산성이 향상됩니다.",
    "API 이해도가 높아집니다."
  ])
  impact!: string[];
}