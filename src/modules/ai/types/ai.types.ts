export interface PromptRequest {
  model: string;
  instructions: string;
  input: string;
}

export interface LlmClient {
  generate(
    request: PromptRequest,
  ): Promise<string>;
}