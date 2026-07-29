import { Body, Controller, Example, Header, Post, Route, Tags } from "tsoa";

import { LlmClient } from "../common/llm.client";
import { PromptManager } from "../common/prompt.manager";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";
import { prisma } from "../../../common/prisma/prisma.client";

import { PerformanceService } from "./performance.service";
import { PerformanceRequestDto } from "./dto/api/performance.request.dto";
import { PerformanceResponseDto } from "./dto/api/performance.response.dto";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto";

@Route("ai")
@Tags("AI")
export class PerformanceController extends Controller {
  private readonly performanceService: PerformanceService;

  constructor() {
    super();
    this.performanceService = new PerformanceService(
      new LlmClient(),
      new PromptManager(),
      new ResponseParser(),
      new RuleEngine(),
      prisma,
    );
  }

  /**
   * @summary 성과 미리보기 생성
   */
  @Post("performance-preview")
  @Example<PerformanceResponseDto>({
    status: "QUESTION_REQUIRED",

    supplementQuestions: [
      {
        aiQuestionId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
        question: "이번 작업에서 가장 어려웠던 점은 무엇인가요?",
        reason: "성과 분석을 위해 업무 과정에 대한 추가 정보가 필요합니다.",
      },
      {
        aiQuestionId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad92",
        question: "이 작업이 프로젝트에 어떤 영향을 주었나요?",
        reason: "업무 결과의 영향도를 정확히 분석하기 위한 정보입니다.",
      },
    ],

    summary:
      "Swagger 문서화와 AI 성과 분석 기능 구현을 진행했습니다.",

    growthInsights: [
      "API 문서 구조 설계 경험을 쌓았습니다.",
      "AI 기반 업무 분석 흐름을 이해했습니다.",
    ],

    nextActions: [
      "Dashboard API와 성과 데이터를 연동합니다.",
      "AI 응답 품질 개선 테스트를 진행합니다.",
    ],

    taskPerformances: [
      {
        taskId:
          "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",

        output: [
          "Swagger Example을 추가했습니다.",
          "API 응답 구조를 정리했습니다.",
        ],

        impact: [
          "프론트엔드 협업 효율이 향상되었습니다.",
          "API 이해도가 개선되었습니다.",
        ],
      },
    ],

    reflectionSnapshotId:
      "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
  })
  public async createPerformancePreview(
    @Header("Authorization") authorization: string | undefined,
    @Body() request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.performanceService.generatePerformancePreview(
      authorization,
      request,
    );
  }

  /**
   * @summary 보충 질문 답변 후 성과 미리보기 생성 완료
   */
  @Post("performance-preview/complete")
  @Example<PerformanceResponseDto>({
    status: "COMPLETED",

    summary:
      "보충 질문 답변을 반영하여 업무 성과 분석을 완료했습니다.",

    growthInsights: [
      "업무 과정에서 발생한 문제 해결 경험을 정리했습니다.",
      "성과와 영향도를 구체적으로 표현하는 역량이 향상되었습니다.",
    ],

    nextActions: [
      "추가 업무 성과 데이터를 기록합니다.",
      "프로젝트 목표 대비 진행 상황을 점검합니다.",
    ],

    taskPerformances: [
      {
        taskId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",

        output: [
          "Swagger Example 적용 방법을 확인했습니다.",
          "API 응답 구조를 정리했습니다.",
        ],

        impact: [
          "API 명세 일관성이 개선되었습니다.",
          "팀원 간 API 이해도가 향상되었습니다.",
        ],
      },
    ],

    reflectionSnapshotId:
      "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
  })
  public async completePerformancePreview(
    @Header("Authorization") authorization: string | undefined,
    @Body() request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.performanceService.completePerformancePreview(
      authorization,
      request,
    );
  }
}