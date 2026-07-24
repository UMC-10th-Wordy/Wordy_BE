import { Body, Controller, Example, Post, Route, Tags } from "tsoa";

import { LlmClient } from "../common/llm.client";
import { PromptManager } from "../common/prompt.manager";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";
import { prisma } from "../../../common/prisma/prisma.client";

import { PerformanceService } from "./performance.service";
import { PerformanceRequestDto } from "./dto/api/performance.request.dto";
import { PerformanceResponseDto } from "./dto/api/performance.response.dto";
import { PerformanceQuestionRequestDto } from "./dto/api/performance.question.request.dto";
import { TaskPriority } from "../../tasks/task.dto";
import { JobRole } from "../../users/users.dto";

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
  @Example<PerformanceRequestDto>({
    userId: "550e8400-e29b-41d4-a716-446655440000",
    tasks: [
      {
        taskId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
        priority: TaskPriority.SHOULD_DO,
        completed: true,
        title: "Swagger 문서 작성",
        memo: "Request/Response 예시 추가",
        taskResult: {
          taskResultId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
          result: "Swagger 문서와 API 예시 데이터를 작성했다."
        }
      }
    ],
    reflectionContent: "오늘 Swagger 문서를 작성하면서 TSOA Example 사용법을 익혔다.",
    projectTag: {
      projectTagId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
      title: "AI 기능",
      description: "AI 관련 업무",
      kpis: [
        "업무 완료율 90%",
        "주간 회고 작성률"
      ]
    },
    userJob: JobRole.DEVELOPMENT
  })
  public async createPerformancePreview(
    @Body() request: PerformanceRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.performanceService.generatePerformancePreview(
      request,
    );
  }

  /**
   * @summary 보충 질문 답변 후 성과 미리보기 생성 완료
   */
  @Post("performance-preview/complete")
  @Example<PerformanceQuestionRequestDto>({
    reflectionSnapshotId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
    originalRequest: {
      userId: "550e8400-e29b-41d4-a716-446655440000",
      tasks: [
        {
          taskId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
          priority: TaskPriority.SHOULD_DO,
          completed: true,
          title: "Swagger 문서 작성",
          memo: "API 예시 추가",
          taskResult: {
            taskResultId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
            result: "API 예시 데이터를 추가했다."
          }
        }
      ],
      reflectionContent: "오늘 API 문서화를 진행했다.",
      userJob: JobRole.DEVELOPMENT
    },
    answers: [
      {
        aiQuestionId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
        question: "이번 작업에서 가장 어려웠던 점은 무엇인가요?",
        answer: "Swagger Example 적용 방법을 찾는 것이었습니다."
      }
    ]
  })
  public async completePerformancePreview(
    @Body() request: PerformanceQuestionRequestDto,
  ): Promise<PerformanceResponseDto> {
    return this.performanceService.completePerformancePreview(
      request,
    );
  }
}