import { PromptRequest } from "./types/ai.types";

import { PromptAInputDto } from "./dto/prompt/prompt.a.input.dto";
import { PromptBInputDto } from "./dto/prompt/prompt.b.input.dto";
import { KpiInputDto } from "./dto/prompt/kpi.input.dto";

import { kpiInstructions, promptAInstructions, promptBInstructions } from "./prompts";

export class PromptManager {
  buildPromptA(dto: PromptAInputDto): PromptRequest {
    return {
      model: "gpt-5-mini",
      instructions: promptAInstructions,
      input: JSON.stringify(dto),
    };
  }

  buildPromptB(dto: PromptBInputDto): PromptRequest {
    return {
      model: "gpt-5-mini",
      instructions: promptBInstructions,
      input: JSON.stringify(dto),
    };
  }

  buildKpiPrompt(dto: KpiInputDto): PromptRequest {
    return {
      model: "gpt-5-mini",
      instructions: kpiInstructions,
      input: JSON.stringify(dto),
    };
  }
}