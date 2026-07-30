import { Body, Controller, Example, Header, Post, Route, Tags } from "tsoa";

import { LlmClient } from "../common/llm.client.js";
import { PromptManager } from "../common/prompt.manager.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { KpiRequestDto } from "./dto/api/kpi.request.dto.js";
import { KpiResponseDto } from "./dto/api/kpi.response.dto.js";
import { KpiService } from "./kpi.service.js";
import { prisma } from "../../../common/prisma/prisma.client.js";
import { ApiResponse } from "../../../common/responses/api.response.js";
import { success } from "../../../common/responses/response.js";
import { SuccessCode } from "../../../common/responses/success.code.js";

@Route("ai")
@Tags("AI")
export class KpiController extends Controller {
  private readonly kpiService: KpiService;

  constructor() {
    super();
    this.kpiService = new KpiService(
      new LlmClient(),
      new PromptManager(),
      new ResponseParser(),
      new RuleEngine(),
      prisma,
    );
  }

  /**
   * @summary 프로젝트 KPI 추천
   */
  @Post("project-tags/kpi-recommendation")
  @Example<ApiResponse<KpiResponseDto>>({
    success: true,
    code: "S200",
    message: "KPI 추천에 성공했습니다.",
    result: {
      kpiRecommendations: [
        "업무 완료율 90% 이상",
        "주간 회고 작성률 100%",
        "AI 성과 리포트 생성 1회 이상",
      ],
    },
  })
  public async createKpiRecommendation(
    @Header("Authorization") authorization: string | undefined,
    @Body() request: KpiRequestDto,
  ): Promise<ApiResponse<KpiResponseDto>> {
    const result =
      await this.kpiService.generateKpiRecommendation(
        authorization,
        request,
      );

    return success(
      SuccessCode.OK.code,
      "KPI 추천에 성공했습니다.",
      result,
    );
  }
}