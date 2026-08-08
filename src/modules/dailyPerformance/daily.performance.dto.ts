import { Example } from "tsoa";
import { Prisma, ReflectionSnapshotStatus } from "../../generated/prisma/client.js";
import { PromptBOutputDto } from "../ai/performance/dto/prompt/prompt.b.output.dto.js";

export class CreateDailyPerformanceRequestDto {
  @Example("8c2d4f6a-7e91-4b23-a567-123456789abc",)
  reflectionSnapshotId!: string;

  @Example("오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.",)
  summary!: string;

  @Example([
    "업무 데이터를 구조화하는 능력이 향상되었습니다.",
    "AI 결과를 서비스 데이터로 연결하는 경험을 쌓았습니다.",
  ])
  growthInsights!: string[];
}

export class CreateDailyPerformanceResponseDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",)
  dailyPerformanceId!: string;
}

export class PerformanceListItemDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",)
  dailyPerformanceId!: string;

  @Example(80)
  achievementRate!: number;

  @Example("오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.",)
  summary!: string;

  @Example(new Date())
  createdAt!: Date;
}

export class PerformanceListResponseDto {
  @Example([
    {
      dailyPerformanceId:
        "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
      achievementRate: 80,
      summary:
        "오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.",
      createdAt: new Date(),
    },
  ])
  performances!: PerformanceListItemDto[];
}

export class IncompleteTaskDto {
  @Example("a1b2c3d4-e5f6-7890-abcd-123456789012")
  taskId!: string;

  @Example({
    tagName: "개발",
    color: "#4A90E2",
  })
  tag!: TagInfoDto | null;

  @Example("AI 프롬프트 개선")
  title!: string;
}

export class TagInfoDto {
  @Example("개발")
  tagName!: string;

  @Example("#4A90E2")
  color!: string | null;
}

export class PerformanceTaskDto {
  @Example("a1b2c3d4-e5f6-7890-abcd-123456789012",)
  taskId!: string;

  @Example({
    tagName: "개발",
    color: "#4A90E2",
  })
  tag!: TagInfoDto | null;

  @Example("성과 변환 API 구현")
  title!: string;

  @Example([
    "AI 결과 저장 구조 구현",
    "성과 데이터 조회 API 구현",
  ])
  output!: string[];

  @Example([
    "사용자가 업무 성과를 확인할 수 있도록 개선",
  ])
  impact?: string[];

  @Example("내용이 충분하지 않아 성과를 정리하지 못했어요.",)
  message?: string;
}

export class PerformanceDetailResponseDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",)
  dailyPerformanceId!: string;

  @Example(80)
  achievementRate!: number;

  @Example(5)
  totalTaskCount!: number;

  @Example(4)
  completedTaskCount!: number;

  @Example([
    {
      taskId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
      tag: {
        tagName: "개발",
        color:"#4A90E2",
      },
      title: "AI 프롬프트 개선",
    },
  ])
  incompleteTasks!: IncompleteTaskDto[];

  @Example("오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.",)
  summary!: string;

  @Example([
    "업무 데이터를 구조화하는 능력이 향상되었습니다.",
  ])
  growthInsights!: string[];

  @Example([
    "프롬프트 정확도 개선하기",
    "성과 분석 자동화 고도화하기",
  ])
  nextActions!: string[];

  @Example([
    {
      taskId:
        "a1b2c3d4-e5f6-7890-abcd-123456789012",
      tag: "개발",
      title: "성과 변환 API 구현",
      output: [
        "AI 결과 저장 구조 구현",
      ],
      impact: [
        "성과 데이터 활용성 향상",
      ],
    },
  ])
  taskPerformances!: PerformanceTaskDto[];

  @Example(new Date())
  createdAt!: Date;
}

export class DailyPerformancePreviewResponseDto {
  @Example(false)
  exists!: boolean;

  @Example({
    dailyPerformanceId: "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
    achievementRate: 80,
    summary: "AI 업무 변환 기능을 구현했습니다.",
  })
  performance?: PerformanceDetailResponseDto;
}

export class UpdateDailyPerformanceRequestDto {
  @Example("오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.")
  summary!: string;

  @Example([
    "업무 데이터를 구조화하는 능력이 향상되었습니다.",
    "AI 결과를 서비스 데이터로 연결하는 경험을 쌓았습니다.",
  ])
  growthInsights!: string[];
}

export class UpdateDailyPerformanceResponseDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  dailyPerformanceId!: string;
}

export class ReflectionTaskResultSnapshotDto {
  @Example("a1b2c3d4-e5f6-7890-abcd-123456789012")
  reflectionTaskResultSnapshotId!: string;

  @Example("b1c2d3e4-f5a6-7890-abcd-123456789012")
  taskResultId!: string;

  @Example("AI 결과 저장 구조 구현")
  content!: string;
}


export class ReflectionTaskSnapshotDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  reflectionTaskSnapshotId!: string;

  @Example("a1b2c3d4-e5f6-7890-abcd-123456789012")
  taskId!: string;

  @Example("성과 변환 API 구현")
  title!: string;

  @Example("HIGH")
  priority!: string;

  @Example("AI 성과 변환 관련 작업")
  memo!: string | null;

  @Example("COMPLETED")
  status!: string;

  @Example(new Date())
  completedAt!: Date | null;

  @Example({
    tagName: "개발",
    color: "#4A90E2",
  })
  tag!: TagInfoDto | null;

  @Example([
    {
      reflectionTaskResultSnapshotId:
        "a1b2c3d4-e5f6-7890-abcd-123456789012",
      taskResultId:
        "b1c2d3e4-f5a6-7890-abcd-123456789012",
      content:
        "API 구현 완료",
    },
  ])
  results!: ReflectionTaskResultSnapshotDto[];
}


export class ReflectionSnapshotPreviewResponseDto {
  @Example("f3a1e4c2-31b5-46f4-b134-a0e238a1ad01")
  reflectionSnapshotId!: string;

  @Example("PROCESSING")
  status!: ReflectionSnapshotStatus;

  @Example({
    summary:
      "오늘 AI 업무 변환 기능과 성과 저장 API를 구현했습니다.",
    growthInsights: [
      "업무 데이터를 구조화하는 능력이 향상되었습니다.",
    ],
    nextActions: [
      "프롬프트 정확도 개선하기",
    ],
    taskPerformances: [],
  })
  promptBResult!: PromptBOutputDto | null;


  @Example([
    {
      reflectionTaskSnapshotId:
        "f3a1e4c2-31b5-46f4-b134-a0e238a1ad01",
      taskId:
        "a1b2c3d4-e5f6-7890-abcd-123456789012",
      title:
        "성과 변환 API 구현",
      priority:
        "HIGH",
      memo:
        "백엔드 작업",
      status:
        "COMPLETED",
      completedAt:
        new Date(),
      tag:{
        tagName:"개발",
        color:"#4A90E2",
      },
      results:[],
    },
  ])
  tasks!: ReflectionTaskSnapshotDto[];
}