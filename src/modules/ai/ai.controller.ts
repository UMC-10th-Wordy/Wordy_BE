import { Body, Controller, Post, Route, Tags } from "tsoa";

import { AiService } from "./ai.service";
import { LlmClient } from "./llm.client";
import { PromptManager } from "./prompt.manager";
import { ResponseParser } from "./response.parser";
import { RuleEngine } from "./rule.engine";

import { PerformanceRequestDto } 
from "./dto/performance/api/performance.request.dto";

import { PerformanceResponseDto } 
from "./dto/performance/api/performance.response.dto";
import { PerformanceQuestionRequestDto } from "./dto/performance/api/performance.question.request.dto";

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
}