import { verifyAccessToken } from "../../auth.config.js";
import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { Prisma } from "../../generated/prisma/client.js";
import { TaskStatus } from "../../generated/prisma/enums.js";
import { PromptAOutputDto } from "../ai/performance/dto/prompt/prompt.a.output.dto.js";
import { PromptBOutputDto } from "../ai/performance/dto/prompt/prompt.b.output.dto.js";
import { CreateDailyPerformanceRequestDto, CreateDailyPerformanceResponseDto, DailyPerformancePreviewResponseDto, PerformanceDetailResponseDto, PerformanceListResponseDto } from "./daily.performance.dto.js";
import { DailyPerformanceRepository, DailyPerformanceDetail } from "./daily.performance.repository.js";

export class DailyPerformanceService {
  constructor(
    private readonly repository: DailyPerformanceRepository,
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
    request: CreateDailyPerformanceRequestDto,
  ): Promise<CreateDailyPerformanceResponseDto> {
    const userId = this.extractUserId(authorization);

    // ReflectionSnapshot 조회
    const snapshot =
      await this.repository.findReflectionSnapshot(
        request.reflectionSnapshotId,
        userId,
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

    // Task 조회
    const tasks =
      await this.repository.findTasksByDailyEntry(
        snapshot.dailyEntryId,
        userId,
      );

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
      );

    let performance;

    const performanceData = {
      reflectionSnapshotId:
        snapshot.reflectionSnapshotId,

      achievementRate,

      // 사용자가 수정한 값
      summary: request.summary,
      growthInsight: request.growthInsights,

      // AI 생성 결과
      nextAction: promptB.nextActions,
      structuredResult:
        JSON.parse(JSON.stringify(promptA)),
    };


    // 기존 성과 있으면 갱신
    if (existingPerformance) {
      performance =
        await this.repository.updateDailyPerformance(
          existingPerformance.dailyPerformanceId,
          performanceData,
        );

      // 기존 Task 성과 제거
      await this.repository.deletePerformanceItems(
        existingPerformance.dailyPerformanceId,
      );

    } 
    // 없으면 신규 생성
    else {
      performance =
        await this.repository.createDailyPerformance({
          userId,
          dailyEntryId: snapshot.dailyEntryId,
          ...performanceData,
        });
    }

    // PerformanceItem 저장
    const taskPerformances =
      promptB.taskPerformances ?? [];

    if (taskPerformances.length > 0) {
      await this.repository.createPerformanceItems(
        taskPerformances.map((task) => ({
          dailyPerformanceId:
            performance.dailyPerformanceId,
          taskId: task.taskId,
          output: (task.output ?? []).join("\n"),
          impact: (task.impact ?? []).join("\n"),
        })),
      );
    }

    return {
      dailyPerformanceId: performance.dailyPerformanceId,
    };
  }

  async getDailyPerformances(
    authorization: string | undefined,
  ): Promise<PerformanceListResponseDto> {
    const userId = this.extractUserId(authorization);

    const performances =
      await this.repository.findDailyPerformances(
        userId,
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
      await this.repository.findTasksByDailyEntry(
        performance.dailyEntryId,
        userId,
      );

    const incompleteTasks =
      tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS,
      );

    const completedTaskCount =
      tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ).length;

    const totalTaskCount = tasks.length;

    const taskPerformances =
      tasks.map((task) => {

        const performanceItem =
          performance.performanceItems.find(
            (item) =>
              item.taskId === task.taskId,
          );

        if (!performanceItem) {
          return {
            taskId: task.taskId,
            tag: task.tag
              ? {
                  tagName: task.tag.tagName,
                  color: task.tag.color,
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
          tag: task.tag
            ? {
                tagName: task.tag.tagName,
                color: task.tag.color,
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
      dailyPerformanceId: performance.dailyPerformanceId,
      achievementRate: performance.achievementRate,
      totalTaskCount,
      completedTaskCount,
      incompleteTasks:
        incompleteTasks.map((task) => ({
          tag: task.tag
            ? {
                tagName: task.tag.tagName,
                color: task.tag.color,
              }
            : null,
          title: task.title,
        })),

      summary: performance.summary,

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
    dailyPerformanceId: string,
  ): Promise<PerformanceDetailResponseDto> {

    const userId = this.extractUserId(authorization);

    const performance =
      await this.repository.findDailyPerformanceById(
        dailyPerformanceId,
        userId,
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
    date: string,
  ): Promise<DailyPerformancePreviewResponseDto> {

    const userId =
      this.extractUserId(authorization);

    const performance =
      await this.repository.findDailyPerformanceByDate(
        userId,
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
}