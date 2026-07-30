import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";

export class ResponseParser {
  parse<T>(response: string): T {
    if (!response.trim()) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "AI 응답이 비어 있습니다.",
      );
    }

    try {
      const json = this.extractJson(response);

      return JSON.parse(json) as T;
    } catch (error) {
      console.error("[Response Parser]", error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "AI 응답을 파싱할 수 없습니다.",
      );
    }
  }

  private extractJson(response: string): string {
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR.status,
        ErrorCode.INTERNAL_SERVER_ERROR.code,
        "AI 응답에서 JSON을 찾을 수 없습니다.",
      );
    }

    return cleaned.substring(start, end + 1);
  }
}