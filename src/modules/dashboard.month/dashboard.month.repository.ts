import { prisma } from "../../db.config.js";

//  주의: 스키마에 주간/월간 구분 필드(type)가 없어서
// 지금은 Dashboard 테이블 전체를 대상으로 함. 팀과 type 필드 논의 필요.

// 특정 기간 내 주간 대시보드 목록 조회 (월간 생성 재료)
export const findWeeklyDashboards = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.dashboard.findMany({
    where: {
      userId,
      deletedAt: null,
      startDate: { gte: startDate, lte: endDate },
      // TODO: type: "WEEKLY" 조건 추가 (스키마 수정 후)
    },
    orderBy: { startDate: "asc" },
    select: {
      dashboardId: true,
      startDate: true,
      endDate: true,
      summary: true,
    },
  });
};

// 월간 대시보드 목록 조회
export const findMonthlyDashboards = async (userId: string) => {
  return prisma.dashboard.findMany({
    where: { userId, deletedAt: null },
    // TODO: type: "MONTHLY" 조건 추가
    orderBy: { startDate: "desc" },
  });
};

// 월간 대시보드 상세 조회
export const findMonthlyDashboardById = async (
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
            include: { performanceItems: true },
          },
        },
      },
    },
  });
};

// 대시보드 존재 확인
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

// 월간 회고 생성
export const createMonthlyReflection = async (
  dashboardId: string,
  data: { workSummary?: string; resourcesUsed?: string; learning?: string }
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