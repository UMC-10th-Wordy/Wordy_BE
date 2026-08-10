import { TaskPriority, TaskStatus } from '../tasks/task.dto.js';

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
}

export interface TaskSummary {
  taskId: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  tag: {
    tagId: string;
    tagName: string;
    color: string | null;
  } | null;
}

export interface DayRecord {
  date: string;
  hasRecord: boolean;
  isConnected: boolean;
}

export interface DayTasks {
  date: string;
  tasks: TaskSummary[];
}

export interface LandingHomeData {
  screenType: 'landing';
  plan: PlanType;
}

export interface DashboardHomeData {
  screenType: 'dashboard';
  plan: PlanType;
  userName: string | null;
  todayTasks: TaskSummary[];
  streakDays: number;
  weekRecords: DayRecord[];
  weekTasks: DayTasks[];
  recentRecord: DayTasks[];
}

export type HomeData = LandingHomeData | DashboardHomeData;