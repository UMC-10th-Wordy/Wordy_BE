import { ApiResponse } from "./api.response.js";

export const success = <T>(
  code: string,
  message: string,
  result: T
): ApiResponse<T> => ({
  success: true,
  code,
  message,
  result,
});