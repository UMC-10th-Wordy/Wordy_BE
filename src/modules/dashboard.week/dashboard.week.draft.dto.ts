import { Example } from "tsoa";
import { DraftType } from "../../generated/prisma/client.js";

// 업무계획 항목 (업무 내용 + 예상 시점, 예상시점은 자유 텍스트)
export class TaskPlanItem {
  @Example("리서치 일정 블록 확보")
  content!: string;

  @Example("7월 20일~22일")
  expectedTime?: string;
}

// draft 저장 요청
export class SaveDraftRequest {
  @Example("이번 달 온보딩 리뉴얼 진행")
  workSummary?: string;

  @Example("사용자 인터뷰, 로그 분석")
  resourcesUsed?: string;

  @Example("데이터 기반 의사결정의 중요성")
  learning?: string;

  @Example([
    { content: "리서치 일정 블록 확보", expectedTime: "7월 20일" },
    { content: "디자인 시스템 V2 마무리", expectedTime: "7월 20일~22일" },
  ])
  taskPlans?: TaskPlanItem[];
}

// draft 응답
export class DraftResponse {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  reflectionDraftId!: string;

  @Example("MONTHLY")
  type!: DraftType;   // WEEKLY | MONTHLY   ← string에서 변경

  @Example("이번 달 온보딩 리뉴얼 진행")
  workSummary!: string | null;

  @Example("사용자 인터뷰, 로그 분석")
  resourcesUsed!: string | null;

  @Example("데이터 기반 의사결정의 중요성")
  learning!: string | null;

  @Example([{ content: "리서치 일정 블록 확보", expectedTime: "7월 20일" }])
  taskPlans!: TaskPlanItem[];   // ← any에서 변경

  @Example("2026-06-29T22:10:34.000Z")
  updatedAt!: string;
}