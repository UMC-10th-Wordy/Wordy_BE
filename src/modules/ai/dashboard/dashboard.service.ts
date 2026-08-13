import { Prisma } from "../../../generated/prisma/client.js";

import { PromptManager } from "../common/prompt.manager.js";
import { LlmClient } from "../common/llm.client.js";
import { ResponseParser } from "../common/response.parser.js";
import { RuleEngine } from "../common/rule.engine.js";

import { PrismaClient, PromptType, AiRunStatus } from "../../../generated/prisma/client.js";
import { ApiError } from "../../../common/errors/api.error.js";
import { ErrorCode } from "../../../common/errors/error.code.js";
import { verifyAccessToken } from "../../../auth.config.js";

import { DashboardRequestDto }from "./dto/api/dashboard.request.dto.js";
import { DashboardResponseDto }from "./dto/api/dashboard.response.dto.js";
import { DashboardKpiInputDto, DashboardTagInputDto, PromptCInputDto, WeeklySummaryCandidateDto }from "./dto/prompt/prompt.c.input.dto.js";
import { PromptCOutputDto }from "./dto/prompt/prompt.c.output.dto.js";
import { PromptDOutputDto } from "./dto/prompt/prompt.d.output.dto.js";
import { PromptDInputDto } from "./dto/prompt/prompt.d.input.dto.js";

type PerformanceItem = {
  output: unknown;
  impact: unknown;
  task: {
    tag: {
      tagId: string;
      tagName: string;
      color: string | null;
      projectName: string | null;
      projectPurpose: string | null;
      expectedOutcome: string | null;
      kpis: unknown;
    } | null;
  };
};

type DailyPerformanceWithItems =
  Prisma.DailyPerformanceGetPayload<{
    include: {
      performanceItems: {
        include: {
          task: {
            include: {
              tag: true;
            };
          };
        };
      };
    };
  }>;

export class DashboardService {
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

