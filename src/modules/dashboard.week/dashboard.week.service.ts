import {
  countDailyEntries,
  findDashboards,
  findDashboardById,
  existsDashboard,          
  createWeeklyReflection,   
  findReflectionById,     
  updateWeeklyReflection,
  findDailyEntries,
  createDashboard,
} from "./dashboard.week.repository.js";

import { DashboardService } from "../ai/dashboard/dashboard.service.js";
import { LlmClient } from "../ai/common/llm.client.js";
import { PromptManager } from "../ai/common/prompt.manager.js";
import { ResponseParser } from "../ai/common/response.parser.js";
import { RuleEngine } from "../ai/common/rule.engine.js";
import { prisma } from "../../db.config.js";
import { verifyAccessToken } from "../../auth.config.js"; // 인증토큰 받아오기
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";

const REQUIRED_DAYS = 3; // 대시보드 생성에 필요한 최소 일지 수

// 이번 주 월요일~일요일 범위 구하기, 시간 UTC로 변경
const getWeekRange = (base: Date = new Date()) => {
  const day = base.getUTCDay(); // 0=일 ... 6=토

  // 일요일 시작
  const sunday = new Date(Date.UTC(
    base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - day,
    0, 0, 0, 0
  ));

  // 토요일 끝
  const saturday = new Date(sunday);
  saturday.setUTCDate(sunday.getUTCDate() + 6);
  saturday.setUTCHours(23, 59, 59, 999);

  const baseYear = base.getUTCFullYear();
  const baseMonth = base.getUTCMonth();

  // 월 경계 절단: 시작이 이전 달이면 → 이번 달 1일로
  let start = sunday;
  if (sunday.getUTCMonth() !== baseMonth || sunday.getUTCFullYear() !== baseYear) {
    start = new Date(Date.UTC(baseYear, baseMonth, 1, 0, 0, 0, 0));
  }

  // 월 경계 절단: 끝이 다음 달이면 → 이번 달 말일로
  let end = saturday;
  if (saturday.getUTCMonth() !== baseMonth || saturday.getUTCFullYear() !== baseYear) {
    end = new Date(Date.UTC(baseYear, baseMonth + 1, 0, 23, 59, 59, 999));
  }

  return { start, end };
};
const toDateStr = (d: Date) => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 생성 조건 충족 여부 확인 (baseDate: 조회할 주의 기준 날짜)
export const getEligibility = async (userId: string, workspaceId: string, baseDate?: string) => {
  // baseDate가 있으면 그 날짜 기준, 없으면 오늘 기준
  let base = new Date();
  if (baseDate) {
    const parsed = new Date(baseDate);
    if (isNaN(parsed.getTime())) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "baseDate 형식이 올바르지 않습니다. (예: 2026-07-31)"
      );
    }
    base = parsed;
  }

  const { start, end } = getWeekRange(base);

  // 그 주의 실제 일수 (월 경계로 절단된 주는 3일 미만일 수 있음)
  // → 요구 일수를 min(REQUIRED_DAYS, 실제 일수)로 제한
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const daysInWeek =
    Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const requiredDays = Math.min(REQUIRED_DAYS, daysInWeek);

  const entries = await findDailyEntries(userId, workspaceId, start, end);

  return {
    workspaceId,
    eligible: entries.length >= requiredDays,
    journalDays: entries.length,
    requiredDays: requiredDays,
    weekStart: toDateStr(start),
    weekEnd: toDateStr(end),
    entries: entries.map((e: typeof entries[number]) => ({
      dailyEntryId: e.dailyEntryId,
      entryDate: toDateStr(e.entryDate),
      converted: e.reflectionSnapshots.some(
        (s) =>
          (s.status === "TEMP" || s.status === "SAVED") &&
          s.promptBResult != null
      ),
    })),
  };
};

// 대시보드 목록 조회
export const getDashboardList = async (userId: string, workspaceId: string,) => {
  const dashboards = await findDashboards(userId, workspaceId);
  return dashboards.map((d: typeof dashboards[number]) => ({
    dashboardId: d.dashboardId,
    workspaceId: d.workspaceId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    createdAt: d.createdAt.toISOString(),
  }));
};

