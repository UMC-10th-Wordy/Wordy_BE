import {
  findWeeklyDashboards,
  findMonthlyDashboards,
  findMonthlyDashboardById,
  existsDashboard,
  createMonthlyReflection,
  createMonthlyDashboard,
} from "./dashboard.month.repository.js";

import { AiService } from "../ai/ai.service.js";
import { LlmClient } from "../ai/llm.client.js";
import { PromptManager } from "../ai/prompt.manager.js";
import { ResponseParser } from "../ai/response.parser.js";
import { RuleEngine } from "../ai/rule.engine.js";
import { prisma } from "../../db.config.js";

const REQUIRED_COUNT = 3; // 월간 생성에 필요한 최소 주간 대시보드 수

// 이번 달 1일 ~ 말일 범위 구하기
const getMonthRange = (base: Date = new Date()) => {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0); // 다음 달 0일 = 이번 달 말일
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const toDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 월간 생성 조건 충족 여부 확인
export const getMonthlyEligibility = async (
  userId: string,
  baseDate?: string
) => {
  const base = baseDate ? new Date(baseDate) : new Date();
  const { start, end } = getMonthRange(base);

  const weeklyDashboards = await findWeeklyDashboards(userId, start, end);

  return {
    eligible: weeklyDashboards.length >= REQUIRED_COUNT,
    weeklyDashboardCount: weeklyDashboards.length,
    requiredCount: REQUIRED_COUNT,
    monthStart: toDateStr(start),
    monthEnd: toDateStr(end),
    weeklyDashboards: weeklyDashboards.map((d) => ({
      dashboardId: d.dashboardId,
      startDate: toDateStr(d.startDate),
      endDate: toDateStr(d.endDate),
      summary: d.summary,
    })),
  };
};

// 월간 대시보드 목록 조회
export const getMonthlyDashboardList = async (userId: string) => {
  const dashboards = await findMonthlyDashboards(userId);
  return dashboards.map((d) => ({
    dashboardId: d.dashboardId,
    startDate: toDateStr(d.startDate),
    endDate: toDateStr(d.endDate),
    summary: d.summary,
    createdAt: d.createdAt.toISOString(),
  }));
};

// 월간 대시보드 상세 조회
export const getMonthlyDashboardDetail = async (
  dashboardId: string,
  userId: string
) => {
  const d = await findMonthlyDashboardById(dashboardId, userId);
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
    performances: d.performances.map((p) => ({
      achievementRate: p.dailyPerformance.achievementRate,
      summary: p.dailyPerformance.summary,
      growthInsight: p.dailyPerformance.growthInsight,
      nextAction: p.dailyPerformance.nextAction,
      items: p.dailyPerformance.performanceItems.map((item) => ({
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
  data: { workSummary?: string; resourcesUsed?: string; learning?: string }
) => {
  const exists = await existsDashboard(dashboardId, userId);
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
  userId: string,
  startDate: string,
  endDate: string
) => {
  // 1. AI 서비스 인스턴스 생성
  const aiService = new AiService(
    new LlmClient(),
    new PromptManager(),
    new ResponseParser(),
    new RuleEngine(),
    prisma
  );

  // 2. AI로 대시보드 내용 생성 (월간도 같은 AI 함수, 기간만 한 달)
  const aiResult = await aiService.generateDashboard({
    userId,
    startDate,
    endDate,
  });

  // 3. AI 결과 + 계산값을 DB에 저장
  const saved = await createMonthlyDashboard({
    userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    summary: aiResult.summary,
    journalDays: aiResult.performanceCount, // TODO: 실제 일지 수로 교체 필요 (팀 확인)
    performanceCount: aiResult.performanceCount,
    tagCount: aiResult.tagAnalyses.length,
    kpis: aiResult.kpis,
    tagAnalyses: aiResult.tagAnalyses,
    weeklyReflection: aiResult.weeklyReflection,
  });

  return { dashboardId: saved.dashboardId };
};