import { Body, Controller, Example, Get, Header, Path, Post, Query, Route, Tags } from "tsoa";
import {
  CreateDailyPerformanceRequestDto,
  CreateDailyPerformanceResponseDto,
  DailyPerformancePreviewResponseDto,
  PerformanceDetailResponseDto,
  PerformanceListResponseDto,
} from "./daily.performance.dto.js";

import { prisma } from "../../db.config.js";
import { DailyPerformanceService } from "./daily.performance.service.js";
import { DailyPerformanceRepository } from "./daily.performance.repository.js";

@Route("performances")
@Tags("Performance")
export class DailyPerformanceController extends Controller {
  private readonly dailyPerformanceService: DailyPerformanceService;

  constructor() {
    super();

    this.dailyPerformanceService =
      new DailyPerformanceService(
        new DailyPerformanceRepository(prisma),
      );
  }

  /**
   * @summary 업무 성과 저장 및 갱신
   */
  @Post()
  @Example<CreateDailyPerformanceResponseDto>({
    dailyPerformanceId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
  })
  public async createDailyPerformance(
    @Header("Authorization")
    authorization: string | undefined,

    @Body()
    request: CreateDailyPerformanceRequestDto,
  ): Promise<CreateDailyPerformanceResponseDto> {
    return this.dailyPerformanceService.createDailyPerformance(
      authorization,
      request,
    );
  }

    /**
     * @summary 업무 성과 조회
     */
    @Get()
    @Example<PerformanceListResponseDto>({
      performances: [
        {
          dailyPerformanceId:
            "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
          achievementRate: 80,
          summary:
            "Swagger 문서화 및 AI 성과 분석 기능을 구현했습니다.",
          createdAt: new Date(),
        },
      ],
    })
    public async getDailyPerformances(
      @Header("Authorization")
      authorization: string | undefined,

      @Query()
      date?: string,
    ): Promise<
      PerformanceListResponseDto | DailyPerformancePreviewResponseDto
    > {

      if (date) {
        return this.dailyPerformanceService.getDailyPerformanceByDate(
          authorization,
          date,
        );
      }

      return this.dailyPerformanceService.getDailyPerformances(
        authorization,
      );
    }

  /**
   * @summary 업무 성과 상세 조회
   */
  @Get("/{dailyPerformanceId}")
  @Example<PerformanceDetailResponseDto>({
    dailyPerformanceId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
    achievementRate: 80,
    totalTaskCount: 5,
    completedTaskCount: 3,
    incompleteTasks: [
      {
        tag: {
          tagName: "개발",
          color: "#4A90E2",
        },
        title: "AI 프롬프트 개선",
      },
    ],
    summary: "AI 업무 성과 변환 기능을 구현했습니다.",
    growthInsights: [
      "업무 내용을 구조화하는 능력이 향상되었습니다.",
    ],
    nextActions: [
      "프롬프트 정확도 개선하기",
    ],
    taskPerformances: [
      {
        taskId: "a1b2c3d4-e5f6-7890-abcd-123456789012",
        tag: {
          tagName: "개발",
          color: "#4A90E2",
        },
        title: "성과 변환 API 구현",
        output: [
          "AI 결과 저장 구조 구현",
        ],
        impact: [
          "사용자가 업무 성과를 확인할 수 있도록 개선",
        ],
      },
      {
        taskId:
          "b2c3d4e5-f6a7-8901-bcde-234567890123",
        tag: {
          tagName: "개발",
          color: "#4A90E2",
        },
        title:
          "API 명세 정리",
        output: [],
        impact: [],
        message:
          "내용이 충분하지 않아 성과를 정리하지 못했어요.",
      },
    ],
    createdAt: new Date(),
  })
  public async getDailyPerformanceDetail(
    @Header("Authorization")
    authorization: string | undefined,

    @Path()
    dailyPerformanceId: string,
  ): Promise<PerformanceDetailResponseDto> {
    return this.dailyPerformanceService.getDailyPerformanceDetail(
      authorization,
      dailyPerformanceId,
    );
  }
}