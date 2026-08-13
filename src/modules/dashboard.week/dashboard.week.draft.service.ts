import { upsertDraft, findDraft } from "./dashboard.week.draft.repository.js";
import { DraftType } from "../../generated/prisma/client.js";
import { verifyAccessToken } from "../../auth.config.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { TaskPlanItem } from "./dashboard.week.draft.dto.js";

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

// baseDate가 속한 주의 시작일(일요일, 날짜만) → draft 주차 식별 키
const getWeekStart = (base: Date): Date => {
  const d = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate())
  );
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // 그 주 일요일로 이동
  return d;
};

// draft 저장 (임시저장)
export const saveDraft = async (
  authorization: string | undefined,
  workspaceId: string,
  type: DraftType,
  baseDate: string,
  body: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
    taskPlans?: { content: string; expectedTime?: string }[];
  }
) => {
  const userId = getUserId(authorization);
  const periodStart = getWeekStart(new Date(baseDate));

  const draft = await upsertDraft(userId, workspaceId, type, periodStart, {
    workSummary: body.workSummary ?? null,
    resourcesUsed: body.resourcesUsed ?? null,
    learning: body.learning ?? null,
    taskPlans: body.taskPlans ?? [],
  });

  return {
    reflectionDraftId: draft.reflectionDraftId,
    workspaceId: draft.workspaceId,
    type: draft.type,
    workSummary: draft.workSummary,
    resourcesUsed: draft.resourcesUsed,
    learning: draft.learning,
    taskPlans: (draft.taskPlans ?? []) as unknown as TaskPlanItem[],  
    updatedAt: draft.updatedAt.toISOString(),
  };
};

// draft 조회 (복원)
export const getDraft = async (
  authorization: string | undefined,
  workspaceId: string,
  type: DraftType,
  baseDate: string
) => {
  const userId = getUserId(authorization);
  const periodStart = getWeekStart(new Date(baseDate));

  const draft = await findDraft(userId, workspaceId, type, periodStart);
  if (!draft) {
    return null;   // 저장된 draft 없음
  }

  return {
    reflectionDraftId: draft.reflectionDraftId,
    workspaceId: draft.workspaceId,
    type: draft.type,
    workSummary: draft.workSummary,
    resourcesUsed: draft.resourcesUsed,
    learning: draft.learning,
    taskPlans: (draft.taskPlans ?? []) as unknown as TaskPlanItem[],    
    updatedAt: draft.updatedAt.toISOString(),
  };
};