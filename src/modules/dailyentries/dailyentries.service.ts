import {
  countEntriesBetween,
  findAllEntryDates,
  findEntriesWithTags,
  findEntriesByMonth,
  findEntryByDate,
  findEntryDetail,
  findEntryById,
  softDeleteEntry,
  searchByTitle,
  searchByTag,
  countMatchingTags,
  searchBySnapshotTitle,
} from "./dailyentries.repository.js";

import type { DailyEntryDetailScope } from "./dailyentries.repository.js";

import type {
  DailyEntriesSummaryResponse,
  MonthlyRecordItem,
  DailyRecordItem,
  DailyEntryByDateResponse,
  DailyEntriesDetailResponse,
  DailyEntriesSearchResponse,
  TagChip,
} from "./dailyentries.dto.js";

import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";

// 공통 헬퍼

// Date → "YYYY-MM-DD" (대시보드 모듈과 동일 규칙)
const toDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 특정 연/월의 시작~종료일 (UTC 기준, @db.Date 비교용)
const getMonthRange = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59)); // month의 0일 = 이전 달 마지막 날
  return { start, end };
};

// "YYYY-MM" 문자열에서 대표 태그 최대 n개 추출
const pickTags = (
  tagList: { tagName: string; color: string | null }[],
  n = 3
): TagChip[] => {
  const seen = new Map<string, TagChip>();
  for (const t of tagList) {
    if (!seen.has(t.tagName)) seen.set(t.tagName, { tagName: t.tagName, color: t.color });
    if (seen.size >= n) break;
  }
  return [...seen.values()];
};

// 1 나의 요약 (상단 카드 3개)
export const getDailyEntriesSummary = async (
  userId: string,
  workspaceId: string,
): Promise<DailyEntriesSummaryResponse> => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;

  // 이번 달 / 지난 달 개수 
  const thisMonth = getMonthRange(y, m);
  const lastMonth = getMonthRange(m === 1 ? y - 1 : y, m === 1 ? 12 : m - 1);

  const [thisCount, lastCount] = await Promise.all([
    countEntriesBetween(userId, workspaceId, thisMonth.start, thisMonth.end),
    countEntriesBetween(userId, workspaceId, lastMonth.start, lastMonth.end),
  ]);

  // 연속 작성 streak 
  const dateRows = await findAllEntryDates(userId, workspaceId);
  const { currentStreak, maxStreak } = calcStreaks(
    dateRows.map((r) => toDateStr(r.entryDate))
  );

  // 최다 기록 카테고리 
  const entries = await findEntriesWithTags(userId, workspaceId);
  const topCategory = calcTopCategory(entries);

  return {
    monthlyCount: {
      count: thisCount,
      diffFromLastMonth: thisCount - lastCount,
    },
    streak: { currentStreak, maxStreak },
    topCategory,
  };
};

// 연속 작성 일수 계산 (dateStrs: "YYYY-MM-DD" 배열, 중복/순서 무관)
const calcStreaks = (dateStrs: string[]) => {
  if (dateStrs.length === 0) return { currentStreak: 0, maxStreak: 0 };

  const uniqSorted = [...new Set(dateStrs)].sort(); // 오름차순
  const dayDiff = (a: string, b: string) =>
    Math.round(
      (new Date(b + "T00:00:00Z").getTime() -
        new Date(a + "T00:00:00Z").getTime()) /
        86400000
    );

  // 최고 기록
  let maxStreak = 1;
  let run = 1;
  for (let i = 1; i < uniqSorted.length; i++) {
    if (dayDiff(uniqSorted[i - 1], uniqSorted[i]) === 1) {
      run++;
      maxStreak = Math.max(maxStreak, run);
    } else {
      run = 1;
    }
  }

  // 현재 연속: 가장 최근 기록일부터 역순으로 하루씩 이어지는 구간
  let currentStreak = 1;
  for (let i = uniqSorted.length - 1; i > 0; i--) {
    if (dayDiff(uniqSorted[i - 1], uniqSorted[i]) === 1) currentStreak++;
    else break;
  }
  // 가장 최근 기록이 오늘/어제가 아니면 연속이 끊긴 것으로 봄
  const today = toDateStr(new Date());
  const last = uniqSorted[uniqSorted.length - 1];
  if (dayDiff(last, today) > 1) currentStreak = 0;

  return { currentStreak, maxStreak };
};

