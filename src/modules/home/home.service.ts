import { verifyAccessToken } from '../../auth.config.js';
import { HomeRepository } from './home.repository.js';
import { DayRecord, DayTasks, HomeData, PlanType, TaskSummary } from './home.dto.js';
import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';

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

  private extractUserId(authorization: string | undefined): string {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) throw new UnauthorizedError();

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new UnauthorizedError();
    }
  }

  /**
   * 홈 화면 조회
   * - 요금제가 없는 경우(첫 방문) 랜딩 화면을 반환하고 FREE 요금제를 생성
   * - 요금제가 있는 경우 오늘의 업무/이번 주 기록/스트릭/최근 기록을 담은 대시보드를 반환
   */
  public async getHome(authorization: string | undefined): Promise<HomeData> {
    const userId = this.extractUserId(authorization);

    const plan = await this.homeRepository.findPlanByUserId(userId);
    if (!plan) {
      await this.homeRepository.createFreePlan(userId);
      return { screenType: 'landing', plan: PlanType.FREE };
    }

    const today = this.todayDateOnly();
    const weekStart = this.getWeekStart(today);
    const weekEnd = this.addDays(weekStart, 6);

    const [userName, todayTaskRows, weekTaskRows, distinctDates] = await Promise.all([
      this.homeRepository.findUserName(userId),
      this.homeRepository.findTasksByDate(userId, today),
      this.homeRepository.findTasksInRange(userId, weekStart, weekEnd),
      this.homeRepository.findDistinctTaskDatesDesc(userId),
    ]);

    const weekTasks = this.buildWeekBuckets(weekStart, weekTaskRows as TaskRow[]);
    const weekRecords: DayRecord[] = weekTasks.map((day) => ({
      date: day.date,
      hasRecord: day.tasks.length > 0,
    }));
    const streakDays = this.calculateStreak(today, distinctDates);

    const recentDates = distinctDates.slice(0, 2);
    const recentTaskRows = recentDates.length
      ? await this.homeRepository.findTasksForDates(userId, recentDates)
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

  private calculateStreak(today: Date, sortedDatesDesc: Date[]): number {
    const dateSet = new Set(sortedDatesDesc.map((date) => this.formatDate(date)));

    let streak = 0;
    let cursor = today;
    while (dateSet.has(this.formatDate(cursor))) {
      streak++;
      cursor = this.addDays(cursor, -1);
    }
    return streak;
  }
}