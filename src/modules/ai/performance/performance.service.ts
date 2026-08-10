import { PromptManager } from "../common/prompt.manager.js";
import { LlmClient } from "../common/llm.client.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { PerformanceRequestDto, TaskDto } from "./dto/api/performance.request.dto.js";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto.js";
import { PerformanceResponseDto, SupplementQuestionDto } from "./dto/api/performance.response.dto.js";
import { PromptAOutputDto } from "./dto/prompt/prompt.a.output.dto.js";
import { PromptBOutputDto } from "./dto/prompt/prompt.b.output.dto.js";

import { PrismaClient, Prisma, PromptType, AiRunStatus, AIQuestionStatus } from "../../../generated/prisma/client.js";
import { verifyAccessToken } from "../../../auth.config.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";
import { TaskStatus, TaskPriority } from "../../tasks/task.dto.js";
import { TaskPriority as PrismaTaskPriority, TaskStatus as PrismaTaskStatus } from "../../../generated/prisma/enums.js";
export class PerformanceService {
  constructor(
    private readonly llmClient: LlmClient,
    private readonly promptManager: PromptManager,
    private readonly responseParser: ResponseParser,
    private readonly ruleEngine: RuleEngine,
    private readonly prisma: PrismaClient,
  ) {}

  private toTaskPriority(
    priority: PrismaTaskPriority,
  ): TaskPriority {
    switch (priority) {
      case PrismaTaskPriority.MUST_DO:
        return TaskPriority.MUST_DO;

      case PrismaTaskPriority.SHOULD_DO:
        return TaskPriority.SHOULD_DO;

      case PrismaTaskPriority.COULD_DO:
        return TaskPriority.COULD_DO;
    }
  }

  private toTaskStatus(
    status: PrismaTaskStatus,
  ): TaskStatus {
    switch (status) {
      case PrismaTaskStatus.IN_PROGRESS:
        return TaskStatus.IN_PROGRESS;

      case PrismaTaskStatus.COMPLETED:
        return TaskStatus.COMPLETED;
    }
  }

  private async findDailyEntryTasks(
    dailyEntryId: string,
    userId: string,
  ): Promise<TaskDto[]> {
    const reflectionTasks =
      await this.prisma.reflectionTask.findMany({
        where: {
          dailyEntryId,
          task: {
            userId,
            deletedAt: null,
          },
        },
        include: {
          task: {
            include: {
              taskResult: true,
            },
          },
        },
        orderBy: {
          task: {
            sortOrder: "asc",
          },
        },
      });

    return reflectionTasks.map(({ task }) => ({
      taskId: task.taskId,
      priority: this.toTaskPriority(task.priority),
      status: this.toTaskStatus(task.status),
      completedAt: task.completedAt
        ? task.completedAt.toISOString()
        : undefined,
      title: task.title,
      memo: task.memo ?? undefined,
      taskResult: task.taskResult
        ? {
            taskResultId: task.taskResult.taskResultId,
            content: task.taskResult.content,
          }
        : undefined,
    }));
  }

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
    const serverTasks =
      await this.findDailyEntryTasks(
        request.dailyEntryId,
        userId,
      );

    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: serverTasks,
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
        request: JSON.parse(JSON.stringify(promptARequest)),
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
      const {
        reflectionSnapshotId,
        supplementQuestions,
      } = await this.saveQuestionSnapshot(
        request.dailyEntryId,
        promptAResult,
      );

