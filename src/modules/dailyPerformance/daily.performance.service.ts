import { verifyAccessToken } from "../../auth.config";
import { ApiError } from "../../common/errors/api.error";
import { ErrorCode } from "../../common/errors/error.code";
import { Prisma } from "../../generated/prisma/client";
import { TaskStatus } from "../../generated/prisma/enums";
import { PromptAOutputDto } from "../ai/performance/dto/prompt/prompt.a.output.dto";
import { PromptBOutputDto } from "../ai/performance/dto/prompt/prompt.b.output.dto";
import { CreateDailyPerformanceRequestDto, CreateDailyPerformanceResponseDto, PerformanceDetailResponseDto, PerformanceListResponseDto } from "./daily.performance.dto";
import { DailyPerformanceRepository, DailyPerformanceDetail } from "./daily.performance.repository";

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
      snapshot.promptAResult as PromptAOutputDto;

    const promptB =
      snapshot.promptBResult as PromptBOutputDto;

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

    // DailyPerformance 저장
    const performance =
      await this.repository.createDailyPerformance({
        userId,
        dailyEntryId: snapshot.dailyEntryId,
        reflectionSnapshotId:
          snapshot.reflectionSnapshotId,

        achievementRate,

        // 사용자가 수정한 값
        summary: request.summary,
        growthInsight: request.growthInsights,

        // AI 생성 결과
        nextAction: promptB.nextActions,
        structuredResult: promptA,
      });

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
      dailyPerformanceId:
        performance.dailyPerformanceId,
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

    // 해당 일자의 전체 업무 조회
    const tasks =
      await this.repository.findTasksByDailyEntry(
        performance.dailyEntryId,
        userId,
      );

    // 미완료 업무
    const incompleteTasks =
      tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS,
      );

    /**
     * Task 기준으로 성과 매핑
     *
     * 이유:
     * - AI 성공 → PerformanceItem 존재
     * - AI 실패 → PerformanceItem 없음
     *
     * 하지만 화면에서는 모든 업무 노출 필요
     */
    const taskPerformances =
      tasks.map((task) => {
        const performanceItem =
          performance.performanceItems.find(
            (
              item: Prisma.PerformanceItemGetPayload<{
                include: {
                  task: {
                    include: {
                      tag: true;
                    };
                  };
                };
              }>
            ) =>
              item.taskId === task.taskId,
          );

        // AI가 성과 변환 실패한 경우
        if (!performanceItem) {
          return {
            taskId: task.taskId,
            tag: task.tag?.name,
            title: task.title,
            output: [],
            impact: [],
            message:
              "내용이 충분하지 않아 성과를 정리하지 못했어요.",
          };
        }

        return {
          taskId: task.taskId,
          tag: task.tag?.name,
          title: task.title,
          output: performanceItem.output
            ? performanceItem.output
                .split("\n")
                .filter(Boolean)
            : [],
          impact: performanceItem.impact
            ? performanceItem.impact
                .split("\n")
                .filter(Boolean)
            : [],
          message: undefined,
        };
      });

    return {
      dailyPerformanceId: performance.dailyPerformanceId,
      achievementRate: performance.achievementRate,
      incompleteTasks:
        incompleteTasks.map((task) => ({
          tag: task.tag?.name,
          title: task.title,
        })),

      // 사용자 수정값
      summary: performance.summary,
      growthInsights: performance.growthInsight,

      // AI 생성값
      nextActions: performance.nextAction,
      taskPerformances,
      createdAt: performance.createdAt,
    };
  }
}