  private async validateWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!workspace) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "워크스페이스를 찾을 수 없습니다.",
      );
    }

    if (workspace.userId !== userId) {
      throw new ApiError(
        ErrorCode.FORBIDDEN.status,
        ErrorCode.FORBIDDEN.code,
        "해당 워크스페이스에 접근할 권한이 없습니다.",
      );
    }
  }

  private validateDateRange(
    startDateInput: string | undefined,
    endDateInput: string | undefined,
  ): {
    startDate: Date;
    endDate: Date;
  } {
    if (!startDateInput || !endDateInput) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "startDate와 endDate는 필수입니다.",
      );
    }

    // YYYY-MM-DD 형식만 허용
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (
      !dateRegex.test(startDateInput) ||
      !dateRegex.test(endDateInput)
    ) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "날짜는 YYYY-MM-DD 형식이어야 합니다.",
      );
    }

    const startDate = new Date(`${startDateInput}T00:00:00.000Z`);
    const endDate = new Date(`${endDateInput}T00:00:00.000Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "올바르지 않은 날짜입니다.",
      );
    }

    // JS Date가 자동 보정하는 문제 방지
    if (
      startDate.toISOString().slice(0, 10) !== startDateInput ||
      endDate.toISOString().slice(0, 10) !== endDateInput
    ) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "올바르지 않은 날짜입니다.",
      );
    }

    if (startDate > endDate) {
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "startDate는 endDate보다 클 수 없습니다.",
      );
    }

    return {
      startDate,
      endDate,
    };
  }

  // 주간 대시보드 AI 생성
  async generateWeeklyDashboard(
    authorization: string | undefined,
    workspaceId: string,
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    const userId = this.extractUserId(authorization);

    // 1. 주간 성과 조회
    // workspace 존재 여부 및 소유권 검증
    await this.validateWorkspace(userId, workspaceId);

    // 날짜 검증
    const {
      startDate,
      endDate: requestedEndDate,
    } = this.validateDateRange(
      request.startDate,
      request.endDate,
    );

    // 조회용 endDate는 다음 날 00시
    const endDate = new Date(requestedEndDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const performances =
      await this.prisma.dailyPerformance.findMany({
        where: {
          userId,
          dailyEntry: {
            workspaceId,
            entryDate: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
        include: {
          performanceItems: {
            include: {
              task: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      });

      const tasks = await this.prisma.task.findMany({
        where: {
          userId,
          workspaceId,
          taskDate: {
            gte: startDate,
            lt: endDate,
          },
          deletedAt: null,
          tagId: {
            not: null,
          },
        },
        include: {
          tag: true,
        },
      });

    // 해당 기간에 실제 사용된 Task 기준으로 태그 및 Task 수집
    const usedTags = new Map<
      string,
      {
        tagId: string;
        tagName: string;
        color: string | null;
        projectName: string | null;
        projectPurpose: string | null;
        expectedOutcome: string | null;
        kpis: unknown;
      }
    >();

    const tagTaskCountMap = new Map<string, number>();

    for (const task of tasks) {
      const tag = task.tag;

      if (!tag) continue;

      // 실제 사용된 태그 저장
      usedTags.set(tag.tagId, {
        tagId: tag.tagId,
        tagName: tag.tagName,
        color: tag.color,
        projectName: tag.projectName,
        projectPurpose: tag.projectPurpose,
        expectedOutcome: tag.expectedOutcome,
        kpis: tag.kpis,
      });

      // 태그별 실제 Task 수
      tagTaskCountMap.set(
        tag.tagId,
        (tagTaskCountMap.get(tag.tagId) ?? 0) + 1,
      );
    }

    // 기존 대시보드 존재 시 하위데이터 삭제
    const existingDashboard =
      await this.prisma.dashboard.findFirst({
        where: {
          userId,
          workspaceId,
          type: "WEEKLY",
          startDate,
          endDate: requestedEndDate,
        },
      });

    // 2. Prompt C Input 생성
    const promptCInput: PromptCInputDto = {
      startDate: request.startDate,
      endDate: request.endDate,

      // 주간 핵심 성과 후보
      weeklySummaryCandidates:
        this.createWeeklySummaryCandidates(
          performances,
        ),

      // 태그별 분석 데이터
      tagAnalyses:
        this.createTagAnalysisInput(
          performances,
        ),

      // KPI 진행 데이터
      kpiProgress:
        this.createKpiInput(
          performances,
        ),
    };

    // 3. Prompt 생성
    const promptRequest =
      this.promptManager.buildPromptC(
        promptCInput,
      );

    // 4. LLM 호출
    const promptResponse =
      await this.llmClient.generate(
        promptRequest,
      );

    // 5. AIRun 저장
    await this.prisma.aIRun.create({
      data: {
        promptType: PromptType.PROMPT_C,
        promptVersion: "v1",
        request: JSON.parse(JSON.stringify(promptRequest)),
        response: promptResponse,
        status: AiRunStatus.SUCCESS,
      },
    });

    // 6. Parsing
    const dashboardResult =
      this.responseParser.parse<PromptCOutputDto>(
        promptResponse,
      );

    // 7. Rule 검증
    this.ruleEngine.validatePromptC(
      dashboardResult,
    );

    // 8. Dashboard 저장
    let dashboard;

    try {
      dashboard = await this.prisma.$transaction(
        async (tx) => {
          let dashboardId: string;

          if (existingDashboard) {
            // 기존 Dashboard의 하위 데이터 삭제
            await tx.dashboardPerformance.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardKPI.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardInsight.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardTagAnalysis.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            dashboardId = existingDashboard.dashboardId;
          } else {
            // 새 Dashboard ID 생성
            dashboardId = crypto.randomUUID();
          }

          // 기존 Dashboard면 update,
          // 없으면 create
          const dashboard = existingDashboard
            ? await tx.dashboard.update({
                where: {
                  dashboardId,
                },
                data: {
                  summary: dashboardResult.summary,
                  keyAchievement: dashboardResult.keyAchievement,
                  focusedTags: dashboardResult.focusedTags.map((tag) => ({
                    tagId: tag.tagId,
                    tagName: tag.tagName,
                  })) as Prisma.InputJsonValue,
                  journalDays: performances.length,
                  performanceCount: performances.length,
                  tagCount: usedTags.size,
                },
              })
            : await tx.dashboard.create({
                data: {
                  dashboardId,
                  userId,
                  workspaceId,
                  type: "WEEKLY",
                  startDate,
                  endDate: requestedEndDate,

                  summary: dashboardResult.summary,
                  keyAchievement: dashboardResult.keyAchievement,
                  focusedTags: dashboardResult.focusedTags.map((tag) => ({
                    tagId: tag.tagId,
                    tagName: tag.tagName,
                  })) as Prisma.InputJsonValue,

                  journalDays: performances.length,
                  performanceCount: performances.length,
                  tagCount: usedTags.size,
                },
              });

          // 공통 하위 데이터 생성
          await tx.dashboardPerformance.createMany({
            data: performances.map((performance) => ({
              dashboardId,
              dailyPerformanceId:
                performance.dailyPerformanceId,
            })),
          });

          await tx.dashboardKPI.createMany({
            data: dashboardResult.kpis.map((kpi) => ({
              dashboardId,
              tagId: kpi.tagId,
              kpiName: kpi.kpiName,
              progress: kpi.progress,
              relatedAchievement: kpi.relatedAchievement,
            })),
          });

          await tx.dashboardInsight.create({
            data: {
              dashboardId,
              journalDays: performances.length,
              performanceCount: performances.length,
              tagCount: usedTags.size,
            },
          });

          await tx.dashboardTagAnalysis.createMany({
            data: Array.from(usedTags.values()).map((tag) => {
              const analysis = dashboardResult.tagAnalyses.find(
                (item) => item.tagId === tag.tagId,
              );

              return {
                dashboardId,

                tagId: tag.tagId,
                tagName: tag.tagName,
                color: tag.color ?? "",

                goal: analysis?.objective ?? tag.projectPurpose ?? "",
                expectedOutcome:
                  analysis?.expectedOutcome ?? tag.expectedOutcome ?? "",
                achievementStatus:
                  analysis?.achievementStatus ?? "",
                insight: analysis?.insight ?? "",

                taskCount: tagTaskCountMap.get(tag.tagId) ?? 0,

                periodStart: startDate,
                periodEnd: requestedEndDate,
              };
            }),
          });

          return dashboard;
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw new ApiError(
              ErrorCode.CONFLICT.status,
              ErrorCode.CONFLICT.code,
              "이미 존재하는 대시보드입니다.",
            );

          case "P2025":
            throw new ApiError(
              ErrorCode.NOT_FOUND.status,
              ErrorCode.NOT_FOUND.code,
              "대시보드 데이터를 찾을 수 없습니다.",
            );

          default:
            throw new ApiError(
              ErrorCode.INTERNAL_SERVER_ERROR.status,
              ErrorCode.INTERNAL_SERVER_ERROR.code,
              "대시보드 처리 중 오류가 발생했습니다.",
            );
        }
      }

      throw error;
    }

    // 12. Response 반환
    return {
      dashboardId: dashboard.dashboardId,
      startDate: request.startDate,
      endDate: request.endDate,
      summary: dashboardResult.summary,
      keyAchievement: dashboardResult.keyAchievement,
      focusedTags: dashboardResult.focusedTags,
      journalDays: performances.length,
      performanceCount: performances.length,
      tagCount: usedTags.size,
      kpis: dashboardResult.kpis.map((kpi) => ({
        tagId: kpi.tagId,
        kpiName: kpi.kpiName,
        progress: kpi.progress,
        relatedAchievement: kpi.relatedAchievement,
      })),
      tagAnalyses: Array.from(usedTags.values()).map((tag) => {
        const analysis = dashboardResult.tagAnalyses.find(
          (item) => item.tagId === tag.tagId,
        );

        return {
          tagId: tag.tagId,
          tagName: tag.tagName,
          color: tag.color ?? "",
          taskCount: tagTaskCountMap.get(tag.tagId) ?? 0,

          objective: analysis?.objective ?? tag.projectPurpose ?? "",
          expectedOutcome:
            analysis?.expectedOutcome ?? tag.expectedOutcome ?? "",
          achievementStatus:
            analysis?.achievementStatus ?? "",
          insight: analysis?.insight ?? "",
        };
      }),
    };
  }

  // 주간 핵심 성과 후보 생성
  private createWeeklySummaryCandidates(
    performances: DailyPerformanceWithItems[],
  ): WeeklySummaryCandidateDto[] {

    return performances.map(
      (performance) => ({
        performanceId: performance.dailyPerformanceId,
        summary: performance.summary,
        items: performance.performanceItems.map(
          (item: PerformanceItem) => ({
            output: String(item.output),
            impact: String(item.impact),
          }),
        ),
        achievementRate: performance.achievementRate,
      }),
    );
  }

  // 태그별 Prompt C Input 생성
  private createTagAnalysisInput(
    performances: DailyPerformanceWithItems[],
  ): DashboardTagInputDto[] {
    const tagMap =
      new Map<string, DashboardTagInputDto>();

    performances.forEach(
      (performance) => {
        performance.performanceItems.forEach(
          (item: PerformanceItem) => {
            const tag = item.task.tag;
            
            const tagId = tag?.tagId ?? "";
            const tagName = tag?.tagName ?? "기타";
            const color = tag?.color ?? "";

            if (!tagMap.has(tagId)) {
              tagMap.set(
                tagId,
                {
                  tagId,
                  tagName,
                  color,
                  projectName: tag?.projectName ?? "",
                  projectPurpose: tag?.projectPurpose ?? "",
                  expectedOutcome: tag?.expectedOutcome ?? "",
                  performances: [],
                  kpis:
                    Array.isArray(tag?.kpis)
                      ? tag.kpis as string[]
                      : [],
                },
              );
            }
            tagMap
              .get(tagId)!
              .performances.push({
                output: String(item.output),
                impact: String(item.impact),
              });
          },
        );
      },
    );
    return Array.from(tagMap.values());
  }

  // KPI Prompt C Input 생성
  private createKpiInput(
    performances: DailyPerformanceWithItems[],
  ): DashboardKpiInputDto[] {
    const kpiMap = new Map<string, DashboardKpiInputDto>();

    performances.forEach((performance) => {
      performance.performanceItems.forEach(
        (item: PerformanceItem) => {
          const tag = item.task.tag;

          if (!tag) return;

          const kpis =
            Array.isArray(tag.kpis)
              ? tag.kpis as {
                  name: string;
                  target: string;
                }[]
              : [];

          kpis.forEach((kpi) => {
            // 태그 + KPI 이름으로 구분
            const key = `${tag.tagId}:${kpi.name}`;

            if (!kpiMap.has(key)) {
              kpiMap.set(key, {
                tagId: tag.tagId,
                kpiName: kpi.name,
                target: kpi.target,
                relatedPerformances: [],
              });
            }

            kpiMap.get(key)!.relatedPerformances.push({
              output: String(item.output),
              impact: String(item.impact),
            });
          });
        },
      );
    });

    return Array.from(kpiMap.values());
  }

  // 월간 대시보드 AI 생성
  async generateMonthlyDashboard(
    authorization: string | undefined,
    workspaceId: string,
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    const userId = this.extractUserId(authorization);

    await this.validateWorkspace(userId, workspaceId);

    const {
      startDate,
      endDate: requestedEndDate,
    } = this.validateDateRange(
      request.startDate,
      request.endDate,
    );

    // 1. 주간 대시보드 조회
    const weeklyDashboards =
      await this.prisma.dashboard.findMany({
        where:{
          userId,
          workspaceId,
          type:"WEEKLY",
          startDate:{
            gte: new Date(request.startDate),
          },
          endDate:{
            lte: new Date(request.endDate),
          },
        },
        include:{
          kpis: true,
          tagAnalyses: true,
          weeklyReflections: true,
          performances: true,
        },
      });

    if(weeklyDashboards.length === 0){
      throw new ApiError(
        ErrorCode.BAD_REQUEST.status,
        ErrorCode.BAD_REQUEST.code,
        "월간 대시보드를 생성할 주간 데이터가 없습니다.",
      );
    }

    const journalDays = weeklyDashboards.reduce(
      (sum, dashboard) => sum + dashboard.journalDays,
      0,
    );

    const dailyPerformanceIds = [
      ...new Set(
        weeklyDashboards.flatMap((dashboard) =>
          dashboard.performances.map(
            (performance) => performance.dailyPerformanceId,
          ),
        ),
      ),
    ];

    const performanceCount = dailyPerformanceIds.length;

    // 2. Prompt D Input 생성
    const promptDInput:PromptDInputDto = {
      startDate: request.startDate,
      endDate: request.endDate,
      weeklyDashboards:
        weeklyDashboards.map(
          (dashboard: typeof weeklyDashboards[number])=>({
            dashboardId: dashboard.dashboardId,
            startDate: dashboard.startDate.toISOString(),
            endDate: dashboard.endDate.toISOString(),
            summary: dashboard.summary,
            kpis:
              dashboard.kpis.map(
                (kpi) => ({
                  tagId: kpi.tagId ?? "",
                  kpiName: kpi.kpiName ?? "",
                  progress: kpi.progress ?? "",
                  relatedAchievement: kpi.relatedAchievement ?? "",
                }),
              ),
            tagAnalyses:
              dashboard.tagAnalyses.map(
                (tag) => ({
                  tagId: tag.tagId ?? "",
                  tagName: tag.tagName ?? "",
                  color: tag.color ?? "",

                  goal: tag.goal ?? "",
                  expectedOutcome: tag.expectedOutcome ?? "",
                  achievementStatus: tag.achievementStatus ?? "",
                }),
              ),
            weeklyReflection:
              dashboard.weeklyReflections[0]
                ? {
                    workSummary:
                      dashboard.weeklyReflections[0].workSummary ?? "",
                    resourcesUsed:
                      dashboard.weeklyReflections[0].resourcesUsed ?? "",
                    learning:
                      dashboard.weeklyReflections[0].learning ?? "",
                  }
                : undefined,
          }),
        ),
    };

    const tagTaskCountMap = new Map<string, number>();

    for (const dashboard of weeklyDashboards) {
      for (const tag of dashboard.tagAnalyses) {
        if (!tag.tagId) continue;

        tagTaskCountMap.set(
          tag.tagId,
          (tagTaskCountMap.get(tag.tagId) ?? 0) + (tag.taskCount ?? 0),
        );
      }
    }

    const tagInfoMap = new Map<
      string,
      {
        tagId: string;
        tagName: string;
        color: string;
        goal: string;
        expectedOutcome: string;
      }
    >();

    for (const dashboard of weeklyDashboards) {
      for (const tag of dashboard.tagAnalyses) {
        if (!tag.tagId) continue;

        tagInfoMap.set(tag.tagId, {
          tagId: tag.tagId,
          tagName: tag.tagName ?? "",
          color: tag.color ?? "",
          goal: tag.goal ?? "",
          expectedOutcome: tag.expectedOutcome ?? "",
        });
      }
    }

    const tagCount = tagInfoMap.size;

    // 3. Prompt 생성
    const promptRequest =
      this.promptManager.buildPromptD(
        promptDInput,
      );

    // 4. LLM
    const promptResponse =
      await this.llmClient.generate(
        promptRequest,
      );

    // 5. AIRun 저장
    await this.prisma.aIRun.create({
      data:{
        promptType:PromptType.PROMPT_D,
        promptVersion:"v1",
        request: JSON.parse(JSON.stringify(promptRequest)),
        response:promptResponse,
        status:AiRunStatus.SUCCESS,
      },
    });

    // 6. Parsing
    const monthlyResult =
      this.responseParser.parse<PromptDOutputDto>(
        promptResponse,
      );

    // 7. Rule 검증
    this.ruleEngine.validatePromptD(
      monthlyResult,
    );

    // 기존 월간 대시보드 조회
    const existingDashboard =
      await this.prisma.dashboard.findFirst({
        where: {
          userId,
          workspaceId,
          type: "MONTHLY",
          startDate,
          endDate: requestedEndDate,
        },
      });

    // 8. Dashboard 저장
    let dashboard;

    try {
      dashboard = await this.prisma.$transaction(
        async (tx) => {
          let dashboard;

          if (existingDashboard) {
            // 기존 Dashboard의 하위 데이터 삭제
            await tx.dashboardPerformance.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardKPI.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardInsight.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            await tx.dashboardTagAnalysis.deleteMany({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
            });

            // 기존 Dashboard 본체 갱신
            dashboard = await tx.dashboard.update({
              where: {
                dashboardId: existingDashboard.dashboardId,
              },
              data: {
                summary: monthlyResult.summary,
                keyAchievement: monthlyResult.keyAchievement,
                focusedTags: monthlyResult.focusedTags.map((tag) => ({
                  tagId: tag.tagId,
                  tagName: tag.tagName,
                })) as Prisma.InputJsonValue,

                journalDays,
                performanceCount,
                tagCount,
              },
            });
          } else {
            // 기존 Dashboard가 없으면 새로 생성
            dashboard = await tx.dashboard.create({
              data: {
                userId,
                workspaceId,
                type: "MONTHLY",

                startDate,
                endDate: requestedEndDate,

                summary: monthlyResult.summary,
                keyAchievement: monthlyResult.keyAchievement,
                focusedTags: monthlyResult.focusedTags.map((tag) => ({
                  tagId: tag.tagId,
                  tagName: tag.tagName,
                })) as Prisma.InputJsonValue,

                journalDays,
                performanceCount,
                tagCount,
              },
            });
          }

          await tx.dashboardPerformance.createMany({
            data: dailyPerformanceIds.map((dailyPerformanceId) => ({
              dashboardId: dashboard.dashboardId,
              dailyPerformanceId,
            })),
          });

          await tx.dashboardKPI.createMany({
            data: monthlyResult.kpis.map((kpi) => ({
              dashboardId: dashboard.dashboardId,
              tagId: kpi.tagId,
              kpiName: kpi.kpiName,
              progress: kpi.progress,
              relatedAchievement: kpi.relatedAchievement,
            })),
          });

          await tx.dashboardInsight.create({
            data: {
              dashboardId: dashboard.dashboardId,
              journalDays,
              performanceCount,
              tagCount,
            },
          });

          await tx.dashboardTagAnalysis.createMany({
            data: Array.from(tagInfoMap.values()).map((tagInfo) => {
              const analysis = monthlyResult.tagAnalyses.find(
                (tag) => tag.tagId === tagInfo.tagId,
              );

              return {
                dashboardId: dashboard.dashboardId,
                tagId: tagInfo.tagId,
                tagName: tagInfo.tagName,
                color: tagInfo.color,

                goal: tagInfo.goal,
                expectedOutcome: tagInfo.expectedOutcome,
                achievementStatus: analysis?.achievementStatus ?? "",
                insight: analysis?.insight ?? "",

                taskCount: tagTaskCountMap.get(tagInfo.tagId) ?? 0,

                periodStart: startDate,
                periodEnd: requestedEndDate,
              };
            }),
          });

          return dashboard;
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw new ApiError(
              ErrorCode.CONFLICT.status,
              ErrorCode.CONFLICT.code,
              "이미 존재하는 대시보드입니다.",
            );

          case "P2025":
            throw new ApiError(
              ErrorCode.NOT_FOUND.status,
              ErrorCode.NOT_FOUND.code,
              "대시보드 데이터를 찾을 수 없습니다.",
            );

          default:
            throw new ApiError(
              ErrorCode.INTERNAL_SERVER_ERROR.status,
              ErrorCode.INTERNAL_SERVER_ERROR.code,
              "대시보드 처리 중 오류가 발생했습니다.",
            );
        }
      }

      throw error;
}

    // 9. Response 반환
    return {
      dashboardId: dashboard.dashboardId,
      startDate: request.startDate,
      endDate: request.endDate,
      summary: monthlyResult.summary,
      keyAchievement: monthlyResult.keyAchievement,
      focusedTags: monthlyResult.focusedTags,

      journalDays,
      performanceCount,
      tagCount,

      kpis: monthlyResult.kpis.map(
        (kpi) => ({
          tagId: kpi.tagId,
          kpiName: kpi.kpiName,
          progress: kpi.progress,
          relatedAchievement: kpi.relatedAchievement,
        }),
      ),

      tagAnalyses: Array.from(tagInfoMap.values()).map((tagInfo) => {
        const analysis = monthlyResult.tagAnalyses.find(
          (tag) => tag.tagId === tagInfo.tagId,
        );

        return {
          tagId: tagInfo.tagId,
          tagName: tagInfo.tagName,
          color: tagInfo.color,

          objective: tagInfo.goal,
          expectedOutcome: tagInfo.expectedOutcome,
          achievementStatus: analysis?.achievementStatus ?? "",
          insight: analysis?.insight ?? "",

          taskCount: tagTaskCountMap.get(tagInfo.tagId) ?? 0,
        };
      }),
    };
  }
}
