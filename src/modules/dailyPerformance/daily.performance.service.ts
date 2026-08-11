import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { verifyAccessToken } from "../../auth.config.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { PromptAOutputDto } from "../ai/performance/dto/prompt/prompt.a.output.dto.js";
import { PromptBOutputDto } from "../ai/performance/dto/prompt/prompt.b.output.dto.js";
import {
  CreateDailyPerformanceRequestDto,
  CreateDailyPerformanceResponseDto,
  DailyPerformancePreviewResponseDto,
  IncompleteTaskDto,
  PerformanceDetailResponseDto,
  PerformanceListResponseDto,
  ReflectionSnapshotPreviewResponseDto,
  UpdateDailyPerformanceRequestDto,
  UpdateDailyPerformanceResponseDto,
} from "./daily.performance.dto.js";
import {
  DailyPerformanceRepository,
  DailyPerformanceDetail,
} from "./daily.performance.repository.js";
import { TaskStatus } from "../tasks/task.dto.js";

export class DailyPerformanceService {
  constructor(
    private readonly repository: DailyPerformanceRepository,
    private readonly prisma: PrismaClient,
  ) {}

  private extractUserId(
    authorization: string | undefined,
  ): string {
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new ApiError(
        ErrorCode.UNAUTHORIZED.status,
        ErrorCode.UNAUTHORIZED.code,
        "인증이 필요합니다.",
      );
    }
  }

  async createDailyPerformance(
    authorization: string | undefined,
    workspaceId: string,
    request: CreateDailyPerformanceRequestDto,
  ): Promise<CreateDailyPerformanceResponseDto> {
    const userId = this.extractUserId(authorization);

    // ReflectionSnapshot 조회
    const snapshot =
      await this.repository.findReflectionSnapshot(
        request.reflectionSnapshotId,
        userId,
        workspaceId,
      );

    if (!snapshot) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "성과 미리보기를 찾을 수 없습니다.",
      );
    }

    if (!snapshot.promptAResult || !snapshot.promptBResult) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "AI 성과 데이터가 존재하지 않습니다.",
      );
    }

    const promptA =
      snapshot.promptAResult as unknown as PromptAOutputDto;

    const promptB =
      snapshot.promptBResult as unknown as PromptBOutputDto;

    // ReflectionTaskSnapshot 기준 업무 조회
    const tasks =
      snapshot.reflectionTaskSnapshots ?? [];

    // 업무 달성률 계산
    const completedCount = tasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    ).length;

    const achievementRate =
      tasks.length === 0
        ? 0
        : Math.round(
            (completedCount / tasks.length) * 100,
          );

    // 기존 DailyPerformance 조회
    const existingPerformance =
      await this.repository.findDailyPerformanceByDailyEntry(
        snapshot.dailyEntryId,
        userId,
        workspaceId,
      );

    const incompleteTasks =
      tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS,
      );

    const performanceData = {
      reflectionSnapshotId: snapshot.reflectionSnapshotId,
      achievementRate,
      totalTaskCount: tasks.length,
      completedTaskCount: completedCount,
      incompleteTasks: JSON.parse(
        JSON.stringify(
          incompleteTasks.map((task) => ({
            taskId: task.taskId,
            title: task.title,
            tag: task.task?.tag
              ? {
                  tagName: task.task.tag.tagName,
                  color: task.task.tag.color,
                }
              : null,
          })),
        ),
      ),
      summary: request.summary,
      growthInsight: request.growthInsights,
      nextAction: promptB.nextActions,
      structuredResult: JSON.parse(
        JSON.stringify(promptA),
      ),
    };

    // PerformanceItem 저장
    const completedTaskIds = new Set(
      tasks
        .filter(
          (task) => task.status === TaskStatus.COMPLETED,
        )
        .map((task) => task.taskId),
    );

    const taskPerformances = (
      promptB.taskPerformances ?? []
    ).filter((task) =>
      completedTaskIds.has(task.taskId),
    );

    const performance =
      await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          let savedPerformance;

          // 기존 성과 수정
          if (existingPerformance) {
            savedPerformance =
              await this.repository.updateDailyPerformance(
                existingPerformance.dailyPerformanceId,
                performanceData,
                tx,
              );

            await this.repository.deletePerformanceItems(
              existingPerformance.dailyPerformanceId,
              tx,
            );
          }
          // 신규 생성
          else {
            savedPerformance =
              await this.repository.createDailyPerformance(
                {
                  userId,
                  workspaceId,
                  dailyEntryId: snapshot.dailyEntryId,
                  ...performanceData,
                },
                tx,
              );
          }

          // PerformanceItem 생성
          if (taskPerformances.length > 0) {
            await this.repository.createPerformanceItems(
              taskPerformances.map((task) => ({
                dailyPerformanceId:
                  savedPerformance.dailyPerformanceId,
                taskId: task.taskId,
                output: (task.output ?? []).join("\n"),
                impact: (task.impact ?? []).join("\n"),
              })),
              tx,
            );
          }

          // Snapshot SAVED 변경
          await this.repository.confirmReflectionSnapshot(
            snapshot.reflectionSnapshotId,
            tx,
          );

          return savedPerformance;
        },
      );

    return {
      dailyPerformanceId:
        performance.dailyPerformanceId,
    };
  }

  async getDailyPerformances(
    authorization: string | undefined,
    workspaceId: string,
  ): Promise<PerformanceListResponseDto> {
    const userId = this.extractUserId(authorization);

    const performances =
      await this.repository.findDailyPerformances(
        userId,
        workspaceId,
      );

    return {
      performances: performances.map(
        (performance) => ({
          dailyPerformanceId:
            performance.dailyPerformanceId,
          achievementRate:
            performance.achievementRate,
          summary: performance.summary,
          createdAt: performance.createdAt,
        }),
      ),
    };
  }

  private async buildPerformanceDetail(
    performance: DailyPerformanceDetail,
    userId: string,
  ): Promise<PerformanceDetailResponseDto> {
    const tasks =
      performance.reflectionSnapshot.reflectionTaskSnapshots.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      );

    const taskPerformances = tasks.map((task) => {
      const performanceItem =
        performance.performanceItems.find(
          (item) =>
            item.taskId === task.taskId,
        );

      if (!performanceItem) {
        return {
          taskId: task.taskId,
          tag: task.task?.tag
            ? {
                tagName: task.task.tag.tagName,
                color: task.task.tag.color,
              }
            : null,
          title: task.title,
          output: [],
          impact: [],
          message:
            "내용이 충분하지 않아 성과를 정리하지 못했어요.",
        };
      }

      return {
        taskId: task.taskId,
        tag: task.task?.tag
          ? {
              tagName: task.task.tag.tagName,
              color: task.task.tag.color,
            }
          : null,
        title: task.title,
        output: String(performanceItem.output)
          .split("\n")
          .filter(Boolean),
        impact: String(performanceItem.impact)
          .split("\n")
          .filter(Boolean),
      };
    });

    return {
      dailyPerformanceId:
        performance.dailyPerformanceId,
      achievementRate:
        performance.achievementRate,
      totalTaskCount:
        performance.totalTaskCount,
      completedTaskCount:
        performance.completedTaskCount,
      summary: performance.summary,

      incompleteTasks:
        Array.isArray(performance.incompleteTasks)
          ? (performance.incompleteTasks as unknown as IncompleteTaskDto[])
          : [],

      growthInsights:
        Array.isArray(performance.growthInsight)
          ? performance.growthInsight.map(String)
          : [],

      nextActions:
        Array.isArray(performance.nextAction)
          ? performance.nextAction.map(String)
          : [],

      taskPerformances,
      createdAt: performance.createdAt,
    };
  }

  async getDailyPerformanceDetail(
    authorization: string | undefined,
    workspaceId: string,
    dailyPerformanceId: string,
  ): Promise<PerformanceDetailResponseDto> {
    const userId = this.extractUserId(authorization);

    const performance =
      await this.repository.findDailyPerformanceById(
        dailyPerformanceId,
        userId,
        workspaceId,
      );

    if (!performance) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "성과를 찾을 수 없습니다.",
      );
    }

    return this.buildPerformanceDetail(
      performance,
      userId,
    );
  }

  async getDailyPerformanceByDate(
    authorization: string | undefined,
    workspaceId: string,
    date: string,
  ): Promise<DailyPerformancePreviewResponseDto> {
    const userId =
      this.extractUserId(authorization);

    const performance =
      await this.repository.findDailyPerformanceByDate(
        userId,
        workspaceId,
        new Date(date),
      );

    if (!performance) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      performance:
        await this.buildPerformanceDetail(
          performance,
          userId,
        ),
    };
  }

  async getReflectionSnapshotPreview(
    authorization: string | undefined,
    workspaceId: string,
    reflectionSnapshotId: string,
  ): Promise<ReflectionSnapshotPreviewResponseDto> {
    const userId =
      this.extractUserId(authorization);

    const snapshot =
      await this.repository.findReflectionSnapshotById(
        reflectionSnapshotId,
        userId,
        workspaceId,
      );

    if (!snapshot) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "성과 미리보기를 찾을 수 없습니다.",
      );
    }

    return {
      reflectionSnapshotId:
        snapshot.reflectionSnapshotId,

      status: snapshot.status,

      promptBResult:
        snapshot.promptBResult
          ? (snapshot.promptBResult as unknown as PromptBOutputDto)
          : null,

      tasks:
        snapshot.reflectionTaskSnapshots.map(
          (taskSnapshot) => ({
            reflectionTaskSnapshotId:
              taskSnapshot.reflectionTaskSnapshotId,

            taskId: taskSnapshot.taskId,
            title: taskSnapshot.title,
            priority: taskSnapshot.priority,
            memo: taskSnapshot.memo,
            status: taskSnapshot.status,
            completedAt: taskSnapshot.completedAt,

            tag: taskSnapshot.task?.tag
              ? {
                  tagName:
                    taskSnapshot.task.tag.tagName,
                  color:
                    taskSnapshot.task.tag.color,
                }
              : null,

            results:
              taskSnapshot.resultSnapshots,
          }),
        ),
    };
  }

  async updateDailyPerformance(
    authorization: string | undefined,
    workspaceId: string,
    dailyPerformanceId: string,
    request: UpdateDailyPerformanceRequestDto,
  ): Promise<UpdateDailyPerformanceResponseDto> {
    const userId =
      this.extractUserId(authorization);

    const performance =
      await this.repository.findDailyPerformance(
        dailyPerformanceId,
        userId,
        workspaceId,
      );

    if (!performance) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "성과 데이터를 찾을 수 없습니다.",
      );
    }

    const updatedPerformance =
      await this.repository.updateDailyPerformance(
        dailyPerformanceId,
        {
          summary: request.summary,
          growthInsight:
            request.growthInsights,
        },
      );

    return {
      dailyPerformanceId:
        updatedPerformance.dailyPerformanceId,
    };
  }
}