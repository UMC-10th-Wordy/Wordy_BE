import { PromptManager } from "../common/prompt.manager";
import { LlmClient } from "../common/llm.client";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { PerformanceRequestDto } from "./dto/api/performance.request.dto";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto";
import { PerformanceResponseDto } from "./dto/api/performance.response.dto";
import { PromptAOutputDto } from "./dto/prompt/prompt.a.output.dto";
import { PromptBOutputDto } from "./dto/prompt/prompt.b.output.dto";

import { PrismaClient, TaskStatus, PromptType, AiRunStatus } from "../../../generated/prisma/client";
import { ApiError } from "../../../common/errors/api.error";
import { ErrorCode } from "../../../common/errors/error.code";

export class PerformanceService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
    private readonly prisma: PrismaClient,
  ) {}

  // 첫 번째 호출
  async generatePerformancePreview(
    request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {

    // Prompt A 생성
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: request.tasks,
        reflection: request.reflectionContent,
        projectTag: request.projectTag,
        userJob: request.userJob,
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
        request,
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
  );
}
  
  // 질문 단계 snapshot 생성
  private async saveQuestionSnapshot(
    request: PerformanceRequestDto,
    promptAResult: PromptAOutputDto,
  ) {
    const dailyEntry =
      await this.prisma.dailyEntry.findUnique({
        where: {
          dailyEntryId: request.dailyEntryId,
        },
      });

    if (!dailyEntry) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "DailyEntry를 찾을 수 없습니다.",
      );
    }

    const snapshot =
      await this.prisma.reflectionSnapshot.create({
        data: {
          dailyEntryId: dailyEntry.dailyEntryId,
          promptAResult,
        },
      });

    if (
      promptAResult.followUpQuestions &&
      promptAResult.followUpQuestions.length > 0
    ) {
      await this.prisma.aIQuestion.createMany({
        data:
          promptAResult.followUpQuestions.map(
            (question, index) => ({
              reflectionSnapshotId:
                snapshot.reflectionSnapshotId,

              questionContent:
                question.question,

              reason:
                question.reason ?? null,

              order:
                index + 1,
            }),
          ),
      });
    }

    return snapshot.reflectionSnapshotId;
  }

  // 질문 답변 후 최종 생성
  async completePerformancePreview(
    request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {

    // 답변 포함해서 Prompt A 재호출
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: request.originalRequest.tasks,
        reflection: request.originalRequest.reflectionContent,
        projectTag: request.originalRequest.projectTag,
        userJob: request.originalRequest.userJob,
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

    return this.createPerformanceResult(
      promptAResult,
      request.originalRequest,
      request.reflectionSnapshotId,
    );
  }

  // Prompt B 실행 + 저장
  private async createPerformanceResult(
    promptAResult: PromptAOutputDto,
    request: PerformanceRequestDto,
    reflectionSnapshotId?: string,
  ): Promise<PerformanceResponseDto> {

    // Prompt B 생성
    const promptBRequest =
      this.promptManager.buildPromptB({
        tasks: promptAResult.tasks,
        reflection: request.reflectionContent,
        userJob: request.userJob,
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

    // 실제 저장된 DailyEntry + Task 데이터 조회
    const dailyEntry =
      await this.prisma.dailyEntry.findUnique({
        where: {
          dailyEntryId: request.dailyEntryId,
        },
        include: {
          reflectionTasks: {
            include: {
              task: {
                include: {
                  taskResults: true,
                },
              },
            },
          },
        },
      });

    if (!dailyEntry) {
      throw new Error(
        "DailyEntry not found",
      );
    }
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
            dailyEntryId: dailyEntry.dailyEntryId,
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

    // Task Snapshot 저장
    for (const reflectionTask of dailyEntry.reflectionTasks) {
      const task = reflectionTask.task;

      const taskSnapshot =
        await this.prisma.reflectionTaskSnapshot.create({
          data: {
            reflectionSnapshotId: snapshot.reflectionSnapshotId,
            taskId: task.taskId,
            title: task.title,
            priority: task.priority,
            memo: task.memo,
            status:
              task.completed
                ? TaskStatus.COMPLETED
                : TaskStatus.IN_PROGRESS,
            completedAt:
              task.completed
                ? new Date()
                : null,
          },
        });

      // Task Result Snapshot 저장
      for (const taskResult of task.taskResults) {
        await this.prisma.reflectionTaskResultSnapshot.create({
          data:{
            reflectionTaskSnapshotId: taskSnapshot.reflectionTaskSnapshotId,
            taskResultId: taskResult.taskResultId,
            content: taskResult.content,
          },
        });
      }
    }

    // 완료율 계산
    const completedCount =
      request.tasks.filter(
        (task) => task.completed,
      ).length;

    const completionRate =
      request.tasks.length === 0
        ? 0
        : Math.round((completedCount / request.tasks.length) * 100 );

    // DailyPerformance 저장
    const performance =
      await this.prisma.dailyPerformance.create({
        data: {
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