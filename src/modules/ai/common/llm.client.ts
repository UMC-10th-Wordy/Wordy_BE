import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import { PromptRequest } from "../types/ai.types.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";

export class LlmClient {
  private readonly openaiClient: OpenAI;
  private readonly anthropicClient: Anthropic;

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generate(request: PromptRequest): Promise<string> {
    const startTime = performance.now(); // 응답 속도 테스트

    try {
      let result: string;

      if (request.model.startsWith("claude-")) {
        result = await this.generateWithClaude(request);
      } else {
        result = await this.generateWithOpenAI(request);
      }

      const elapsedTime = performance.now() - startTime; // 응답 속도 테스트

      console.log(
        `[LLM] model=${request.model} | elapsed=${(elapsedTime / 1000).toFixed(2)}s`,
      );

      return result;
    } catch (error) {
      const elapsedTime = performance.now() - startTime;

      console.error(
        `[LLM ERROR] model=${request.model} | elapsed=${(elapsedTime / 1000).toFixed(2)}s`,
        error,
      );

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "LLM 호출에 실패했습니다.",
      );
    }
  }

  private async generateWithOpenAI(
    request: PromptRequest,
  ): Promise<string> {
    const response = await this.openaiClient.responses.create({
      model: request.model,
      instructions: request.instructions,
      input: request.input,
    });

    if (!response.output_text) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "LLM 응답이 비어 있습니다.",
      );
    }

    return response.output_text;
  }

  private async generateWithClaude(
    request: PromptRequest,
  ): Promise<string> {
    const response = await this.anthropicClient.messages.create({
      model: request.model,
      max_tokens: 4096,
      system: request.instructions,
      messages: [
        {
          role: "user",
          content: request.input,
        },
      ],
    });

    const textBlock = response.content.find(
      (content) => content.type === "text",
    );

    if (!textBlock || textBlock.type !== "text") {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "LLM 응답이 비어 있습니다.",
      );
    }

    return textBlock.text;
  }
}