import { Example } from "tsoa";

// 날짜 형식은 웬만하면 YYYY-MM-DD (대시보드 모듈과 동일 규칙)


// 1. 나의 요약 (상단 카드 3개)
export class DailyEntriesSummaryResponse {
  @Example({
    count: 15,
    diffFromLastMonth: 3,
  })
  monthlyCount!: MonthlyCountCard; // 이번 달 작성 일지

  @Example({
    currentStreak: 12,
    maxStreak: 21,
  })
  streak!: StreakCard; // 연속 작성

  @Example({
    tagName: "백엔드 개발",
    color: "#4A90E2",
    percentage: 38,
  })
  topCategory!: TopCategoryCard; // 최다 기록 카테고리
}


// 이번 달 작성 일지 카드
export class MonthlyCountCard {
  @Example(15)
  count!: number; // 이번 달 작성 일지 수

  @Example(3)
  diffFromLastMonth!: number; // 지난 달 대비 증감 (양수: 더 씀 / 음수: 덜 씀)
}


// 연속 작성 카드
export class StreakCard {
  @Example(12)
  currentStreak!: number; // 현재 연속 작성 일수 ("12일째")

  @Example(21)
  maxStreak!: number; // 최고 기록 ("최고 기록은 21일이에요")
}


// 최다 기록 카테고리 카드
export class TopCategoryCard {
  @Example("백엔드 개발")
  tagName!: string | null; // 가장 많이 기록한 태그 이름

  @Example("#4A90E2")
  color!: string | null;

  @Example(38)
  percentage!: number; // 전체 중 비중 (%) ("전체의 38%")
}


// 2. 월별 기록 목록 (접힌 상태)
export class MonthlyRecordItem {
  @Example("2026-08")
  yearMonth!: string; // "2026-08"

  @Example(2026)
  year!: number;

  @Example(8)
  month!: number;

  @Example(15)
  totalDays!: number; // 총 N일 기록

  @Example([
    {
      tagName: "백엔드",
      color: "#4A90E2",
    },
  ])
  tags!: TagChip[]; // 대표 태그 (최대 3개)

  @Example("백엔드 관련 업무를 중심으로 15일 기록했습니다.")
  summary!: string | null; // 월 한 줄 요약 (대표 태그 + 기록 일수 기반, 규칙 조합)
}


export class TagChip {
  @Example("백엔드")
  tagName!: string;

  @Example("#4A90E2")
  color!: string | null;
}


// 3. 월별 일자 목록 (월 펼쳤을 때)
export class DailyRecordItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;

  @Example("2026-08-21")
  entryDate!: string; // YYYY-MM-DD

  @Example(21)
  day!: number; // 일 (21)

  @Example([
    {
      tagName: "백엔드",
      color: "#4A90E2",
    },
  ])
  tags!: TagChip[];

  @Example("JWT 인증 기능 구현")
  mainTaskTitle!: string | null; // 대표 업무 제목

  @Example(2)
  extraTaskCount!: number; // "외 N건" 의 N

  @Example("인증 API 개발 및 테스트 진행")
  summary!: string | null; // 하루 한 줄 요약 (reflectionContent 기반)
}


// 4. 일자 상세
export class DailyEntriesDetailResponse {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;

  @Example("2026-08-21")
  entryDate!: string;

  @Example("오늘은 JWT 인증 기능 구현을 완료했다.")
  reflectionContent!: string; // 오늘의 회고

  @Example(2)
  completedCount!: number; // 완료 건수 ("완료 2건")

  @Example(1)
  incompleteCount!: number; // 미완료 건수 ("미완료 1건")

  @Example([
    {
      taskId: "550e8400-e29b-41d4-a716-446655440001",
      tag: {
        tagName: "백엔드",
        color: "#4A90E2",
      },
      title: "JWT 인증 구현",
      memo: "Refresh Token 추가 필요",
      priority: "MUST_DO",
      status: "COMPLETED",
      result: {
        taskResultId: "result-001",
        content: "JWT 인증 API 구현 완료",
        attachments: [],
      },
    },
  ])

  @Example(true)
  converted!: boolean; // 성과 변환 여부 (false면 아직 변환 전, tasks 비어있음)
  
  tasks!: DailyEntriesTaskItem[];
}


export class DailyEntriesTaskItem {
  @Example("550e8400-e29b-41d4-a716-446655440001")
  taskId!: string;

  @Example({
    tagName: "백엔드",
    color: "#4A90E2",
  })
  tag!: TagChip | null;

  @Example("JWT 인증 구현")
  title!: string;

  @Example("Refresh Token 추가 필요")
  memo!: string | null;

  @Example("MUST_DO")
  priority!: string; // MUST_DO | SHOULD_DO | COULD_DO

  @Example("COMPLETED")
  status!: string; // IN_PROGRESS | COMPLETED

  @Example({
    taskResultId: "result-001",
    content: "JWT 인증 API 구현 완료",
    attachments: [],
  })
  result!: TaskResultItem | null; // 업무 결과 (Task당 0..1개)
}


export class TaskResultItem {
  @Example("result-001")
  taskResultId!: string;

  @Example("JWT 인증 API 구현 완료")
  content!: string;

  @Example([
    {
      fileType: "img",
      fileUrl: "https://example.com/image.png",
      fileName: "result.png",
    },
  ])
  attachments!: AttachmentItem[];
}


export class AttachmentItem {
  @Example("img")
  fileType!: string; // file | img

  @Example("https://example.com/image.png")
  fileUrl!: string;

  @Example("result.png")
  fileName!: string;
}


// 5. 검색
export class DailyEntriesSearchResponse {
  @Example("JWT")
  keyword!: string;

  @Example(5)
  entryCount!: number; // "업무 일지" 탭 카운트

  @Example(2)
  tagCount!: number; // "프로젝트 태그" 탭 카운트

  @Example([
    {
      dailyEntryId: "550e8400-e29b-41d4-a716-446655440000",
      entryDate: "2026-08-21",
      tags: [
        {
          tagName: "백엔드",
          color: "#4A90E2",
        },
      ],
      title: "JWT 인증 구현",
    },
  ])
  results!: SearchResultItem[];
}


export class SearchResultItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  dailyEntryId!: string;

  @Example("2026-08-21")
  entryDate!: string;

  @Example([
    {
      tagName: "백엔드",
      color: "#4A90E2",
    },
  ])
  tags!: TagChip[];

  @Example("JWT 인증 구현")
  title!: string | null; // 대표 업무 제목
}