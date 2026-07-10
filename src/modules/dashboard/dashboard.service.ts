import {
  countDailyEntries,
  findDashboards,
  findDashboardById,
  existsDashboard,          
  createWeeklyReflection,   
} from "./dashboard.repository.js";

const REQUIRED_DAYS = 3; // 대시보드 생성에 필요한 최소 일지 수

// 이번 주 월요일~일요일 범위 구하기
const getWeekRange = (base: Date = new Date()) => {
  const day = base.getDay(); // 0(일)~6(토)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
};

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

// 생성 조건 충족 여부 확인
export const getEligibility = async (userId: string) => {
  const { start, end } = getWeekRange();
  const journalDays = await countDailyEntries(userId, start, end);

  return {
    eligible: journalDays >= REQUIRED_DAYS,
    journalDays,
    requiredDays: REQUIRED_DAYS,
    weekStart: toDateStr(start),
    weekEnd: toDateStr(end),
  };
};

// 대시보드 목록 조회
export const getDashboardList = async (userId: string) => {
  const dashboards = await findDashboards(userId);
  return dashboards.map((d) => ({
    dashboardId: d.dashboardId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    createdAt: d.createdAt.toISOString(),
  }));
};

// 대시보드 상세 조회
export const getDashboardDetail = async (
  dashboardId: string,
  userId: string
) => {
  const d = await findDashboardById(dashboardId, userId);
  if (!d) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

  return {
    dashboardId: d.dashboardId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    journalDays: d.journalDays,
    performanceCount: d.performanceCount,
    tagCount: d.tagCount,
    insights: d.insights,
    kpis: d.kpis,
    tagAnalyses: d.tagAnalyses.map((t) => ({
      ...t,
      periodStart: t.periodStart ? toDateStr(t.periodStart) : null,
      periodEnd: t.periodEnd ? toDateStr(t.periodEnd) : null,
    })),
    weeklyReflections: d.weeklyReflections,
  };
};

// 주간 회고 작성
export const addWeeklyReflection = async (
  dashboardId: string,
  userId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  // 1. 대시보드가 존재하고 이 유저 것인지 확인
  const exists = await existsDashboard(dashboardId, userId);
  if (!exists) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

  // 2. 회고 저장
  const reflection = await createWeeklyReflection(dashboardId, data);

  return {
    weeklyReflectionId: reflection.weeklyReflectionId,
    workSummary: reflection.workSummary,
    resourcesUsed: reflection.resourcesUsed,
    learning: reflection.learning,
    createdAt: reflection.createdAt.toISOString(),
  };
};