import { verifyAccessToken } from '../../auth.config.js';
import { HomeRepository } from './home.repository.js';
import { DayRecord, DayTasks, HomeData, PlanType, TaskSummary } from './home.dto.js';
import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';
import { WorkspaceRepository } from '../workspace/workspace.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, '인증이 필요합니다.');
  }
}

interface TaskRow {
  taskId: string;
  title: string;
  priority: string;
  status: string;
  taskDate: Date;
  tag: { tagId: string; tagName: string; color: string | null } | null;
}

export class HomeService {
  private homeRepository = new HomeRepository();
  private workspaceRepository = new WorkspaceRepository();

  private extractUserId(authorization: string | undefined): string {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) throw new UnauthorizedError();

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new UnauthorizedError();
    }
  }

  public async getHome(authorization: string | undefined, workspaceId: string): Promise<HomeData> {
    const userId = this.extractUserId(authorization);

    const workspace = await this.workspaceRepository.findByIdAndUserId(
      workspaceId,
      userId,
    );

    if (!workspace) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        '워크스페이스를 찾을 수 없습니다.',
      );
    }

    const plan = await this.homeRepository.findPlanByUserId(userId);
    if (!plan) {
      await this.homeRepository.createFreePlan(userId);
      return { screenType: 'landing', plan: PlanType.FREE };
    }

    const today = this.todayDateOnly();
    const weekStart = this.getWeekStart(today);
    const weekEnd = this.addDays(weekStart, 6);

    const [userName, todayTaskRows, weekTaskRows, taskDistinctDates, meaningfulEntryDistinctDates] =
      await Promise.all([
        this.homeRepository.findUserName(userId),
        this.homeRepository.findTasksByDate(userId, workspaceId, today),
        this.homeRepository.findTasksInRange(userId, workspaceId, weekStart, weekEnd),
        this.homeRepository.findDistinctTaskDatesDesc(userId, workspaceId),
        this.homeRepository.findDistinctMeaningfulEntryDatesDesc(userId, workspaceId),
      ]);

    const recordDatesDesc = this.mergeDatesDesc(taskDistinctDates, meaningfulEntryDistinctDates);

    const { streakDays, streakStartStr, streakEndStr } = this.computeStreak(
      today,
      recordDatesDesc,
    );
    const recordDateSet = new Set(recordDatesDesc.map((date) => this.formatDate(date)));

    const weekTasks = this.buildWeekBuckets(weekStart, weekTaskRows as TaskRow[]);
    const weekRecords: DayRecord[] = weekTasks.map((day) => ({
      date: day.date,
      hasRecord: recordDateSet.has(day.date),
      isConnected: this.isWithinStreak(day.date, streakStartStr, streakEndStr),
    }));

    const recentDates = meaningfulEntryDistinctDates.slice(0, 2);
    const recentTaskRows = recentDates.length
      ? await this.homeRepository.findTasksForDates(userId, workspaceId, recentDates)
      : [];
    const recentRecord = this.groupTasksByDate(recentDates, recentTaskRows as TaskRow[]);

    return {
      screenType: 'dashboard',
      plan: plan.type as unknown as PlanType,
      userName,
      todayTasks: this.mapTasks(todayTaskRows as TaskRow[]),
      streakDays,
      weekRecords,
      weekTasks,
      recentRecord,
    };
  }

  private todayDateOnly(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * DAY_MS);
  }

  private getWeekStart(date: Date): Date {
    return this.addDays(date, -date.getUTCDay());
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private mapTasks(rows: TaskRow[]): TaskSummary[] {
    return rows.map((row) => ({
      taskId: row.taskId,
      title: row.title,
      priority: row.priority as TaskSummary['priority'],
      status: row.status as TaskSummary['status'],
      tag: row.tag,
    }));
  }

  private buildWeekBuckets(weekStart: Date, weekTaskRows: TaskRow[]): DayTasks[] {
    return Array.from({ length: 7 }, (_, i) => {
      const day = this.addDays(weekStart, i);
      const dateStr = this.formatDate(day);
      const tasksForDay = weekTaskRows.filter(
        (row) => this.formatDate(row.taskDate) === dateStr,
      );
      return { date: dateStr, tasks: this.mapTasks(tasksForDay) };
    });
  }

  private groupTasksByDate(dates: Date[], rows: TaskRow[]): DayTasks[] {
    return dates.map((date) => {
      const dateStr = this.formatDate(date);
      const tasksForDay = rows.filter((row) => this.formatDate(row.taskDate) === dateStr);
      return { date: dateStr, tasks: this.mapTasks(tasksForDay) };
    });
  }

  private mergeDatesDesc(a: Date[], b: Date[]): Date[] {
    const byDateStr = new Map<string, Date>();
    for (const date of [...a, ...b]) {
      byDateStr.set(this.formatDate(date), date);
    }
    return [...byDateStr.values()].sort((x, y) => (x < y ? 1 : x > y ? -1 : 0));
  }

  private isWithinStreak(
    dateStr: string,
    streakStartStr: string | null,
    streakEndStr: string | null,
  ): boolean {
    if (!streakStartStr || !streakEndStr) return false;
    return dateStr >= streakStartStr && dateStr <= streakEndStr;
  }


  private computeStreak(
    today: Date,
    sortedDatesDesc: Date[],
  ): { streakDays: number; streakStartStr: string | null; streakEndStr: string | null } {
    if (sortedDatesDesc.length === 0) {
      return { streakDays: 0, streakStartStr: null, streakEndStr: null };
    }

    const sortedAsc = [...new Set(sortedDatesDesc.map((date) => this.formatDate(date)))].sort();
    const todayStr = this.formatDate(today);
    const last = sortedAsc[sortedAsc.length - 1];

    if (this.daysBetween(last, todayStr) > 1) {
      return { streakDays: 0, streakStartStr: null, streakEndStr: null };
    }

    let streakDays = 1;
    let startIndex = sortedAsc.length - 1;
    for (let i = sortedAsc.length - 1; i > 0; i--) {
      if (this.daysBetween(sortedAsc[i - 1], sortedAsc[i]) === 1) {
        streakDays++;
        startIndex = i - 1;
      } else {
        break;
      }
    }

    return { streakDays, streakStartStr: sortedAsc[startIndex], streakEndStr: last };
  }

  private daysBetween(fromStr: string, toStr: string): number {
    return Math.round(
      (new Date(`${toStr}T00:00:00Z`).getTime() - new Date(`${fromStr}T00:00:00Z`).getTime()) /
        DAY_MS,
    );
  }
}