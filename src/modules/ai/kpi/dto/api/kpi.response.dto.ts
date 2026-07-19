import { Example } from "tsoa";

export class KpiResponseDto {
  @Example([
    "업무 완료율 90% 이상",
    "주간 회고 작성률 100%",
    "AI 성과 리포트 생성 1회 이상"
  ])
  kpiRecommendations!: string[];
}