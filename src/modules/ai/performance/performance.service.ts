import { PromptManager } from "../common/prompt.manager.js";
import { LlmClient } from "../common/llm.client.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { PerformanceRequestDto } from "./dto/api/performance.request.dto.js";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto.js";
import { PerformanceResponseDto, SupplementQuestionDto } from "./dto/api/performance.response.dto.js";
import { PromptAOutputDto } from "./dto/prompt/prompt.a.output.dto.js";
import { PromptBOutputDto } from "./dto/prompt/prompt.b.output.dto.js";

import { PrismaClient, Prisma, PromptType, AiRunStatus, AIQuestionStatus, DailyEntry } from "../../../generated/prisma/client.js";
import { verifyAccessToken } from "../../../auth.config.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";

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
          promptAResult: JSON.parse(JSON.stringify(promptAResult)),
        },
      });

    const supplementQuestions: SupplementQuestionDto[] = [];

    if (
      promptAResult.followUpQuestions &&
      promptAResult.followUpQuestions.length > 0
    ) {
      for (const [index, question] of promptAResult.followUpQuestions.entries()) {
        const createdQuestion =
          await this.prisma.aIQuestion.create({
            data: {
              reflectionSnapshotId:
                snapshot.reflectionSnapshotId,
              questionContent: question.question,
              reason: question.reason ?? null,
              order: index + 1,
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
            promptAResult: JSON.parse(JSON.stringify(promptAResult)),
            promptBResult: JSON.parse(JSON.stringify(promptBResult)),
          },
        });
    } 
    else {
      snapshot =
        await this.prisma.reflectionSnapshot.create({
          data: {
            dailyEntryId: request.dailyEntryId,
            promptAResult: JSON.parse(JSON.stringify(promptAResult)),
            promptBResult: JSON.parse(JSON.stringify(promptBResult)),
          },
        });
    }

  await this.prisma.aIRun.create({
    data: {
      promptType: PromptType.PROMPT_B,
      promptVersion: "v1",
      request: JSON.parse(JSON.stringify(promptBRequest)),
      response: promptBResponse,
      status: AiRunStatus.SUCCESS,
      reflectionSnapshotId:
        snapshot.reflectionSnapshotId,
    },
  });

    return {
      status: "COMPLETED",
      summary: promptBResult.summary,
      growthInsights: promptBResult.growthInsights,
      nextActions: promptBResult.nextActions,
      taskPerformances: promptBResult.taskPerformances,
    };
  }
}