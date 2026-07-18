import { PromptRequest } from "../types/ai.types";
import { kpiInstructions, promptAInstructions, promptBInstructions, promptCInstructions } from "../prompts";

import { KpiInputDto } from "../kpi/dto/prompt/kpi.input.dto";
import { PromptAInputDto } from "../performance/dto/prompt/prompt.a.input.dto";
import { PromptBInputDto } from "../performance/dto/prompt/prompt.b.input.dto";
import { PromptCInputDto } from "../dashboard/dto/prompt/prompt.c.input.dto";

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
      instructions: promptCInstructions,
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