// 최다 기록 카테고리(태그) + 비중
const calcTopCategory = (
  entries: Awaited<ReturnType<typeof findEntriesWithTags>>
) => {
  const counter = new Map<string, { count: number; color: string | null }>();
  let total = 0;

  for (const e of entries) {
    for (const rt of e.reflectionTasks) {
      const task = rt.task;
      if (!task || task.deletedAt || !task.tag) continue;
      total++;
      const cur = counter.get(task.tag.tagName);
      if (cur) cur.count++;
      else counter.set(task.tag.tagName, { count: 1, color: task.tag.color });
    }
  }

  if (total === 0) return { tagName: null, color: null, percentage: 0 };

  let topName: string | null = null;
  let topInfo = { count: 0, color: null as string | null };
  for (const [name, info] of counter) {
    if (info.count > topInfo.count) {
      topName = name;
      topInfo = info;
    }
  }

  return {
    tagName: topName,
    color: topInfo.color,
    percentage: Math.round((topInfo.count / total) * 100),
  };
};

// 2 월별 기록 목록 (접힌 상태)
export const getMonthlyList = async (
  userId: string,
  workspaceId: string,
): Promise<MonthlyRecordItem[]> => {
  const entries = await findEntriesWithTags(userId, workspaceId);

  // yearMonth 별로 그룹핑
  const groups = new Map<
    string,
    { dates: Set<string>; tags: { tagName: string; color: string | null }[] }
  >();

  for (const e of entries) {
    // 노출 기준: 업무 있거나, 내용 있는 회고 있거나, 변환됨 (펼친 목록과 동일)
    const hasTask = e.reflectionTasks.some(
      (rt) => rt.task && !rt.task.deletedAt
    );
    const hasReflection = (e.reflectionContent ?? "").trim().length > 0;
    const converted = e.reflectionSnapshots.some(
      (s) =>
        (s.status === "TEMP" || s.status === "SAVED") && s.promptBResult != null
    );
    if (!hasTask && !hasReflection && !converted) continue; // 빈 날 제외

    const ym = toDateStr(e.entryDate).slice(0, 7);
    if (!groups.has(ym)) groups.set(ym, { dates: new Set(), tags: [] });
    const g = groups.get(ym)!;
    g.dates.add(toDateStr(e.entryDate));
    for (const rt of e.reflectionTasks) {
      if (rt.task && !rt.task.deletedAt && rt.task.tag) {
        g.tags.push({ tagName: rt.task.tag.tagName, color: rt.task.tag.color });
      }
    }
  }

  // 최신 월 순으로 정렬
  const sortedKeys = [...groups.keys()].sort((a, b) => (a < b ? 1 : -1));

  return sortedKeys.map((ym) => {
    const [year, month] = ym.split("-").map(Number);
    const g = groups.get(ym)!;
    const tags = pickTags(g.tags);
    return {
      yearMonth: ym,
      year,
      month,
      totalDays: g.dates.size,
      tags,
      // 대표 태그 + 기록 일수로 즉석 조합 (AI/테이블 없이 계산)
      summary: buildMonthlySummary(
        tags.map((t) => t.tagName),
        g.dates.size
      ),
    };
  });
};

// 월별 한 줄 요약 (규칙 기반). 대표 태그와 기록 일수로 문장 조합.
const buildMonthlySummary = (tagNames: string[], totalDays: number): string => {
  if (tagNames.length === 0) {
    return `총 ${totalDays}일의 업무 일지를 기록한 달이에요.`;
  }
  const top = tagNames.slice(0, 3).join(", ");
  return `${top} 중심으로 총 ${totalDays}일의 기록을 남긴 달이에요.`;
};