      return {
        status: "QUESTION_REQUIRED",
        reflectionSnapshotId,
        supplementQuestions,
      };
    }
      // 질문 필요 없으면 바로 완료
      const snapshot =
        await this.preparePerformanceSnapshot(
          promptAResult,
          request,
          serverTasks,
        );

      void this.runPromptB(
        snapshot.reflectionSnapshotId,
        promptAResult,
        request,
        serverTasks,
      ).catch(async(error)=>{
        console.error(error);

        await this.prisma.reflectionSnapshot.update({
          where:{
            reflectionSnapshotId:
              snapshot.reflectionSnapshotId,
          },
          data:{
            status:"FAILED",
          },
        });
      });

      return {
        status: "PROCESSING",
        reflectionSnapshotId:
          snapshot.reflectionSnapshotId,
      };
    }
  
  // 질문 단계 snapshot 생성
  private async saveQuestionSnapshot(
    dailyEntryId: string,
    promptAResult: PromptAOutputDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {

      const snapshot =
        await tx.reflectionSnapshot.create({
          data: {
            dailyEntryId,
            promptAResult: JSON.parse(JSON.stringify(promptAResult)),
            status: "TEMP",
          },
        });

      const supplementQuestions: SupplementQuestionDto[] = [];

      if (
        promptAResult.followUpQuestions &&
        promptAResult.followUpQuestions.length > 0
      ) {

        for (
          const [index, question]
          of promptAResult.followUpQuestions.entries()
        ) {

          const createdQuestion =
            await tx.aIQuestion.create({
              data:{
                reflectionSnapshotId: snapshot.reflectionSnapshotId,
                questionContent: question.question,
                reason: question.reason ?? null,
                order:index + 1,
              },
            });

          supplementQuestions.push({
            aiQuestionId: createdQuestion.aiQuestionId,
            question: createdQuestion.questionContent,
            reason: createdQuestion.reason ?? "",
          });
        }
      }

      return {
        reflectionSnapshotId: snapshot.reflectionSnapshotId,
        supplementQuestions,
      };
    });
  }

  // 질문 답변 후 최종 생성
  async completePerformancePreview(
    authorization: string | undefined,
    request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {

    const userId = this.extractUserId(authorization);
    const snapshot =
      await this.prisma.reflectionSnapshot.findFirst({
        where: {
          reflectionSnapshotId: request.reflectionSnapshotId,
          dailyEntry: {
            userId,
            deletedAt: null,
          },
        },
      });

    if (!snapshot) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "성과 데이터를 찾을 수 없습니다.",
      );
    }
    // AIQuestion 상태 업데이트
    const questionStatus =
      request.answers.length > 0  // 프론트에서 답변 건너뛰기 시 빈 배열을 보냄
        ? AIQuestionStatus.ANSWERED
        : AIQuestionStatus.SKIPPED;

    if (request.answers.length > 0) {
      for (const answer of request.answers) {
        const question =
          await this.prisma.aIQuestion.findFirst({
            where: {
              aiQuestionId: answer.aiQuestionId,
              reflectionSnapshotId:
                request.reflectionSnapshotId,
            },
          });

        if (!question) {
          throw new ApiError(
            ErrorCode.NOT_FOUND.status,
            ErrorCode.NOT_FOUND.code,
            "질문 데이터를 찾을 수 없습니다.",
          );
        }

        await this.prisma.aIQuestion.update({
          where: {
            aiQuestionId: question.aiQuestionId,
          },
          data: {
            answer: answer.answer,
            status: questionStatus,
          },
        });
      }
    } else {
      await this.prisma.aIQuestion.updateMany({
        where: {
          reflectionSnapshotId: snapshot.reflectionSnapshotId,
        },
        data: {
          status: questionStatus,
        },
      });
    }

    const serverTasks =
    await this.findDailyEntryTasks(
      request.originalRequest.dailyEntryId,
      userId,
    );

    // 답변 포함해서 Prompt A 재호출
    const promptARequest =
      this.promptManager.buildPromptA({
        tasks: serverTasks,
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
        request: JSON.parse(JSON.stringify(promptARequest)),
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

    const updatedSnapshot =
      await this.preparePerformanceSnapshot(
        promptAResult,
        request.originalRequest,
        serverTasks,
        request.reflectionSnapshotId,
      );

    void this.runPromptB(
      updatedSnapshot.reflectionSnapshotId,
      promptAResult,
      request.originalRequest,
      serverTasks,
    ).catch(async (error) => {
      console.error(error);

      await this.prisma.reflectionSnapshot.update({
        where:{
          reflectionSnapshotId:
            updatedSnapshot.reflectionSnapshotId,
        },
        data:{
          status:"FAILED",
        },
      });
    });

    return {
      status: "PROCESSING",
      reflectionSnapshotId:
        updatedSnapshot.reflectionSnapshotId,
    };
  }

  // Prompt B 실행 + 저장
  private async preparePerformanceSnapshot(
    promptAResult: PromptAOutputDto,
    request: PerformanceRequestDto,
    serverTasks: TaskDto[],
    reflectionSnapshotId?: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      let snapshot;

      if (reflectionSnapshotId) {
        snapshot = await tx.reflectionSnapshot.update({
          where: {
            reflectionSnapshotId,
          },
          data: {
            promptAResult: JSON.parse(JSON.stringify(promptAResult)),
            status: "PROCESSING",
          },
        });
      } else {
        snapshot = await tx.reflectionSnapshot.create({
          data: {
            dailyEntryId: request.dailyEntryId,
            promptAResult: JSON.parse(JSON.stringify(promptAResult)),
            status: "PROCESSING",
          },
        });
      }

      // 기존 Task Result Snapshot 삭제
      await tx.reflectionTaskResultSnapshot.deleteMany({
        where: {
          reflectionTaskSnapshot: {
            reflectionSnapshotId: snapshot.reflectionSnapshotId,
          },
        },
      });

      // 기존 Task Snapshot 삭제
      await tx.reflectionTaskSnapshot.deleteMany({
        where: {
          reflectionSnapshotId: snapshot.reflectionSnapshotId,
        },
      });

      // 최신 Task Snapshot 생성
      await this.createReflectionTaskSnapshots(
        tx,
        snapshot.reflectionSnapshotId,
        request.tasks,
      );

      return snapshot;
    });
  }

  private async runPromptB(
    snapshotId: string,
    promptAResult: PromptAOutputDto,
    request: PerformanceRequestDto,
    tasks: TaskDto[],
  ) {
    const completedTaskIds = new Set(
      tasks
        .filter(task => task.status === TaskStatus.COMPLETED)
        .map(task => task.taskId),
    );

    const filteredPromptATasks =
      promptAResult.tasks.filter(task =>
        completedTaskIds.has(task.taskId),
      );

    const promptBRequest =
      this.promptManager.buildPromptB({
        structuredData: {
          ...promptAResult,
          tasks: filteredPromptATasks,
        },
        userJob: request.userJob,
        yearsOfService: request.yearsOfService,
        projectTag: request.projectTag,
      });

    const promptBResponse =
      await this.llmClient.generate(promptBRequest);

    const promptBResult =
      this.responseParser.parse<PromptBOutputDto>(
        promptBResponse,
      );

    const filteredTaskPerformances =
      (promptBResult.taskPerformances ?? []).filter(
        task => completedTaskIds.has(task.taskId),
      );

    const finalPromptBResult = {
      ...promptBResult,
      taskPerformances: filteredTaskPerformances,
    };

    this.ruleEngine.validatePromptB(
      finalPromptBResult,
    );

    await this.prisma.$transaction(async(tx)=>{
      await tx.reflectionSnapshot.update({
        where:{
          reflectionSnapshotId:snapshotId
        },
        data:{
          promptBResult: JSON.parse(JSON.stringify(finalPromptBResult)),
          status:"TEMP",
        },
      });

      await tx.aIRun.create({
        data:{
          promptType: PromptType.PROMPT_B,
          promptVersion:"v1",
          request: JSON.parse(JSON.stringify(promptBRequest)),
          response: promptBResponse,
          status: AiRunStatus.SUCCESS,
          reflectionSnapshotId:snapshotId,
        },
      });
    });
  }

  private async createReflectionTaskSnapshots(
      tx: Prisma.TransactionClient,
    reflectionSnapshotId: string,
    tasks: TaskDto[],
  ) {
    for (const task of tasks) {
      const taskSnapshot =
        await tx.reflectionTaskSnapshot.create({
          data: {
            reflectionSnapshotId,
            taskId: task.taskId,
            title: task.title,
            priority: task.priority,
            memo: task.memo ?? null,
            status: task.status,
            completedAt: task.completedAt
              ? new Date(task.completedAt)
              : null,
          },
        });

      if (task.taskResult?.taskResultId) {
        await tx.reflectionTaskResultSnapshot.create({
          data: {
            reflectionTaskSnapshotId: taskSnapshot.reflectionTaskSnapshotId,
            taskResultId: task.taskResult.taskResultId,
            content: task.taskResult.content,
          },
        });
      }
    }
  }
}