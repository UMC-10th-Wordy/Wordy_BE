import { PromptRequest } from "../types/ai.types.js";
import { kpiInstructions, promptAInstructions, promptBInstructions, promptCInstructions, promptDInstructions } from "../prompts/index.js";

import { KpiInputDto } from "../kpi/dto/prompt/kpi.input.dto.js";
import { PromptAInputDto } from "../performance/dto/prompt/prompt.a.input.dto.js";
import { PromptBInputDto } from "../performance/dto/prompt/prompt.b.input.dto.js";
import { PromptCInputDto } from "../dashboard/dto/prompt/prompt.c.input.dto.js";
import { PromptDInputDto } from "../dashboard/dto/prompt/prompt.d.input.dto.js";

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

  buildPromptC(dto: PromptCInputDto): PromptRequest {
    return {
      model:"gpt-5-mini",
      instructions: promptCInstructions,
      input: JSON.stringify(dto),
    };
  }

  buildPromptD(dto: PromptDInputDto): PromptRequest {
    return {
      model:"gpt-5-mini",
      instructions: promptDInstructions,
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