// 3 월별 일자 목록 (월 펼쳤을 때)
// yearMonth: "2026-08"
export const getMonthlyEntries = async (
  userId: string,
  workspaceId: string,
  yearMonth: string,
): Promise<DailyRecordItem[]> => {
  const [year, month] = yearMonth.split("-").map(Number);
  if (!year || !month) {
    throw new ApiError(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "yearMonth 형식이 올바르지 않습니다. (예: 2026-08)"
    );
  }

  const { start, end } = getMonthRange(year, month);
  const entries = await findEntriesByMonth(userId, workspaceId, start, end);

  return entries
    .map((e) => {
      // 유효 스냅샷(TEMP/SAVED + promptBResult) 중 최신 (상세 조회와 동일 기준)
      const snapshot = e.reflectionSnapshots.find(
        (s) =>
          (s.status === "TEMP" || s.status === "SAVED") &&
          s.promptBResult != null
      );
      const converted = !!snapshot;

      // 현재 활성 Task (미변환용)
      const currentTasks = e.reflectionTasks
        .map((rt) => rt.task)
        .filter((t): t is NonNullable<typeof t> => !!t && !t.deletedAt);

      // 카드 정보: 변환됨이면 스냅샷 기준, 아니면 현재 Task 기준
      let cardTasks: { title: string; priority: string; tag: { tagName: string; color: string | null } | null }[];
      if (converted && snapshot) {
        cardTasks = snapshot.reflectionTaskSnapshots.map((ts) => ({
          title: ts.title,
          priority: ts.priority,
          tag: ts.task?.tag ?? null,
        }));
      } else {
        cardTasks = currentTasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          tag: t.tag ?? null,
        }));
      }

      // 대표 업무: MUST_DO 우선, 없으면 첫 업무
      const mainTask =
        cardTasks.find((t) => t.priority === "MUST_DO") ?? cardTasks[0] ?? null;

      const tagList = cardTasks
        .filter((t) => t.tag)
        .map((t) => ({ tagName: t.tag!.tagName, color: t.tag!.color }));

      const dateStr = toDateStr(e.entryDate);

      return {
        dailyEntryId: e.dailyEntryId,
        workspaceId: e.workspaceId,
        entryDate: dateStr,
        day: Number(dateStr.slice(8, 10)),
        tags: pickTags(tagList),
        mainTaskTitle: mainTask?.title ?? null,
        extraTaskCount: Math.max(cardTasks.length - 1, 0),
        summary: e.reflectionContent ?? null,
        converted,
        // 노출 필터용 (아래 filter에서 사용)
        _hasCard: cardTasks.length > 0,
      };
    })
    // 노출 기준: 카드(업무/스냅샷) 있거나, 내용 있는 회고 있거나, 변환됨
    .filter((item) => {
      const hasReflection = (item.summary ?? "").trim().length > 0;
      return item._hasCard || hasReflection || item.converted;
    })
    // 내부 필드 제거
    .map(({ _hasCard, ...rest }) => rest);
};

// 날짜별 일지 조회 (오늘의 업무 화면 회고 복원용)
export const getDailyEntryByDate = async (
  userId: string,
  workspaceId: string,
  date: string,
): Promise<DailyEntryByDateResponse | null> => {
  const entryDate = parseDate(date);

  const entry = await findEntryByDate(
    userId,
    workspaceId,
    entryDate,
  );

  if (!entry) {
    return null;
  }

  return {
    dailyEntryId: entry.dailyEntryId,
    entryDate: date,
    reflectionContent: entry.reflectionContent,
  };
};

const parseDate = (date: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "날짜는 YYYY-MM-DD 형식으로 입력해주세요.",
    );
  }

  const parsed = new Date(
    `${date}T00:00:00.000Z`,
  );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new ApiError(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "유효하지 않은 날짜입니다.",
    );
  }

  return parsed;
};

