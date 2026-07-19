import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

import { PromptCOutputDto } from "../dashboard/dto/prompt/prompt.c.output.dto";
import { PromptDOutputDto } from "../dashboard/dto/prompt/prompt.d.output.dto";
import { KpiOutputDto } from "../kpi/dto/prompt/kpi.output.dto";
import { PromptAOutputDto } from "../performance/dto/prompt/prompt.a.output.dto";
import { PromptBOutputDto } from "../performance/dto/prompt/prompt.b.output.dto";

export class RuleEngine {
  private requireString(
    value: string | undefined,
    message: string,
  ): void {
    if (!value?.trim()) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        message,
      );
    }
  }

  private requireArray<T>(
    value: T[] | undefined,
    message: string,
  ): void {
    if (!Array.isArray(value)) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        message,
      );
    }
  }

  validatePromptA(
    output: PromptAOutputDto,
  ): void {
    this.requireArray(
      output.tasks,
      "AI 구조화 결과가 없습니다.",
    );
    this.requireArray(
      output.followUpQuestions,
      "보충 질문 결과가 없습니다.",
    );

    if (output.followUpQuestions.length > 2) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "보충 질문은 최대 2개까지 가능합니다.",
      );
    }
  }

  needFollowUpQuestion(
    output: PromptAOutputDto,
  ): boolean {
    return output.followUpQuestions.length > 0;
  }

  validatePromptB(
    output: PromptBOutputDto,
  ): void {
    this.requireString(
      output.summary,
      "성과 요약이 없습니다.",
    );
    this.requireArray(
      output.growthInsights,
      "성장 인사이트 결과가 없습니다.",
    );

    if (output.growthInsights.length > 2) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "성장 인사이트는 최대 2개까지 가능합니다.",
      );
    }
    this.requireArray(
      output.nextActions,
      "추천 업무 결과가 없습니다.",
    );

    if (output.nextActions.length > 3) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "추천 업무는 최대 3개까지 가능합니다.",
      );
    }
    this.requireArray(
      output.taskPerformances,
      "업무 성과 결과가 없습니다.",
    );
  }

  validatePromptC(
    output: PromptCOutputDto,
  ): void {
    this.requireString(
      output.summary,
      "대시보드 요약이 없습니다.",
    );
    this.requireArray(
      output.kpis,
      "KPI 결과가 없습니다.",
    );
    this.requireArray(
      output.tagAnalyses,
      "태그 분석 결과가 없습니다.",
    );
  }

  validatePromptD(
    output: PromptDOutputDto,
  ): void {
    this.requireString(
      output.summary,
      "대시보드 요약이 없습니다.",
    );
    this.requireArray(
      output.kpis,
      "KPI 결과가 없습니다.",
    );
    this.requireArray(
      output.tagAnalyses,
      "태그 분석 결과가 없습니다.",
    );
  }

  validateKpi(
    output: KpiOutputDto,
  ): void {
    this.requireArray(
      output.kpis,
      "KPI 결과가 없습니다.",
    );
    if (output.kpis.length < 2 || output.kpis.length > 5) 
    {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "KPI는 2개 이상 5개 이하만 가능합니다.",
      );
    }
    for (const kpi of output.kpis) {
      this.requireString(
        kpi,
        "KPI 이름이 없습니다.",
      );
    }
  }
}