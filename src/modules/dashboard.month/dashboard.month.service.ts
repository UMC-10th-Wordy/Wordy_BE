import {
  findWeeklyDashboards,
  findMonthlyDashboards,
  findMonthlyDashboardById,
  existsDashboard,
  createMonthlyReflection,
  findMonthlyReflectionById,   // 추가
  updateMonthlyReflection,     // 추가
} from "./dashboard.month.repository.js";

import { DashboardService } from "../ai/dashboard/dashboard.service.js";
import { LlmClient } from "../ai/common/llm.client.js";
import { PromptManager } from "../ai/common/prompt.manager.js";
import { ResponseParser } from "../ai/common/response.parser.js";
import { RuleEngine } from "../ai/common/rule.engine.js";
import { prisma } from "../../db.config.js";
import { verifyAccessToken } from "../../auth.config.js"; // 인증토큰 받아오기
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";

const REQUIRED_COUNT = 3; // 월간 생성에 필요한 최소 주간 대시보드 수

// 이번 달 1일 ~ 말일 범위 구하기
const getMonthRange = (base: Date = new Date()) => {
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
};

const toDateStr = (d: Date) => {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 월간 생성 조건 충족 여부 확인
export const getMonthlyEligibility = async (
  userId: string,
  workspaceId: string,
  baseDate?: string
) => {
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

  const { start, end } = getMonthRange(base);

  const weeklyDashboards = await findWeeklyDashboards(userId, workspaceId, start, end);

  return {
    workspaceId,
    eligible: weeklyDashboards.length >= REQUIRED_COUNT,
    weeklyDashboardCount: weeklyDashboards.length,
    requiredCount: REQUIRED_COUNT,
    monthStart: toDateStr(start),
    monthEnd: toDateStr(end),
    weeklyDashboards: weeklyDashboards.map((d: typeof weeklyDashboards[number]) => ({
      dashboardId: d.dashboardId,
      startDate: toDateStr(d.startDate),
      endDate: toDateStr(d.endDate),
      summary: d.summary,
    })),
  };
};
// 월간 대시보드 목록 조회
export const getMonthlyDashboardList = async (userId: string, workspaceId: string,) => {
  const dashboards = await findMonthlyDashboards(userId, workspaceId);
  return dashboards.map((d: typeof dashboards[number]) => ({
    dashboardId: d.dashboardId,
    workspaceId: d.workspaceId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    createdAt: d.createdAt.toISOString(),
  }));
};

// 월간 대시보드 상세 조회
export const getMonthlyDashboardDetail = async (
  dashboardId: string,
  userId: string,
  workspaceId: string,
) => {
  const d = await findMonthlyDashboardById(dashboardId, userId, workspaceId);
  if (!d) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

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
    keyAchievement: d.keyAchievement,
    focusedTags: Array.isArray(d.focusedTags)
      ? (d.focusedTags as { tagId: string; tagName: string }[])
      : [],
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
    weeklyReflections: d.weeklyReflections.map((r: typeof d.weeklyReflections[number]) => ({
      weeklyReflectionId: r.weeklyReflectionId,
      workSummary: r.workSummary,
      resourcesUsed: r.resourcesUsed,
      learning: r.learning,
      createdAt: r.createdAt.toISOString(),
    })),
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

// 월간 회고 작성
export const addMonthlyReflection = async (
  dashboardId: string,
  userId: string,
  workspaceId: string,
  data: { workSummary?: string; resourcesUsed?: string; learning?: string }
) => {
  const exists = await existsDashboard(dashboardId, userId, workspaceId);
  if (!exists) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

  const reflection = await createMonthlyReflection(dashboardId, data);

  return {
    weeklyReflectionId: reflection.weeklyReflectionId,
    workSummary: reflection.workSummary,
    resourcesUsed: reflection.resourcesUsed,
    learning: reflection.learning,
    createdAt: reflection.createdAt.toISOString(),
  };
};

// 월간 대시보드 생성 (AI 호출 → DB 저장)
export const createMonthlyDashboardWithAI = async (
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
  const aiResult = await aiService.generateMonthlyDashboard(authorization, workspaceId, {
    startDate,
    endDate,
  });

 // AI service가 이미 대시보드 생성/저장(재생성 시 update)하므로 여기서 중복 저장하지 않음
  return { dashboardId: aiResult.dashboardId };
};

// 월간 회고 수정
export const editMonthlyReflection = async (
  dashboardId: string,
  reflectionId: string,
  userId: string,
  workspaceId: string,
  data: { workSummary?: string; resourcesUsed?: string; learning?: string }
) => {
  // 대시보드가 이 유저 것인지 확인
  const exists = await existsDashboard(dashboardId, userId, workspaceId);
  if (!exists) {
    throw new Error("해당 대시보드를 찾을 수 없습니다.");
  }

  // 회고가 이 대시보드 것인지 확인
  const reflection = await findMonthlyReflectionById(reflectionId, dashboardId);
  if (!reflection) {
    throw new Error("해당 회고를 찾을 수 없습니다.");
  }

  // 수정
  const updated = await updateMonthlyReflection(reflectionId, data);

  return {
    weeklyReflectionId: updated.weeklyReflectionId,
    workSummary: updated.workSummary,
    resourcesUsed: updated.resourcesUsed,
    learning: updated.learning,
  };
};