import { PromptRequest } from "./types/ai.types";

import { PromptAInputDto } from "./dto/performance/prompt/prompt.a.input.dto";
import { PromptBInputDto } from "./dto/performance/prompt/prompt.b.input.dto";
import { PromptCInputDto } from "./dto/dashboard/prompt/prompt.c.input.dto";
import { KpiInputDto } from "./dto/kpi/prompt/kpi.input.dto";

import { kpiInstructions, promptAInstructions, promptBInstructions, promptCInstructions } from "./prompts";

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

  buildDashboardPrompt(
  dto: PromptCInputDto
  ): PromptRequest {
    return {
      model:"gpt-5-mini",
      instructions:
        promptCInstructions,
      input:
        JSON.stringify(dto),
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