// 4) 일자 상세 --> 스냅샷 기반
export const getDailyEntriesDetail = async (
  userId: string,
  workspaceId: string | null,
  dailyEntryId: string,
  scope: DailyEntryDetailScope = "active",
): Promise<DailyEntriesDetailResponse> => {
  const entry = await findEntryDetail(
    userId,
    workspaceId,
    dailyEntryId,
    scope,
  );
  if (!entry) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "해당 일지를 찾을 수 없습니다."
    );
  }

  // 회고는 변환 여부와 무관하게 항상 노출
  const base = {
    dailyEntryId: entry.dailyEntryId,
    workspaceId: entry.workspaceId,
    entryDate: toDateStr(entry.entryDate),
    reflectionContent: entry.reflectionContent,
  };

  // 유효 스냅샷입니다. status가 TEMP 또는 SAVED이고 promptBResult가 있는 것 중 최신
  // PROCESSING·FAILED·promptBResult 없는 중간저장은 "변환 전"으로 취급
  const snapshot = entry.reflectionSnapshots.find(
    (s) =>
      (s.status === "TEMP" || s.status === "SAVED") &&
      s.promptBResult != null
  );

  // 성과 미리보기 ID (변환됐고 성과가 있으면, 없으면 null)
  const dailyPerformanceId =
    snapshot?.dailyPerformances[0]?.dailyPerformanceId ?? null;

  let tasks;
  let converted: boolean;

  if (snapshot) {
    // 변환됨: 스냅샷(그 시점 박제) 기준
    converted = true;
    tasks = snapshot.reflectionTaskSnapshots.map((ts) => {
      const rs = ts.resultSnapshots[0];
      const result = rs
        ? {
            taskResultId: rs.taskResult.taskResultId,
            content: rs.content,
            attachments: rs.taskResult.attachments.map((a) => ({
              fileType: a.fileType,
              fileUrl: a.fileUrl,
              fileName: a.fileName,
            })),
          }
        : null;
      return {
        taskId: ts.taskId,
        tag: ts.task?.tag
          ? { tagName: ts.task.tag.tagName, color: ts.task.tag.color }
          : null,
        title: ts.title,
        memo: ts.memo ?? null,
        priority: ts.priority,
        status: ts.status,
        result,
      };
    });
  } else {
    // 변환 전: 현재 Task 기준
    converted = false;
    tasks = entry.reflectionTasks
      .map((rt) => rt.task)
      .filter((t): t is NonNullable<typeof t> => !!t && !t.deletedAt)
      .map((t) => {
        const tr = t.taskResult;
        const result =
          tr && !tr.deletedAt
            ? {
                taskResultId: tr.taskResultId,
                content: tr.content,
                attachments: tr.attachments.map((a) => ({
                  fileType: a.fileType,
                  fileUrl: a.fileUrl,
                  fileName: a.fileName,
                })),
              }
            : null;
        return {
          taskId: t.taskId,
          tag: t.tag ? { tagName: t.tag.tagName, color: t.tag.color } : null,
          title: t.title,
          memo: t.memo ?? null,
          priority: t.priority,
          status: t.status,
          result,
        };
      });
  }

  // 완료/미완료는 두 경우 모두 tasks의 status 기준
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const incompleteCount = tasks.length - completedCount;

  return {
    ...base,
    dailyPerformanceId,
    converted,
    completedCount,
    incompleteCount,
    tasks,
  };
};

// 5 일지 삭제 (소프트 삭제)
export const removeDailyEntry = async (userId: string, workspaceId: string, dailyEntryId: string) => {
  const found = await findEntryById(userId, workspaceId, dailyEntryId);
  if (!found) {
    throw new ApiError(
      ErrorCode.NOT_FOUND.status,
      ErrorCode.NOT_FOUND.code,
      "해당 일지를 찾을 수 없습니다."
    );
  }

  await softDeleteEntry(dailyEntryId, workspaceId);
  return { dailyEntryId };
};

