import OpenAI from "openai";
import { PromptRequest } from "../types/ai.types";
import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

export class LlmClient {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(request: PromptRequest): Promise<string> {
    try {
      const response = await this.client.responses.create({
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
    } catch (error) {
      console.error("[LLM ERROR]", error);

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
}