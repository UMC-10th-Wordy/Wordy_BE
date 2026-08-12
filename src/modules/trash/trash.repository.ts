import { prisma } from "../../db.config.js";

export const findTrashedEntries = async (
  userId: string,
  workspaceId: string,
  skip: number,
  take: number
) => {
  return prisma.dailyEntry.findMany({
    where: { userId, workspaceId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    skip,
    take,
    select: {
      dailyEntryId: true,
      entryDate: true,
      reflectionContent: true,
      deletedAt: true,
    },
  });
};

export const countTrashedEntries = async (userId: string, workspaceId: string) => {
  return prisma.dailyEntry.count({
    where: { userId, workspaceId, deletedAt: { not: null } },
  });
};

export const findTrashedEntryById = async (
  userId: string,
  dailyEntryId: string
) => {
  return prisma.dailyEntry.findFirst({
    where: { dailyEntryId, userId, deletedAt: { not: null } },
    select: {
      dailyEntryId: true,
      workspaceId: true,
    },
  });
};

export const restoreEntry = async (dailyEntryId: string) => {
  return prisma.dailyEntry.update({
    where: { dailyEntryId },
    data: { deletedAt: null },
  });
};

// 일지에 연관되어 생성된 데이터(회고 스냅샷, AI 질문, 성과 등) 삭제. 업무카드/결과는 삭제 안함
export const permanentlyDeleteEntry = async (dailyEntryId: string) => {
  await prisma.$transaction(async (tx) => {
    const snapshots = await tx.reflectionSnapshot.findMany({
      where: { dailyEntryId },
      select: { reflectionSnapshotId: true },
    });
    const snapshotIds = snapshots.map((s) => s.reflectionSnapshotId);

    const taskSnapshots = await tx.reflectionTaskSnapshot.findMany({
      where: { reflectionSnapshotId: { in: snapshotIds } },
      select: { reflectionTaskSnapshotId: true },
    });
    const taskSnapshotIds = taskSnapshots.map(
      (t) => t.reflectionTaskSnapshotId
    );

    const performances = await tx.dailyPerformance.findMany({
      where: { dailyEntryId },
      select: { dailyPerformanceId: true },
    });
    const performanceIds = performances.map((p) => p.dailyPerformanceId);

    await tx.reflectionTaskResultSnapshot.deleteMany({
      where: { reflectionTaskSnapshotId: { in: taskSnapshotIds } },
    });
    await tx.reflectionTaskSnapshot.deleteMany({
      where: { reflectionTaskSnapshotId: { in: taskSnapshotIds } },
    });
    await tx.aIQuestion.deleteMany({
      where: { reflectionSnapshotId: { in: snapshotIds } },
    });
    await tx.performanceItem.deleteMany({
      where: { dailyPerformanceId: { in: performanceIds } },
    });
    await tx.dashboardPerformance.deleteMany({
      where: { dailyPerformanceId: { in: performanceIds } },
    });
    await tx.dailyPerformance.deleteMany({
      where: { dailyEntryId },
    });
    await tx.reflectionSnapshot.deleteMany({
      where: { dailyEntryId },
    });
    await tx.reflectionTask.deleteMany({
      where: { dailyEntryId },
    });
    await tx.dailyEntry.delete({
      where: { dailyEntryId },
    });
  });
};