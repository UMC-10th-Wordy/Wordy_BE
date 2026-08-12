import { prisma } from "../../db.config.js";

// ============================================================
// 요약 카드용
// ============================================================

// 기간 내 일지 개수 (이번 달 / 지난 달 비교용)
export const countEntriesBetween = async (
  userId: string,
  workspaceId: string,
  start: Date,
  end: Date
): Promise<number> => {
  return prisma.dailyEntry.count({
    where: {
      userId,
      workspaceId,
      deletedAt: null,
      entryDate: { gte: start, lte: end },
    },
  });
};

// 유저의 모든 일지 날짜 (연속 작성 streak 계산용)
export const findAllEntryDates = async (userId: string, workspaceId: string) => {
  return prisma.dailyEntry.findMany({
    where: { userId, workspaceId, deletedAt: null },
    orderBy: { entryDate: "desc" },
    select: { entryDate: true },
  });
};

// ============================================================
// 월별 목록 / 태그 집계용
// 일지 + 연결된 업무(ReflectionTask → Task → Tag) 정보
// ============================================================
export const findEntriesWithTags = async (userId: string, workspaceId: string) => {
  return prisma.dailyEntry.findMany({
    where: { userId, workspaceId, deletedAt: null },
    orderBy: { entryDate: "desc" },
    select: {
      dailyEntryId: true,
      workspaceId: true,
      entryDate: true,
      reflectionContent: true,
      reflectionSnapshots: {
        select: { status: true, promptBResult: true },
      },
      reflectionTasks: {
        select: {
          task: {
            select: {
              taskId: true,
              title: true,
              deletedAt: true,
              tag: { select: { tagName: true, color: true } },
            },
          },
        },
      },
    },
  });
};

// 특정 월(기간)의 일지 목록 (월 펼쳤을 때)
export const findEntriesByMonth = async (
  userId: string,
  workspaceId: string,
  start: Date,
  end: Date
) => {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      workspaceId,
      deletedAt: null,
      entryDate: { gte: start, lte: end },
    },
    orderBy: { entryDate: "desc" }, // orderBy: createdAt desc + reflectionTaskSnapshots
    select: {
      dailyEntryId: true,
      workspaceId: true,
      entryDate: true,
      reflectionContent: true,
      reflectionSnapshots: {
        orderBy: { createdAt: "desc" },
        select: {
          status: true,
          promptBResult: true,
          reflectionTaskSnapshots: {
            select: {
              title: true,
              priority: true,
              task: {
                select: {
                  tag: { select: { tagName: true, color: true } },
                },
              },
            },
          },
        },
      },
      reflectionTasks: {
        select: {
          task: {
            select: {
              taskId: true,
              title: true,
              priority: true,
              deletedAt: true,
              tag: { select: { tagName: true, color: true } },
            },
          },
        },
      },
    },
  });
};

