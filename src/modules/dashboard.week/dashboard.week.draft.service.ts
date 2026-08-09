import { upsertDraft, findDraft } from "./dashboard.week.draft.repository.js";
import { DraftType } from "../../generated/prisma/client.js";
import { verifyAccessToken } from "../../auth.config.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";

// authorization → userId
const getUserId = (authorization: string | undefined): string => {
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new ApiError(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "인증이 필요합니다."
    );
  }
  return verifyAccessToken(token).userId;
};

// draft 저장 (임시저장)
export const saveDraft = async (
  authorization: string | undefined,
  type: DraftType,
  body: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
    taskPlans?: { content: string; expectedTime?: string }[];
  }
) => {
  const userId = getUserId(authorization);

  const draft = await upsertDraft(userId, type, {
    workSummary: body.workSummary ?? null,
    resourcesUsed: body.resourcesUsed ?? null,
    learning: body.learning ?? null,
    taskPlans: body.taskPlans ?? [],
  });

  return {
    reflectionDraftId: draft.reflectionDraftId,
    type: draft.type,
    workSummary: draft.workSummary,
    resourcesUsed: draft.resourcesUsed,
    learning: draft.learning,
    taskPlans: draft.taskPlans ?? [],
    updatedAt: draft.updatedAt.toISOString(),
  };
};

// draft 조회 (복원)
export const getDraft = async (
  authorization: string | undefined,
  type: DraftType
) => {
  const userId = getUserId(authorization);

  const draft = await findDraft(userId, type);
  if (!draft) {
    return null;   // 저장된 draft 없음
  }

  return {
    reflectionDraftId: draft.reflectionDraftId,
    type: draft.type,
    workSummary: draft.workSummary,
    resourcesUsed: draft.resourcesUsed,
    learning: draft.learning,
    taskPlans: draft.taskPlans ?? [],
    updatedAt: draft.updatedAt.toISOString(),
  };
};