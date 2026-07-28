import { prisma } from "../../db.config.js";

// ============================================================
// 요약 카드용
// ============================================================

// 기간 내 일지 개수 (이번 달 / 지난 달 비교용)
export const countEntriesBetween = async (
  userId: string,
  start: Date,
  end: Date
): Promise<number> => {
  return prisma.dailyEntry.count({
    where: {
      userId,
      deletedAt: null,
      entryDate: { gte: start, lte: end },
    },
  });
};

// 유저의 모든 일지 날짜 (연속 작성 streak 계산용)
export const findAllEntryDates = async (userId: string) => {
  return prisma.dailyEntry.findMany({
    where: { userId, deletedAt: null },
    orderBy: { entryDate: "desc" },
    select: { entryDate: true },
  });
};

// ============================================================
// 월별 목록 / 태그 집계용
// 일지 + 연결된 업무(ReflectionTask → Task → Tag) 정보
// ============================================================
export const findEntriesWithTags = async (userId: string) => {
  return prisma.dailyEntry.findMany({
    where: { userId, deletedAt: null },
    orderBy: { entryDate: "desc" },
    select: {
      dailyEntryId: true,
      entryDate: true,
      reflectionContent: true,
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
  start: Date,
  end: Date
) => {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      deletedAt: null,
      entryDate: { gte: start, lte: end },
    },
    orderBy: { entryDate: "desc" },
    select: {
      dailyEntryId: true,
      entryDate: true,
      reflectionContent: true,
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
// 일자 상세 => 스냅샷 기반으로 변경
// ============================================================
export const findEntryDetail = async (userId: string, dailyEntryId: string) => {
  return prisma.dailyEntry.findFirst({
    where: { dailyEntryId, userId, deletedAt: null },
    include: {
      reflectionSnapshots: {
        orderBy: { createdAt: "desc" },
        include: {
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
    },
  });
};

// 삭제 전 존재/소유 확인
export const findEntryById = async (userId: string, dailyEntryId: string) => {
  return prisma.dailyEntry.findFirst({
    where: { dailyEntryId, userId, deletedAt: null },
    select: { dailyEntryId: true },
  });
};

// 일지 소프트 삭제
export const softDeleteEntry = async (dailyEntryId: string) => {
  return prisma.dailyEntry.update({
    where: { dailyEntryId },
    data: { deletedAt: new Date() },
  });
};

// ============================================================
// 검색
// ============================================================

// 업무 일지 검색: 회고 내용 / 업무 제목 / 업무 결과 내용에서 키워드 매칭
export const searchEntries = async (
  userId: string,
  keyword: string,
  sort: "latest" | "oldest"
) => {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { reflectionContent: { contains: keyword } },
        {
          reflectionTasks: {
            some: { task: { title: { contains: keyword }, deletedAt: null } },
          },
        },
        {
          reflectionTasks: {
            some: {
              task: {
                taskResult: { content: { contains: keyword }, deletedAt: null },
                deletedAt: null,
              },
            },
          },
        },
      ],
    },
    orderBy: { entryDate: sort === "oldest" ? "asc" : "desc" },
    select: {
      dailyEntryId: true,
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
  keyword: string
): Promise<number> => {
  return prisma.tag.count({
    where: {
      userId,
      deletedAt: null,
      tagName: { contains: keyword },
    },
  });
};