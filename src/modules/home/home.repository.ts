import { prisma } from '../../db.config.js';
import { PlanType as PrismaPlanType } from '../../generated/prisma/client.js';

const taskSelect = {
  taskId: true,
  title: true,
  priority: true,
  status: true,
  taskDate: true,
  tag: {
    select: {
      tagId: true,
      tagName: true,
      color: true,
    },
  },
} as const;

export class HomeRepository {
  public async findPlanByUserId(userId: string) {
    return prisma.plan.findUnique({ where: { userId } });
  }

  public async createFreePlan(userId: string) {
    return prisma.plan.create({
      data: { userId, type: PrismaPlanType.FREE },
    });
  }

  public async findUserName(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { userName: true },
    });
    return profile?.userName ?? null;
  }

  public async findTasksByDate(userId: string, taskDate: Date) {
    return prisma.task.findMany({
      where: { userId, taskDate, deletedAt: null },
      select: taskSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findTasksInRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.task.findMany({
      where: {
        userId,
        deletedAt: null,
        taskDate: { gte: startDate, lte: endDate },
      },
      select: taskSelect,
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findDistinctTaskDatesDesc(userId: string) {
    const rows = await prisma.task.findMany({
      where: { userId, deletedAt: null },
      distinct: ['taskDate'],
      select: { taskDate: true },
      orderBy: { taskDate: 'desc' },
    });
    return rows.map((row) => row.taskDate);
  }

  public async findDistinctEntryDatesDesc(userId: string) {
    const rows = await prisma.dailyEntry.findMany({
      where: { userId, deletedAt: null },
      distinct: ['entryDate'],
      select: { entryDate: true },
      orderBy: { entryDate: 'desc' },
    });
    return rows.map((row) => row.entryDate);
  }

  public async findDistinctMeaningfulEntryDatesDesc(userId: string) {
    const rows = await prisma.dailyEntry.findMany({
      where: { userId, deletedAt: null },
      distinct: ['entryDate'],
      select: { entryDate: true, reflectionContent: true },
      orderBy: { entryDate: 'desc' },
    });
    return rows
      .filter((row) => row.reflectionContent.trim().length > 0)
      .map((row) => row.entryDate);
  }

  public async findTasksForDates(userId: string, dates: Date[]) {
    return prisma.task.findMany({
      where: { userId, deletedAt: null, taskDate: { in: dates } },
      select: taskSelect,
      orderBy: [{ taskDate: 'desc' }, { createdAt: 'asc' }],
    });
  }
}