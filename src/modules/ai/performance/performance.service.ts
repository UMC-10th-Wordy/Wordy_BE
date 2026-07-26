import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { PerformanceRequestDto } from "./dto/api/performance.request.dto";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto";
import { PerformanceResponseDto } from "./dto/api/performance.response.dto";
import { PromptAOutputDto } from "./dto/prompt/prompt.a.output.dto";
import { PromptBOutputDto } from "./dto/prompt/prompt.b.output.dto";

import { PrismaClient, Prisma, TaskStatus, PromptType, AiRunStatus, AIQuestionStatus, DailyEntry } from "../../../generated/prisma/client";
import { verifyAccessToken } from "../../../auth.config";
import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

type TaskWithResult = Prisma.TaskGetPayload<{
  include: {
    taskResult: true;
  };
}>;

export class PerformanceService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
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

  // 첫 번째 호출
  async generatePerformancePreview(
    authorization: string | undefined,
    request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {

    const userId = this.extractUserId(authorization);

    const dailyEntry = await this.prisma.dailyEntry.findFirst({
      where: {
        dailyEntryId: request.dailyEntryId,
        userId,
        deletedAt: null,
      },
    });

    if (!dailyEntry) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "업무일지를 찾을 수 없습니다.",
      );
    }

    // Prompt A 생성
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: request.tasks,
        reflection: request.reflectionContent,
        projectTag: request.projectTag,
        userJob: request.userJob,
        yearsOfService: request.yearsOfService,
      });

    // LLM 호출
    const promptAResponse =
      await this.llmClient.generate(promptARequest);

    // AIRun 저장
    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.PROMPT_A,
        promptVersion: "v1",
        request: promptARequest,
        response: promptAResponse,
        status: AiRunStatus.SUCCESS,
      },
    });

    // Parsing
    const promptAResult =
      this.responseParser.parse<PromptAOutputDto>(
        promptAResponse,
      );

    // Rule 검증
    this.ruleEngine.validatePromptA(
      promptAResult,
    );

    // 보충 질문 판단
    if (
      this.ruleEngine.needFollowUpQuestion(
        promptAResult,
      )
    ) {
      const reflectionSnapshotId =
      await this.saveQuestionSnapshot(
        request.dailyEntryId,
        promptAResult,
      );

    return {
      status: "QUESTION_REQUIRED",
      reflectionSnapshotId,
      supplementQuestions:
        promptAResult.followUpQuestions,
    };
  }

  // 질문 필요 없으면 바로 완료
  return this.createPerformanceResult(
    promptAResult,
    request,
    dailyEntry,
    userId,
  );
}
  
  // 질문 단계 snapshot 생성
  private async saveQuestionSnapshot(
    dailyEntryId: string,
    promptAResult: PromptAOutputDto,
  ) {
    const snapshot =
      await this.prisma.reflectionSnapshot.create({
        data: {
          dailyEntryId,
          promptAResult,
        },
      });

    if (
      promptAResult.followUpQuestions &&
      promptAResult.followUpQuestions.length > 0
    ) {
      await this.prisma.aIQuestion.createMany({
        data: promptAResult.followUpQuestions.map(
          (question, index) => ({
            reflectionSnapshotId:
              snapshot.reflectionSnapshotId,
            questionContent: question.question,
            reason: question.reason ?? null,
            order: index + 1,
          }),
        ),
      });
    }

    return snapshot.reflectionSnapshotId;
  }

  // 질문 답변 후 최종 생성
  async completePerformancePreview(
    authorization: string | undefined,
    request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {

    const userId = this.extractUserId(authorization);

    // AIQuestion 상태 업데이트
    const questionStatus =
      request.answers.length > 0  // 프론트에서 답변 건너뛰기 시 빈 배열을 보냄
        ? AIQuestionStatus.ANSWERED
        : AIQuestionStatus.SKIPPED;

    if (request.answers.length > 0) {
      for (const answer of request.answers) {
        await this.prisma.aIQuestion.update({
          where: {
            aiQuestionId: answer.aiQuestionId,
          },
          data: {
            answer: answer.answer,
            status: AIQuestionStatus.ANSWERED,
          },
        });
      }
    } else {
      await this.prisma.aIQuestion.updateMany({
        where: {
          reflectionSnapshotId: request.reflectionSnapshotId,
        },
        data: {
          status: AIQuestionStatus.SKIPPED,
        },
      });
    }

    // 답변 포함해서 Prompt A 재호출
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: request.originalRequest.tasks,
        reflection: request.originalRequest.reflectionContent,
        projectTag: request.originalRequest.projectTag,
        userJob: request.originalRequest.userJob,
        yearsOfService: request.originalRequest.yearsOfService,
        supplementAnswers: request.answers,
      });

    const promptAResponse =
      await this.llmClient.generate(
        promptARequest,
      );

    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.PROMPT_A,
        promptVersion: "v1",
        request: promptARequest,
        response: promptAResponse,
        status: AiRunStatus.SUCCESS,
      },
    });

    const promptAResult =
      this.responseParser.parse<PromptAOutputDto>(
        promptAResponse,
      );

    this.ruleEngine.validatePromptA(
      promptAResult,
    );

    const dailyEntry = await this.prisma.dailyEntry.findFirst({
      where: {
        dailyEntryId: request.originalRequest.dailyEntryId,
        userId,
      },
    });

    if (!dailyEntry) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "업무일지를 찾을 수 없습니다.",
      );
    }

    return this.createPerformanceResult(
      promptAResult,
      request.originalRequest,
      dailyEntry,
      userId,
      request.reflectionSnapshotId,
    );
  }

  // Prompt B 실행 + 저장
  private async createPerformanceResult(
    promptAResult: PromptAOutputDto,
    request: PerformanceRequestDto,
    dailyEntry: DailyEntry,
    userId: string,
    reflectionSnapshotId?: string,
  ): Promise<PerformanceResponseDto> {

    // Prompt B 생성
    const promptBRequest =
      this.promptManager.buildPromptB({
        structuredData: promptAResult,
        userJob: request.userJob,
        yearsOfService: request.yearsOfService,
        projectTag: request.projectTag,
      });

    // LLM 호출
    const promptBResponse =
      await this.llmClient.generate(
        promptBRequest,
      );

    // Parsing
    const promptBResult =
      this.responseParser.parse<PromptBOutputDto>(
        promptBResponse,
      );

    // Rule 검증
    this.ruleEngine.validatePromptB(
      promptBResult,
    );

    let snapshot;

    // 질문 후 완료 → 기존 Snapshot 업데이트
    if (reflectionSnapshotId) {
      snapshot =
        await this.prisma.reflectionSnapshot.update({
          where: {
            reflectionSnapshotId,
          },
          data: {
            promptAResult,
            promptBResult,
          },
        });
    } 
    else {
      snapshot =
        await this.prisma.reflectionSnapshot.create({
          data: {
            dailyEntryId: request.dailyEntryId,
            promptAResult,
            promptBResult,
          },
        });
    }

  await this.prisma.aIRun.create({
    data: {
      promptType: PromptType.PROMPT_B,
      promptVersion: "v1",
      request: promptBRequest,
      response: promptBResponse,
      status: AiRunStatus.SUCCESS,
      reflectionSnapshotId:
        snapshot.reflectionSnapshotId,
    },
  });

  const tasks: TaskWithResult[] =
    await this.prisma.task.findMany({
      where: {
        userId,
        reflectionTasks: {
          some: {
            dailyEntryId: request.dailyEntryId,
          },
        },
      },
      include: {
        taskResult: true,
      },
    });

    // Task Snapshot 저장
    for (const task of tasks) {
      const taskSnapshot =
        await this.prisma.reflectionTaskSnapshot.create({
          data: {
            reflectionSnapshotId: snapshot.reflectionSnapshotId,
            taskId: task.taskId,
            title: task.title,
            priority: task.priority,
            memo: task.memo,
            status: task.status,
            completedAt: task.completedAt,
          },
        });

      if (task.taskResult) {
        await this.prisma.reflectionTaskResultSnapshot.create({
          data: {
            reflectionTaskSnapshotId:
              taskSnapshot.reflectionTaskSnapshotId,
            taskResultId: task.taskResult.taskResultId!,
            content: task.taskResult.content,
          },
        });
      }
    }

    // 완료율 계산
    const completedCount =
      tasks.filter(
        (task) => task.status === TaskStatus.COMPLETED,
      ).length;

    const completionRate =
      tasks.length === 0
        ? 0
        : Math.round((completedCount / tasks.length) * 100);

    // DailyPerformance 저장
    const performance =
      await this.prisma.dailyPerformance.create({
        data: {
          userId,
          dailyEntryId: request.dailyEntryId,
          achievementRate: completionRate,
          summary: promptBResult.summary,
          growthInsight: promptBResult.growthInsights,
          nextAction: promptBResult.nextActions,
          structuredResult: promptAResult,
          reflectionSnapshotId: snapshot.reflectionSnapshotId,
        },
      });

    // Performance Item 저장
    if (
      promptBResult.taskPerformances.length >
      0
    ) {
      await this.prisma.performanceItem.createMany({
        data:
          promptBResult.taskPerformances.map(
            (task) => ({
              dailyPerformanceId: performance.dailyPerformanceId,
              taskId: task.taskId,
              output: task.output.join("\n"),
              impact: task.impact.join("\n"),
            }),
          ),
      });
    }

    return {
      status: "COMPLETED",
      summary: promptBResult.summary,
      growthInsights: promptBResult.growthInsights,
      nextActions: promptBResult.nextActions,
      taskPerformances: promptBResult.taskPerformances,
    };
  }
}