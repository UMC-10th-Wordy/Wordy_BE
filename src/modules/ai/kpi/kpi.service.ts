import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { KpiRequestDto }from "./dto/api/kpi.request.dto";
import { KpiResponseDto }from "./dto/api/kpi.response.dto";
import { KpiOutputDto }from "./dto/prompt/kpi.output.dto";

export class KpiService {
  constructor(
    private readonly llmClient:LlmClient,
    private readonly promptManager:PromptManager,
    private readonly responseParser:ResponseParser,
    private readonly ruleEngine:RuleEngine,
  ){}
  
  // KPI 추천
  async generateKpiRecommendation(
    request: KpiRequestDto,
  ): Promise<KpiResponseDto> {
    const prompt =
      this.promptManager.buildKpiPrompt(
        request,
      );
    const response =
      await this.llmClient.generate(
        prompt,
      );
    const result =
      this.responseParser.parse<KpiOutputDto>(
        response,
      );
    this.ruleEngine.validateKpi(
      result,
    );
    return {
      kpiRecommendations:
        result.kpis,
    };
  }
}