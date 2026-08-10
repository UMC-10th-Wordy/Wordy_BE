import { prisma } from "../../db.config.js";
import { DraftType, Prisma } from "../../generated/prisma/client.js";

// draft 저장 (있으면 덮어쓰기, 없으면 생성)
export const upsertDraft = async (
  userId: string,
  workspaceId: string,
  type: DraftType,
  data: {
    workSummary?: string | null;
    resourcesUsed?: string | null;
    learning?: string | null;
    taskPlans?: unknown;   // JSON (업무계획 리스트)
  }
) => {
  // B안: taskPlans는 항상 통째로 덮어씀 (미전송 시 빈 배열로 초기화)
  const taskPlansValue = (data.taskPlans ?? []) as Prisma.InputJsonValue;

  return prisma.reflectionDraft.upsert({
    where: { userId_workspaceId_type: { userId, workspaceId, type } },   // @@unique([userId, type])
    update: {
      workSummary: data.workSummary ?? null,
      resourcesUsed: data.resourcesUsed ?? null,
      learning: data.learning ?? null,
      taskPlans: taskPlansValue,
    },
    create: {
      userId,
      workspaceId,
      type,
      workSummary: data.workSummary ?? null,
      resourcesUsed: data.resourcesUsed ?? null,
      learning: data.learning ?? null,
      taskPlans: taskPlansValue,
    },
  });
};

// draft 조회 (유저 + type 기준, 없으면 null)
export const findDraft = async (userId: string, workspaceId: string, type: DraftType) => {
  return prisma.reflectionDraft.findUnique({
    where: { userId_workspaceId_type: { userId, workspaceId, type } },
  });
};