// 대시보드 상세 조회npm run dev
export const getDashboardDetail = async (
  dashboardId: string,
  userId: string,
  workspaceId: string,
) => {
  const d = await findDashboardById(dashboardId, userId, workspaceId);
  if (!d) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }
  // 완료율 계산 (연결된 성과들의 완료 업무 / 전체 업무, 정수 %)
  const totalTasks = d.performances.reduce(
    (sum: number, p: typeof d.performances[number]) =>
      sum + p.dailyPerformance.totalTaskCount,
    0
  );
  const completedTasks = d.performances.reduce(
    (sum: number, p: typeof d.performances[number]) =>
      sum + p.dailyPerformance.completedTaskCount,
    0
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
    dashboardId: d.dashboardId,
    workspaceId: d.workspaceId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    journalDays: d.journalDays,
    performanceCount: d.performanceCount,
    tagCount: d.tagCount,
    insights: d.insights.map((i: typeof d.insights[number]) => ({
      ...i,
      completionRate,
    })),
    kpis: d.kpis,
    tagAnalyses: d.tagAnalyses.map((t: typeof d.tagAnalyses[number]) => ({
      ...t,
      periodStart: t.periodStart ? toDateStr(t.periodStart) : null,
      periodEnd: t.periodEnd ? toDateStr(t.periodEnd) : null,
    })),
    weeklyReflections: d.weeklyReflections,
    performances: d.performances.map((p: typeof d.performances[number]) => ({
      dailyEntryId: p.dailyPerformance.dailyEntryId,   //추가
      achievementRate: p.dailyPerformance.achievementRate,
      summary: p.dailyPerformance.summary,
      growthInsight: p.dailyPerformance.growthInsight,
      nextAction: p.dailyPerformance.nextAction,
      items: p.dailyPerformance.performanceItems.map((item: typeof p.dailyPerformance.performanceItems[number]) => ({
        output: item.output,
        impact: item.impact,
      })),
    })),
  };
};

// 주간 회고 작성
export const addWeeklyReflection = async (
  dashboardId: string,
  userId: string,
  workspaceId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  // 1. 대시보드가 존재하고 이 유저 것인지 확인
  const exists = await existsDashboard(dashboardId, userId, workspaceId);
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

// 회고 수정
export const editWeeklyReflection = async (
  dashboardId: string,
  reflectionId: string,
  userId: string,
  workspaceId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  // 대시보드가 이 유저 것인지 확인
  const exists = await existsDashboard(dashboardId, userId, workspaceId);
  if (!exists) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

  // 회고가 이 대시보드 것인지 확인
  const reflection = await findReflectionById(reflectionId, dashboardId);
  if (!reflection) {
    throw new Error("해당 회고를 찾을 수 없습니다.");
  }

  //  수정
  const updated = await updateWeeklyReflection(reflectionId, data);

  return {
    weeklyReflectionId: updated.weeklyReflectionId,
    workSummary: updated.workSummary,
    resourcesUsed: updated.resourcesUsed,
    learning: updated.learning,
  };
};

// 대시보드 생성 (AI 호출 → DB 저장)
export const createDashboardWithAI = async (
  authorization: string | undefined,
  workspaceId: string,
  startDate: string,
  endDate: string
) => {
  // authorization에서 userId 추출 (DB 저장용)
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    throw new Error("인증이 필요합니다.");
  }
  const userId = verifyAccessToken(token).userId;

  // 1. AI 서비스 인스턴스 생성
  const aiService = new DashboardService(
    new LlmClient(),
    new PromptManager(),
    new ResponseParser(),
    new RuleEngine(),
    prisma
  );

  // 2. AI로 대시보드 내용 생성 (authorization 그대로 전달)
  const aiResult = await aiService.generateWeeklyDashboard(authorization, workspaceId, {
    startDate,
    endDate,
  });

  // 3. DB 저장 (위에서 뽑은 userId 사용)
  const saved = await createDashboard({
    userId,
    workspaceId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    summary: aiResult.summary,
    journalDays: aiResult.performanceCount,
    performanceCount: aiResult.performanceCount,
    tagCount: aiResult.tagAnalyses.length,
    kpis: aiResult.kpis,
    tagAnalyses: aiResult.tagAnalyses,
  });

  return { dashboardId: saved.dashboardId };
};