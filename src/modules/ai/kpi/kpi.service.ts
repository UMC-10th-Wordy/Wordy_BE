import { PromptManager } from "../common/prompt.manager.js";
import { LlmClient } from "../common/llm.client.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { verifyAccessToken } from "../../../auth.config.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";

import { KpiRequestDto }from "./dto/api/kpi.request.dto.js";
import { KpiResponseDto }from "./dto/api/kpi.response.dto.js";
import { KpiOutputDto }from "./dto/prompt/kpi.output.dto.js";
import { PrismaClient, PromptType, AiRunStatus } from "../../../generated/prisma/client.js";

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

  private validateRequest(
    request: KpiRequestDto,
  ): void {
    if (!request || typeof request !== "object") {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "요청 데이터가 올바르지 않습니다.",
      );
    }

    const requiredFields = [
      "tagName",
      "projectName",
      "goal",
      "expectedOutcome",
      "userJob",
    ] as const;

    for (const field of requiredFields) {
      const value = request[field];

      if (
        typeof value !== "string" ||
        value.trim().length === 0
      ) {
        throw new ApiError(
          ErrorCode.BAD_REQUEST.status,
          ErrorCode.BAD_REQUEST.code,
          `${field}은(는) 필수 입력값입니다.`,
        );
      }
    }

    if (
      request.period !== undefined &&
      typeof request.period !== "string"
    ) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "period는 문자열이어야 합니다.",
      );
    }
  }
  
  // KPI 추천
  async generateKpiRecommendation(
    authorization: string | undefined,
    request: KpiRequestDto,
  ): Promise<KpiResponseDto> {

    this.extractUserId(authorization);

    this.validateRequest(request);
    
    const prompt =
      this.promptManager.buildKpiPrompt(
        request,
      );

    console.log("===== KPI PROMPT =====");
    console.log(JSON.stringify(prompt, null, 2));

    const response =
      await this.llmClient.generate(
        prompt,
      );

    console.log("===== KPI LLM RESPONSE =====");
    console.log(response);

    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.KPI,
        promptVersion: "v1",
        request: JSON.parse(JSON.stringify(prompt)),
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