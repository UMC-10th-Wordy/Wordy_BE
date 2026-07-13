import { Body, Controller, Post, Route, Tags } from "tsoa";

import { AiService } from "./ai.service";
import { LlmClient } from "./llm.client";
import { PromptManager } from "./prompt.manager";
import { ResponseParser } from "./response.parser";
import { RuleEngine } from "./rule.engine";

import { PerformancePreviewRequestDto } 
from "./dto/api/performance.request.dto";

import { PerformancePreviewResponseDto } 
from "./dto/api/performance.response.dto";

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
    @Body() request: PerformancePreviewRequestDto,
  ): Promise<PerformancePreviewResponseDto> {

    return this.aiService.generatePerformancePreview(
      request,
    );
  }
}