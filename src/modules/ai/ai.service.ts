import { PromptManager } from "./prompt.manager";
import { LlmClient } from "./llm.client";
import { ResponseParser } from "./response.parser";
import { RuleEngine } from "./rule.engine";


import { PerformanceRequestDto } 
from "./dto/performance/api/performance.request.dto";

import { PerformanceQuestionRequestDto } 
from "./dto/performance/api/performance.question.request.dto";

import { PerformanceResponseDto } 
from "./dto/performance/api/performance.response.dto";


import { PromptAOutputDto } 
from "./dto/performance/prompt/prompt.a.output.dto";

import { PromptBOutputDto } 
from "./dto/performance/prompt/prompt.b.output.dto";

export class AiService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
  ) {}

  // 첫 번째 호출
  async generatePerformancePreview(
    request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {

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

    // 5. 보충 질문 판단
    if (
      this.ruleEngine.needFollowUpQuestion(
        promptAResult,
      )
    ) {

      return {
        status: "QUESTION_REQUIRED",
        supplementQuestions:
          promptAResult.followUpQuestions,
      };
    }

    // 6. Prompt B 생성
    return this.createPerformanceResult(
      promptAResult,
      request,
    );
  }

  // 질문 답변 후 최종 생성
  async completePerformancePreview(
    request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {

    // 답변 포함해서 Prompt A 재호출
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks:
          request.originalRequest.tasks,
        reflection:
          request.originalRequest.reflection,
        projectTag:
          request.originalRequest.projectTag,
        userJob:
          request.originalRequest.userJob,
        supplementAnswers:
          request.answers,
      });

    const promptAResponse =
      await this.llmClient.generate(
        promptARequest,
      );

    const promptAResult =
      this.responseParser.parse<PromptAOutputDto>(
        promptAResponse,
      );

    this.ruleEngine.validatePromptA(
      promptAResult,
    );

    // 여기서는 질문 판단 X
    // 답변했거나 건너뛰었기 때문에 바로 생성
    return this.createPerformanceResult(
      promptAResult,
      request.originalRequest,
    );
  }

  // Prompt B 실행 + 결과 반환
  private async createPerformanceResult(
    promptAResult: PromptAOutputDto,
    request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {

    // Prompt B 생성
    const promptBRequest =
      this.promptManager.buildPromptB({
        tasks:
          promptAResult.tasks,
        userJob:
          request.userJob,
        projectTag:
          request.projectTag,
      });

    // LLM 호출
    const promptBResponse =
      await this.llmClient.generate(
        promptBRequest,
      );

    // Parsing
    const promptBResult =
      this.responseParser.parse<PromptBOutputDto>(
        promptBResponse,
      );

    // Rule 검증
    this.ruleEngine.validatePromptB(
      promptBResult,
    );

    return {
      status: "COMPLETED",

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