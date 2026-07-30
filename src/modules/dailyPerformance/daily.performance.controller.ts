import { Body, Controller, Example, Get, Header, Patch, Path, Post, Query, Route, Tags } from "tsoa";
import {
  CreateDailyPerformanceRequestDto,
  CreateDailyPerformanceResponseDto,
  DailyPerformancePreviewResponseDto,
  PerformanceDetailResponseDto,
  PerformanceListResponseDto,
  UpdateDailyPerformanceRequestDto,
  UpdateDailyPerformanceResponseDto,
} from "./daily.performance.dto.js";

import { prisma } from "../../db.config.js";
import { DailyPerformanceService } from "./daily.performance.service.js";
import { DailyPerformanceRepository } from "./daily.performance.repository.js";
import { ApiResponse } from "../../common/responses/api.response.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";

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
  @Example<ApiResponse<CreateDailyPerformanceResponseDto>>({
    success: true,
    code: "S200",
    message: "업무 성과 저장에 성공했습니다.",
    result: {
      dailyPerformanceId:
        "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
    },
  })
  public async createDailyPerformance(
    @Header("Authorization")
    authorization: string | undefined,

    @Body()
    request: CreateDailyPerformanceRequestDto,
  ): Promise<ApiResponse<CreateDailyPerformanceResponseDto>> {

    const result =
      await this.dailyPerformanceService.createDailyPerformance(
        authorization,
        request,
      );

    return success(
      SuccessCode.OK.code,
      "업무 성과 저장에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary 업무 성과 조회
   */
  @Get()
  @Example<ApiResponse<PerformanceListResponseDto>>({
    success: true,
    code: "S200",
    message: "업무 성과 조회에 성공했습니다.",
    result: {
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
    },
  })
  public async getDailyPerformances(
    @Header("Authorization")
    authorization: string | undefined,

    @Query()
    date?: string,
  ): Promise<ApiResponse<
    PerformanceListResponseDto | DailyPerformancePreviewResponseDto
  >> {

    const result = date
      ? await this.dailyPerformanceService.getDailyPerformanceByDate(
          authorization,
          date,
        )
      : await this.dailyPerformanceService.getDailyPerformances(
          authorization,
        );

    return success(
      SuccessCode.OK.code,
      "업무 성과 조회에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary 업무 성과 상세 조회
   */
  @Get("/{dailyPerformanceId}")
  @Example<ApiResponse<PerformanceDetailResponseDto>>({
    success: true,
    code: "S200",
    message: "업무 성과 상세 조회에 성공했습니다.",
    result: {
      dailyPerformanceId:
        "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
      achievementRate: 80,
      totalTaskCount: 5,
      completedTaskCount: 3,
      incompleteTasks: [],
      summary:
        "AI 업무 성과 변환 기능을 구현했습니다.",
      growthInsights: [
        "업무 내용을 구조화하는 능력이 향상되었습니다.",
      ],
      nextActions: [
        "프롬프트 정확도 개선하기",
      ],
      taskPerformances: [],
      createdAt: new Date(),
    },
  })
  public async getDailyPerformanceDetail(
    @Header("Authorization")
    authorization: string | undefined,

    @Path()
    dailyPerformanceId: string,
  ): Promise<ApiResponse<PerformanceDetailResponseDto>> {

    const result =
      await this.dailyPerformanceService.getDailyPerformanceDetail(
        authorization,
        dailyPerformanceId,
      );

    return success(
      SuccessCode.OK.code,
      "업무 성과 상세 조회에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary 업무 성과 수정
   */
  @Patch("/{dailyPerformanceId}")
  @Example<ApiResponse<UpdateDailyPerformanceResponseDto>>({
    success: true,
    code: "S200",
    message: "업무 성과 수정에 성공했습니다.",
    result: {
      dailyPerformanceId:
        "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
    },
  })
  public async updateDailyPerformance(
    @Header("Authorization")
    authorization: string | undefined,

    @Path()
    dailyPerformanceId: string,

    @Body()
    request: UpdateDailyPerformanceRequestDto,
  ): Promise<ApiResponse<UpdateDailyPerformanceResponseDto>> {

    const result =
      await this.dailyPerformanceService.updateDailyPerformance(
        authorization,
        dailyPerformanceId,
        request,
      );

    return success(
      SuccessCode.OK.code,
      "업무 성과 수정에 성공했습니다.",
      result,
    );
  }
}