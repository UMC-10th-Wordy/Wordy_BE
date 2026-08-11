import { prisma } from "../../db.config.js";

//  주의: 스키마에 주간/월간 구분 필드(type)가 없어서
// 지금은 Dashboard 테이블 전체를 대상으로 함. 팀과 type 필드 논의 필요.

// 특정 기간 내 주간 대시보드 목록 조회 (월간 생성 재료)
export const findWeeklyDashboards = async (
  userId:string,
  startDate:Date,
  endDate:Date
)=>{
  return prisma.dashboard.findMany({
    where:{
    userId,
    deletedAt:null,
    startDate:{
      gte:startDate,
    },
    endDate:{
      lte:endDate,
    },
    },
    orderBy:{
    startDate:"asc",
    },
    include:{
    kpis:true,
    tagAnalyses:true,
    weeklyReflections:true,
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
// AI 결과로 월간 대시보드 생성 (하위 데이터까지 한 번에 저장)
export const createMonthlyDashboard = async (data: {
  userId: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  journalDays: number;
  performanceCount: number;
  tagCount: number;
  kpis: { kpiName: string; progress: string }[];
  tagAnalyses:{
    tagName:string;
    achievementStatus:string;
    insight:string;
  }[];
}) => {
  return prisma.dashboard.create({
    data: {
      userId: data.userId,
      startDate: data.startDate,
      endDate: data.endDate,
      summary: data.summary,
      journalDays: data.journalDays,
      performanceCount: data.performanceCount,
      tagCount: data.tagCount,
      kpis: {
        create: data.kpis.map((k) => ({
          kpiName: k.kpiName,
          progress: k.progress,
        })),
      },
      tagAnalyses:{
        create:data.tagAnalyses.map((t)=>({
          tagName:t.tagName,
          achievementStatus:t.achievementStatus,
          insight:t.insight,
        }))
      },
      insights: {
        create: [
          {
            journalDays: data.journalDays,
            performanceCount: data.performanceCount,
            tagCount: data.tagCount,
          },
        ],
      },
    },
  });
};

// 월간 회고 존재 확인 (수정 전 검증용)
export const findMonthlyReflectionById = async (
  weeklyReflectionId: string,
  dashboardId: string
) => {
  return prisma.weeklyReflection.findFirst({
    where: { weeklyReflectionId, dashboardId },
  });
};

// 월간 회고 수정
export const updateMonthlyReflection = async (
  weeklyReflectionId: string,
  data: { workSummary?: string; resourcesUsed?: string; learning?: string }
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
export const softDeleteMonthlyDashboardByPeriod = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return prisma.dashboard.updateMany({
    where: {
      userId,
      startDate,
      endDate,
      type: "MONTHLY",
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
};