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

// baseDate 형식/유효성 검증 (YYYY-MM-DD, 실제 존재하는 날짜)
const parseBaseDate = (baseDate: string): Date => {
  const parsed = new Date(baseDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate) || isNaN(parsed.getTime())) {
    throw new ApiError(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "baseDate 형식이 올바르지 않습니다. (예: 2026-07-31)"
    );
  }
  return parsed;
};

// baseDate가 속한 기간의 시작일 → draft 식별 키
// WEEKLY: 그 주 일요일, MONTHLY: 그 달 1일
const getPeriodStart = (base: Date, type: DraftType): Date => {
  if (type === "MONTHLY") {
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  }
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
  const periodStart = getPeriodStart(parseBaseDate(baseDate), type);

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
  const periodStart = getPeriodStart(parseBaseDate(baseDate), type);

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