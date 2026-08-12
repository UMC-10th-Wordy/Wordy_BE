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

  // 주간 대시보드 AI 생성
  async generateWeeklyDashboard(
    authorization: string | undefined,
    workspaceId: string,
    request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {

    const userId = this.extractUserId(authorization);

    // 1. 주간 성과 조회
    const startDate = new Date(request.startDate);

    const endDate = new Date(request.endDate);
    endDate.setDate(endDate.getDate() + 1);

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

    // 실제 사용된 태그 + 태그별 task 수집
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

    for (const performance of performances) {
      for (const item of performance.performanceItems) {
        const tag = item.task.tag;

        if (!tag) continue;

        // 실제 사용된 태그만 저장
        usedTags.set(tag.tagId, {
          tagId: tag.tagId,
          tagName: tag.tagName,
          color: tag.color,
          projectName: tag.projectName,
          projectPurpose: tag.projectPurpose,
          expectedOutcome: tag.expectedOutcome,
          kpis: tag.kpis,
        });

        // 태그별 실제 task 수
        tagTaskCountMap.set(
          tag.tagId,
          (tagTaskCountMap.get(tag.tagId) ?? 0) + 1,
        );
      }
    }

    // 기존 대시보드 존재 시 하위데이터 삭제
    const existingDashboard =
      await this.prisma.dashboard.findFirst({
        where: {
          userId,
          workspaceId,
          type: "WEEKLY",
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
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
    const dashboard = await this.prisma.$transaction(
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
                startDate: new Date(request.startDate),
                endDate: new Date(request.endDate),

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

              periodStart: new Date(request.startDate),
              periodEnd: new Date(request.endDate),
            };
          }),
        });

        return dashboard;
      },
    );

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

    // 1. 주간 대시보드 조회
    const weeklyDashboards =
      await this.prisma.dashboard.findMany({
        where:{
          userId,
          workspaceId,
          type:"WEEKLY",
          startDate:{
            gte:new Date(request.startDate),
          },
          endDate:{
            lte:new Date(request.endDate),
          },
        },
        include:{
          kpis:true,
          tagAnalyses:true,
          weeklyReflections:true,
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

    const performanceCount = weeklyDashboards.reduce(
      (sum, dashboard) => sum + dashboard.performanceCount,
      0,
    );

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
          startDate: new Date(request.startDate),
          endDate: new Date(request.endDate),
        },
      });

    // 8. Dashboard 저장
    const dashboard = await this.prisma.$transaction(
      async (tx) => {
        let dashboard;

        if (existingDashboard) {
          // 기존 Dashboard의 하위 데이터 삭제
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

              startDate: new Date(request.startDate),
              endDate: new Date(request.endDate),

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

        // 공통 하위 데이터 생성
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

              periodStart: new Date(request.startDate),
              periodEnd: new Date(request.endDate),
            };
          }),
        });

        return dashboard;
      });

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
