import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { verifyAccessToken } from "../../../auth.config";
import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

import { KpiRequestDto }from "./dto/api/kpi.request.dto";
import { KpiResponseDto }from "./dto/api/kpi.response.dto";
import { KpiOutputDto }from "./dto/prompt/kpi.output.dto";
import { PrismaClient, PromptType, AiRunStatus, Prisma } from "../../../generated/prisma/client";

export class KpiService {
  constructor(
    private readonly llmClient:LlmClient,
    private readonly promptManager:PromptManager,
    private readonly responseParser:ResponseParser,
    private readonly ruleEngine:RuleEngine,
    private readonly prisma:PrismaClient,
  ){}

  private extractUserId(
    authorization: string | undefined,
  ): string {
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }
  }
  
  // KPI 추천
  async generateKpiRecommendation(
    authorization: string | undefined,
    request: KpiRequestDto,
  ): Promise<KpiResponseDto> {

    this.extractUserId(authorization);
    
    const prompt =
      this.promptManager.buildKpiPrompt(
        request,
      );

    const response =
      await this.llmClient.generate(
        prompt,
      );
    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.PROMPT_C,
        promptVersion: "v1",
        request: prompt as Prisma.InputJsonValue,
        response,
        status: AiRunStatus.SUCCESS,
      },
    });

    const result =
      this.responseParser.parse<KpiOutputDto>(
        response,
      );
    this.ruleEngine.validateKpi(
      result,
    );
    return {
      kpiRecommendations: result.kpis,
    };
  }
}