// 6 검색
export const searchDailyEntries = async (
  userId: string,
  workspaceId: string,
  keyword: string,
  sort: "latest" | "oldest" = "latest"
): Promise<DailyEntriesSearchResponse> => {
  const trimmed = (keyword ?? "").trim();
  if (trimmed.length === 0) {
    return {
      keyword: "",
      journalTab: { count: 0, results: [] },
      tagTab: { count: 0, results: [] },
    };
  }

  const [titleEntries, snapshotEntries,tagEntries, tagCount] = await Promise.all([
    searchByTitle(userId, workspaceId, trimmed, sort),
    searchBySnapshotTitle(userId, workspaceId, trimmed, sort),
    searchByTag(userId, workspaceId, trimmed, sort),
    countMatchingTags(userId, workspaceId, trimmed),
  ]);

// journalTab: 미변환 일지(현재 Task) + 변환된 일지(스냅샷) 합침
  const activeResults = titleEntries.map((rt) => ({
    dailyEntryId: rt.dailyEntry.dailyEntryId,
    taskId: rt.task.taskId,
    workspaceId: rt.dailyEntry.workspaceId,
    entryDate: toDateStr(rt.dailyEntry.entryDate),
    tags: rt.task.tag
      ? pickTags([{ tagName: rt.task.tag.tagName, color: rt.task.tag.color }])
      : [],
    title: rt.task.title,
  }));

  const snapshotResults = snapshotEntries.map((s) => ({
    dailyEntryId: s.reflectionSnapshot.dailyEntry.dailyEntryId,
    taskId: s.taskId,
    workspaceId: s.reflectionSnapshot.dailyEntry.workspaceId,
    entryDate: toDateStr(s.reflectionSnapshot.dailyEntry.entryDate),
    tags: s.task.tag
      ? pickTags([{ tagName: s.task.tag.tagName, color: s.task.tag.color }])
      : [],
    title: s.title,
  }));

  const journalResults = [...activeResults, ...snapshotResults].sort((a, b) =>
    sort === "oldest"
      ? a.entryDate.localeCompare(b.entryDate)
      : b.entryDate.localeCompare(a.entryDate)
  );

  // tagTab: 기존 일지 단위 (2단계에서 태그 단위로 변경 예정)
// tagTab: 태그 단위 (미사용 태그 포함, 각 태그에 diaries)
  const tagResults = tagEntries.map((tag) => {
    const diaries: {
      dailyEntryId: string;
      taskId: string;
      workspaceId: string | null;
      entryDate: string;
      title: string;
    }[] = [];

    for (const task of tag.tasks) {
      for (const rt of task.reflectionTasks) {
        const d = rt.dailyEntry;

        // 유효 변환 = (TEMP|SAVED) && promptBResult != null  (다른 조회와 동일 기준)
        const converted = d.reflectionSnapshots.some(
          (snap) =>
            (snap.status === "TEMP" || snap.status === "SAVED") &&
            snap.promptBResult != null
        );

        if (converted) {
          // 변환된 일지: 스냅샷에 박제된 업무만 노출 (변환 후 추가된 Task 제외)
          let snapshotTitle: string | null = null;
          for (const snap of d.reflectionSnapshots) {
            if (
              (snap.status !== "TEMP" && snap.status !== "SAVED") ||
              snap.promptBResult == null
            )
              continue;
            const matched = snap.reflectionTaskSnapshots.find(
              (ts) => ts.taskId === task.taskId
            );
            if (matched) {
              snapshotTitle = matched.title;
              break;
            }
          }
          
          // 스냅샷에 없는 Task(변환 이후 생성)면 이 태그 결과에서 제외
          if (snapshotTitle === null) continue;

          diaries.push({
            dailyEntryId: d.dailyEntryId,
            taskId: task.taskId,
            workspaceId: d.workspaceId,
            entryDate: toDateStr(d.entryDate),
            title: snapshotTitle,
          });
        } else {
          // 미변환 일지: 현재 Task 그대로
          diaries.push({
            dailyEntryId: d.dailyEntryId,
            taskId: task.taskId,
            workspaceId: d.workspaceId,
            entryDate: toDateStr(d.entryDate),
            title: task.title,
          });
        }
      }
    }

    // entryDate 기준 정렬 (sort 파라미터 반영)
    diaries.sort((a, b) =>
      sort === "oldest"
        ? a.entryDate.localeCompare(b.entryDate)
        : b.entryDate.localeCompare(a.entryDate)
    );

    return {
      tagName: tag.tagName,
      color: tag.color,
      diaries,
    };
  });

  return {
    keyword: trimmed,
    journalTab: { count: journalResults.length, results: journalResults },
    tagTab: { count: tagResults.length, results: tagResults },
  };
};