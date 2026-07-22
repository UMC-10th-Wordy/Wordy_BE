// 날짜 형식은 웬만하면 YYYY-MM-DD (대시보드 모듈과 동일 규칙)

// ============================================================
// 1) 나의 요약 (상단 카드 3개)
// ============================================================
export interface DailyEntriesSummaryResponse {
  monthlyCount: MonthlyCountCard; // 이번 달 작성 일지
  streak: StreakCard;             // 연속 작성
  topCategory: TopCategoryCard;   // 최다 기록 카테고리
}

// 이번 달 작성 일지 카드
export interface MonthlyCountCard {
  count: number;             // 이번 달 작성 일지 수
  diffFromLastMonth: number; // 지난 달 대비 증감 (양수: 더 씀 / 음수: 덜 씀)
}

// 연속 작성 카드
export interface StreakCard {
  currentStreak: number; // 현재 연속 작성 일수 ("12일째")
  maxStreak: number;     // 최고 기록 ("최고 기록은 21일이에요")
}

// 최다 기록 카테고리 카드
export interface TopCategoryCard {
  tagName: string | null; // 가장 많이 기록한 태그 이름
  color: string | null;
  percentage: number;     // 전체 중 비중 (%) ("전체의 38%")
}

// ============================================================
// 2) 월별 기록 목록 (접힌 상태)
// ============================================================
export interface MonthlyRecordItem {
  yearMonth: string;      // "2026-08"
  year: number;
  month: number;
  totalDays: number;      // 총 N일 기록
  tags: TagChip[];        // 대표 태그 (최대 3개)
  summary: string | null; // 월 한 줄 요약 (대표 태그 + 기록 일수 기반, 규칙 조합)
}

export interface TagChip {
  tagName: string;
  color: string | null;
}

// ============================================================
// 3) 월별 일자 목록 (월 펼쳤을 때)
// ============================================================
export interface DailyRecordItem {
  dailyEntryId: string;
  entryDate: string;            // YYYY-MM-DD
  day: number;                  // 일 (21)
  tags: TagChip[];
  mainTaskTitle: string | null; // 대표 업무 제목
  extraTaskCount: number;       // "외 N건" 의 N
  summary: string | null;       // 하루 한 줄 요약 (reflectionContent 기반)
}

// ============================================================
// 4) 일자 상세
// ============================================================
export interface DailyEntriesDetailResponse {
  dailyEntryId: string;
  entryDate: string;
  reflectionContent: string;  // 오늘의 회고
  completedCount: number;     // 완료 건수 ("완료 2건")
  incompleteCount: number;    // 미완료 건수 ("미완료 1건")
  tasks: DailyEntriesTaskItem[];
}

export interface DailyEntriesTaskItem {
  taskId: string;
  tag: TagChip | null;
  title: string;
  memo: string | null;
  priority: string;             // MUST_DO | SHOULD_DO | COULD_DO
  status: string;               // IN_PROGRESS | COMPLETED
  result: TaskResultItem | null; // 업무 결과 (Task당 0..1개)
}

export interface TaskResultItem {
  taskResultId: string;
  content: string;
  attachments: AttachmentItem[];
}

export interface AttachmentItem {
  fileType: string; // file | img
  fileUrl: string;
  fileName: string;
}

// ============================================================
// 5) 검색
// ============================================================
export interface DailyEntriesSearchResponse {
  keyword: string;
  entryCount: number;         // "업무 일지" 탭 카운트
  tagCount: number;             // "프로젝트 태그" 탭 카운트
  results: SearchResultItem[];
}

export interface SearchResultItem {
  dailyEntryId: string;
  entryDate: string;
  tags: TagChip[];
  title: string | null; // 대표 업무 제목
}