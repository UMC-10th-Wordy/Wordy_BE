import { ApiError } from "../../common/errors/api.error";
import { ErrorCode } from "../../common/errors/error.code";

import { PromptAOutputDto } from "./dto/performance/prompt/prompt.a.output.dto";
import { PromptBOutputDto } from "./dto/performance/prompt/prompt.b.output.dto";
import { KpiOutputDto } from "./dto/kpi/prompt/kpi.output.dto";

export class RuleEngine {
  validatePromptA(
    output: PromptAOutputDto,
  ): void {
    if (!output.tasks) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "AI 구조화 결과가 없습니다.",
      );
    }

    if (!Array.isArray(output.followUpQuestions)) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "보충 질문 결과가 없습니다.",
      );
    }

    if (output.followUpQuestions.length > 2) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "보충 질문은 최대 2개까지 가능합니다.",
      );
    }
  }

  // 실제 질문 노출 여부 판단
  needFollowUpQuestion(
    output: PromptAOutputDto,
  ): boolean {
    return output.followUpQuestions.length > 0;
  }

  validatePromptB(
    output: PromptBOutputDto,
  ): void {
    if (!output.summary) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "성과 요약이 없습니다.",
      );
    }

    if (!Array.isArray(output.growthInsights)) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "성장 인사이트 결과가 없습니다.",
      );
    }

    if (output.growthInsights.length > 2) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "성장 인사이트는 최대 2개까지 가능합니다.",
      );
    }

    if (!Array.isArray(output.nextActions)) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "추천 업무 결과가 없습니다.",
      );
    }

    if (output.nextActions.length > 3) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "추천 업무는 최대 3개까지 가능합니다.",
      );
    }

    if (!Array.isArray(output.taskPerformances)) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "업무 성과 결과가 없습니다.",
      );
    }
  }

  validateKpi(
    output: KpiOutputDto,
  ):void {
    if(!Array.isArray(output.kpis)){
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "KPI 결과가 없습니다.",
      );
    }

    if(
      output.kpis.length < 2 ||
      output.kpis.length > 5
    ){
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "KPI는 2개 이상 5개 이하만 가능합니다.",
      );
    }
  }
}