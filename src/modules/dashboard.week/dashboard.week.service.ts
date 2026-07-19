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

import { AiService } from "../ai/ai.service.js";
import { LlmClient } from "../ai/llm.client.js";
import { PromptManager } from "../ai/prompt.manager.js";
import { ResponseParser } from "../ai/response.parser.js";
import { RuleEngine } from "../ai/rule.engine.js";
import { prisma } from "../../db.config.js";

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

const toDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 생성 조건 충족 여부 확인 (baseDate: 조회할 주의 기준 날짜)
export const getEligibility = async (userId: string, baseDate?: string) => {
  // baseDate가 있으면 그 날짜 기준, 없으면 오늘 기준
  const base = baseDate ? new Date(baseDate) : new Date();
  const { start, end } = getWeekRange(base);

  const entries = await findDailyEntries(userId, start, end);

  return {
    eligible: entries.length >= REQUIRED_DAYS,
    journalDays: entries.length,
    requiredDays: REQUIRED_DAYS,
    weekStart: toDateStr(start),
    weekEnd: toDateStr(end),
    entries: entries.map((e) => ({
      dailyEntryId: e.dailyEntryId,
      entryDate: toDateStr(e.entryDate),
    })),
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

// 대시보드 상세 조회npm run dev
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

// 회고 수정
export const editWeeklyReflection = async (
  dashboardId: string,
  reflectionId: string,
  userId: string,
  data: {
    workSummary?: string;
    resourcesUsed?: string;
    learning?: string;
  }
) => {
  // 대시보드가 이 유저 것인지 확인
  const exists = await existsDashboard(dashboardId, userId);
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
  userId: string,
  startDate: string,
  endDate: string
) => {
  // 1. AI 서비스 인스턴스 생성 (ai.controller.ts와 동일한 방식)
  const aiService = new AiService(
    new LlmClient(),
    new PromptManager(),
    new ResponseParser(),
    new RuleEngine(),
    prisma
  );

  // 2. AI로 대시보드 내용 생성 (summary, kpis, tagAnalyses, reflection)
  const aiResult = await aiService.generateDashboard({
    userId,
    startDate,
    endDate,
  });

  // 3. AI 결과 + 계산값을 DB에 저장
  const saved = await createDashboard({
    userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    summary: aiResult.summary,
    journalDays: aiResult.performanceCount, // TODO: 실제 일지 수로 교체 필요 (팀 확인)
    performanceCount: aiResult.performanceCount,
    tagCount: aiResult.tagAnalyses.length, // 태그 분석 개수로 계산
    kpis: aiResult.kpis,
    tagAnalyses: aiResult.tagAnalyses,
    weeklyReflection: aiResult.weeklyReflection,
  });

  return { dashboardId: saved.dashboardId };
};