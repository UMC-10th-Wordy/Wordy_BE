import { PromptManager } from "./prompt.manager";
import { LlmClient } from "./llm.client";
import { ResponseParser } from "./response.parser";
import { RuleEngine } from "./rule.engine";

import { PerformancePreviewRequestDto } 
from "./dto/api/performance.request.dto";

import { PerformancePreviewResponseDto } 
from "./dto/api/performance.response.dto";

import { PromptAOutputDto } 
from "./dto/prompt/prompt.a.output.dto";

import { PromptBOutputDto } 
from "./dto/prompt/prompt.b.output.dto";


export class AiService {

  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
  ) {}


  async generatePerformancePreview(
    request: PerformancePreviewRequestDto,
  ): Promise<PerformancePreviewResponseDto> {


    // 1. Prompt A 생성
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: request.tasks,
        reflection: request.reflection,
        projectTag: request.projectTag,
        userJob: request.userJob,
      });


    // 2. LLM 호출
    const promptAResponse =
      await this.llmClient.generate(
        promptARequest,
      );


    // 3. Prompt A Parsing
    const promptAResult =
      this.responseParser.parse<PromptAOutputDto>(
        promptAResponse,
      );


    // 4. Prompt A Rule 검증
    this.ruleEngine.validatePromptA(
      promptAResult,
    );


    // 5. Prompt B 생성
    const promptBRequest =
      this.promptManager.buildPromptB({
        tasks: promptAResult.tasks,
        userJob: request.userJob,
        projectTag: request.projectTag,
      });


    // 6. LLM 호출
    const promptBResponse =
      await this.llmClient.generate(
        promptBRequest,
      );


    // 7. Prompt B Parsing
    const promptBResult =
      this.responseParser.parse<PromptBOutputDto>(
        promptBResponse,
      );


    // 8. Prompt B Rule 검증
    this.ruleEngine.validatePromptB(
      promptBResult,
    );


    // 9. API Response 반환
    return {
      summary:
        promptBResult.summary,

      growthInsights:
        promptBResult.growthInsights,

      nextActions:
        promptBResult.nextActions,

      taskPerformances:
        promptBResult.taskPerformances,
    };
  }
}