// ============================================================
// 날짜별 일지 조회 (오늘의 업무 화면 회고 복원용)
// ============================================================
export const findEntryByDate = async (
  userId: string,
  workspaceId: string,
  entryDate: Date,
) => {
  return prisma.dailyEntry.findFirst({
    where: {
      userId,
      workspaceId,
      entryDate,
      deletedAt: null,
    },
    select: {
      dailyEntryId: true,
      workspaceId: true,
      entryDate: true,
      reflectionContent: true,
    },
  });
};
export type DailyEntryDetailScope = "active" | "trashed";
// ============================================================
// 일자 상세 => 스냅샷 기반으로 변경
// ============================================================
export const findEntryDetail = async (
  userId: string,
  workspaceId: string | null,
  dailyEntryId: string,
  scope: DailyEntryDetailScope = "active"
) => {
  return prisma.dailyEntry.findFirst({
    where: {
      dailyEntryId,
      userId,
      workspaceId,
      deletedAt: scope === "active" ? null : { not: null },
    },
    include: {
      // 변환됨: 스냅샷 (그 시점 박제) + 성과 미리보기 ID
      reflectionSnapshots: {
        orderBy: { createdAt: "desc" },
        include: {
          dailyPerformances: {
            orderBy: { createdAt: "desc" },
            select: { dailyPerformanceId: true },
          },
          reflectionTaskSnapshots: {
            include: {
              task: { include: { tag: true } },
              resultSnapshots: {
                include: {
                  taskResult: {
                    include: {
                      attachments: { where: { deletedAt: null } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // 변환 전: 현재 Task
      reflectionTasks: {
        include: {
          task: {
            include: {
              tag: true,
              taskResult: {
                include: {
                  attachments: { where: { deletedAt: null } },
                },
              },
            },
          },
        },
      },
    },
  });
};

// 삭제 전 존재/소유 확인
export const findEntryById = async (userId: string, workspaceId: string, dailyEntryId: string) => {
  return prisma.dailyEntry.findFirst({
    where: { dailyEntryId, userId, workspaceId, deletedAt: null },
    select: { dailyEntryId: true },
  });
};

// 일지 소프트 삭제
export const softDeleteEntry = async (dailyEntryId: string, workspaceId: string,) => {
  return prisma.dailyEntry.update({
    where: { dailyEntryId, workspaceId },
    data: { deletedAt: new Date() },
  });
};

// ============================================================
// 검색
// ============================================================

// 업무 일지 검색: 회고 내용 / 업무 제목 / 업무 결과 내용에서 키워드 매칭
export const searchEntries = async (
  userId: string,
  workspaceId: string,
  keyword: string,
  sort: "latest" | "oldest"
) => {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      workspaceId,
      deletedAt: null,
      OR: [
        // 업무 일지 제목
        {
          reflectionTasks: {
            some: { task: { title: { contains: keyword }, deletedAt: null } },
          },
        },
        // 프로젝트 태그 이름
        {
          reflectionTasks: {
            some: {
              task: { tag: { tagName: { contains: keyword } }, deletedAt: null },
            },
          },
        },
      ],
    },
    orderBy: { entryDate: sort === "oldest" ? "asc" : "desc" },
    select: {
      dailyEntryId: true,
      workspaceId: true,
      entryDate: true,
      reflectionTasks: {
        select: {
          task: {
            select: {
              title: true,
              deletedAt: true,
              tag: { select: { tagName: true, color: true } },
            },
          },
        },
      },
    },
  });
};

// 프로젝트 태그 검색 (검색 결과 화면의 "프로젝트 태그" 탭 카운트용)
export const countMatchingTags = async (
  userId: string,
  workspaceId: string,
  keyword: string
): Promise<number> => {
  return prisma.tag.count({
    where: {
      userId,
      workspaceId,
      deletedAt: null,
      tagName: { contains: keyword },
    },
  });
};

// 제목 검색 (업무 일지 탭)
export const searchByTitle = async (
  userId: string,
  workspaceId: string,
  keyword: string,
  sort: "latest" | "oldest"
) => {
  return prisma.reflectionTask.findMany({
    where: {
      dailyEntry: {
        userId,
        workspaceId,
        deletedAt: null,
        // 변환 안 된 일지만 (유효 스냅샷 없음)
        reflectionSnapshots: {
          none: {
            status: { in: ["TEMP", "SAVED"] },
          },
        },
      },
      task: { deletedAt: null, title: { contains: keyword } },
    },
    orderBy: { dailyEntry: { entryDate: sort === "oldest" ? "asc" : "desc" } },
    select: {
      dailyEntry: { select: { dailyEntryId: true, workspaceId: true, entryDate: true } },
      task: {
        select: {
          title: true,
          tag: { select: { tagName: true, color: true } },
        },
      },
    },
  });
};

// 태그 검색 (프로젝트 태그 탭)
export const searchByTag = async (
  userId: string,
  workspaceId: string,
  keyword: string,
  sort: "latest" | "oldest"
) => {
  return prisma.tag.findMany({
    where: {
      userId,
      workspaceId,
      deletedAt: null,
      tagName: { contains: keyword },
    },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
    select: {
      tagName: true,
      color: true,
      tasks: {
        where: { deletedAt: null },
        select: {
          taskId: true,
          title: true,   // ← 추가 (그 태그 붙은 업무 제목)
          reflectionTasks: {
            where: { dailyEntry: { deletedAt: null } },
            select: {
              dailyEntry: {
                select: {
                  dailyEntryId: true,
                  workspaceId: true,
                  entryDate: true,
                  title: true,
                  reflectionSnapshots: {
                    where: { status: { in: ["TEMP", "SAVED"] } },
                    select: {
                      status: true,
                      reflectionTaskSnapshots: {
                        select: { taskId: true, title: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const searchBySnapshotTitle = async (
  userId: string,
  workspaceId: string,
  keyword: string,
  sort: "latest" | "oldest"
) => {
  return prisma.reflectionTaskSnapshot.findMany({
    where: {
      title: { contains: keyword },
      reflectionSnapshot: {
        status: { in: ["TEMP", "SAVED"] },
        dailyEntry: { userId, workspaceId, deletedAt: null },
      },
    },
    orderBy: {
      reflectionSnapshot: { dailyEntry: { entryDate: sort === "oldest" ? "asc" : "desc" } },
    },
    select: {
      title: true,
      reflectionSnapshot: {
        select: {
          dailyEntry: {
            select: { dailyEntryId: true, workspaceId: true, entryDate: true },
          },
        },
      },
      task: {
        select: {
          tag: { select: { tagName: true, color: true } },
        },
      },
    },
  });
};