import { Body, Controller, Post, Route, Tags } from "tsoa";

import { AiService } from "./ai.service";
import { LlmClient } from "./llm.client";
import { PromptManager } from "./prompt.manager";
import { ResponseParser } from "./response.parser";
import { RuleEngine } from "./rule.engine";
import { prisma } from "../../common/prisma/prisma.client";

import { PerformanceRequestDto } from "./dto/performance/api/performance.request.dto";
import { PerformanceResponseDto } from "./dto/performance/api/performance.response.dto";
import { PerformanceQuestionRequestDto } from "./dto/performance/api/performance.question.request.dto";
import { DashboardRequestDto } from "./dto/dashboard/api/dashboard.request.dto";
import { DashboardResponseDto } from "./dto/dashboard/api/dashboard.response.dto";
import { KpiRequestDto } from "./dto/kpi/api/kpi.request.dto";
import { KpiResponseDto } from "./dto/kpi/api/kpi.response.dto";
@Route("api/v1/ai")
@Tags("AI")
export class AiController extends Controller {
  private readonly aiService: AiService;

  constructor() {
    super();
    this.aiService = new AiService(
      new LlmClient(),
      new PromptManager(),
      new ResponseParser(),
      new RuleEngine(),
      prisma,
    );
  }

  @Post("performance-preview")
  public async createPerformancePreview(
    @Body() request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.aiService.generatePerformancePreview(
      request,
    );
  }

  @Post("performance-preview/complete")
  public async completePerformancePreview(
    @Body() request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.aiService.completePerformancePreview(
      request,
    );
  }

  @Post("dashboard")
  public async createDashboard(
    @Body() request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {
    return this.aiService.generateDashboard(
      request,
    );
  }

  @Post("project-tags/kpi-recommendation")
  public async createKpiRecommendation(
    @Body() request: KpiRequestDto,
  ): Promise<KpiResponseDto> {
    return this.aiService.generateKpiRecommendation(
      request,
    );
  }
}