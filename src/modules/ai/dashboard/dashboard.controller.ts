console.log("dashboard.controller.ts loaded");

import { Body, Controller, Example, Post, Route, Tags } from "tsoa";

import { prisma } from "../../../common/prisma/prisma.client";
import { LlmClient } from "../common/llm.client";
import { PromptManager } from "../common/prompt.manager";
import { ResponseParser } from "../common/response.parser";
import { RuleEngine } from "../common/rule.engine";

import { DashboardRequestDto } from "./dto/api/dashboard.request.dto";
import { DashboardResponseDto } from "./dto/api/dashboard.response.dto";
import { DashboardService } from "./dashboard.service";

@Route("ai")
@Tags("AI")
export class DashboardAiController extends Controller {
  private readonly dashboardService: DashboardService;

  constructor() {
    super();
    this.dashboardService = new DashboardService(
      new LlmClient(),
      new PromptManager(),
      new ResponseParser(),
      new RuleEngine(),
      prisma,
    );
  }
  
  /**
   * @summary 주간 대시보드 생성
   */
  @Post("dashboard/weekly")
  @Example<DashboardResponseDto>({
    dashboardId:"dashboard-weekly-001",
    startDate:"2026-07-07",
    endDate:"2026-07-13",

    summary: "이번 주에는 AI 성과 분석 기능과 Swagger 문서화를 완료했습니다.",
    journalDays:7,
    performanceCount:12,
    tagCount:3,
    kpis:[
      {
        kpiName:"Swagger API 문서 작성",
        progress:"100%",
      },
      {
        kpiName:"AI 기능 구현",
        progress:"80%",
      }
    ],

    tagAnalyses:[
      {
        tagName:"AI 기능 구현",
        objective: "업무 성과를 분석하고 시각화하는 AI 기능 개발",
        expectedOutcome: "사용자가 자신의 업무 성과를 확인할 수 있음",
        achievementStatus:"COMPLETED",
        insight:
          "AI 기반 업무 분석 기능을 구현하고 성과 정리를 완료했습니다.",
      }
    ],
  })
  public async createDashboard(
    @Body() request: DashboardRequestDto,
  ): Promise<DashboardResponseDto> {
    console.log("컨트롤러 진입");
    return this.dashboardService.generateWeeklyDashboard(
      request,
    );
  }

  /**
   * @summary 월간 대시보드 생성
   */
  @Post("dashboard/monthly")
  @Example<DashboardResponseDto>({
    dashboardId:"dashboard-monthly-001",
    startDate:"2026-07-01",
    endDate:"2026-07-31",
    summary:"이번 달에는 AI 기능 개발과 업무 관리 시스템 개선을 중심으로 성장했습니다.",
    journalDays:20,
    performanceCount:4,
    tagCount:2,
    kpis:[
      {
        kpiName:"AI 기능 개발 완료율",
        progress:"90%",
      },
      {
        kpiName:"주간 회고 작성률",
        progress:"100%",
      }
    ],
    tagAnalyses:[
      {
        tagName:"AI 개발",
        objective:"AI 기반 업무 분석 시스템 구축",
        expectedOutcome:"사용자가 업무 성과를 정리하고 확인할 수 있음",
        achievementStatus:"달성",
        insight:"주간 성과 데이터를 기반으로 월간 성장 흐름을 분석했습니다.",
      },
      {
        tagName:"백엔드 개발",
        objective:"안정적인 API 구조 설계",
        expectedOutcome:"서비스의 원활한 API 연동",
        achievementStatus:"IN_PROGRESS",
        insight:"API 구조 개선과 코드 안정화 작업을 진행했습니다.",
      }
    ]
  })
  public async createMonthlyDashboard(
    @Body() request:DashboardRequestDto,
  ):Promise<DashboardResponseDto>{
    return this.dashboardService.generateMonthlyDashboard(
      request,
    );
  }
}