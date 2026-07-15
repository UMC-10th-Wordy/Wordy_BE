import { prisma } from "../../db.config.js";


// 특정 기간 내 해당 유저의 일지 개수 세기 
export const countDailyEntries = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  return prisma.dailyEntry.count({
    where: {
      userId,
      deletedAt: null,
      entryDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
};

// 유저의 대시보드 목록 조회
export const findDashboards = async (userId: string) => {
  return prisma.dashboard.findMany({
    where: { userId, deletedAt: null },
    orderBy: { startDate: "desc" },
  });
};

// 대시보드 상세 조회
export const findDashboardById = async (
  dashboardId: string,
  userId: string
) => {
  return prisma.dashboard.findFirst({
    where: { dashboardId, userId, deletedAt: null },
    include: {
      insights: true,
      kpis: true,
      tagAnalyses: true,
      weeklyReflections: true,
      performances: {
        include: {
          dailyPerformance: {
            include: {
              performanceItems: true,
            },
          },
        },
      },
    },
  });
};

// 대시보드 존재 확인 (회고 작성 전 검증용)
export const existsDashboard = async (
  dashboardId: string,
  userId: string
): Promise<boolean> => {
  const found = await prisma.dashboard.findFirst({
    where: { dashboardId, userId, deletedAt: null },
    select: { dashboardId: true },
  });
  return found !== null;
};

// 주간 회고 생성
export const createWeeklyReflection = async (
  dashboardId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  return prisma.weeklyReflection.create({
    data: {
      dashboardId,
      workSummary: data.workSummary ?? null,
      resourcesUsed: data.resourcesUsed ?? null,
      learning: data.learning ?? null,
    },
  });
};

// 주간 회고 존재 확인 (수정 전 검증용)
export const findReflectionById = async (
  weeklyReflectionId: string,
  dashboardId: string
) => {
  return prisma.weeklyReflection.findFirst({
    where: { weeklyReflectionId, dashboardId },
  });
};

// 회고 수정
export const updateWeeklyReflection = async (
  weeklyReflectionId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  return prisma.weeklyReflection.update({
    where: { weeklyReflectionId },
    data: {
      ...(data.workSummary !== undefined && { workSummary: data.workSummary }),
      ...(data.resourcesUsed !== undefined && { resourcesUsed: data.resourcesUsed }),
      ...(data.learning !== undefined && { learning: data.learning }),
    },
  });
};

//일지 목록 조회
export const findDailyEntries = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.dailyEntry.findMany({
    where: {
      userId,
      deletedAt: null,
      entryDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { entryDate: "asc" },
    select: {
      dailyEntryId: true,
      entryDate: true,
    },
  });
};