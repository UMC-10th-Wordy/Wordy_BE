// /**
//  * 알림 생성 샘플.
//  */
//
// import { createNotification } from "./notification.service.js";
// import { NotificationType } from "./notification.dto.js";
//
// type ReportUnit = "MONTH" | "WEEK";
//
// const unitLabel = (unit: ReportUnit) => (unit === "MONTH" ? "월간" : "주간");
// /**
//  * 성과 리포트 발행 완료 알림
//  * (시안 예: "6월의 성과 리포트 발행 완료! 🎉")
//  *
//  * @param periodLabel 리포트 기간 표기. 예: "6월", "6월 3주차"
//  * @param unit 월간/주간 리포트 여부
//  * @param redirectUrl 클릭 시 이동할 프론트 경로 (발행된 리포트 상세 URL)
//  * userId, title, content, redirectUrl 로 createNotification 함수 사용하면 됨.
//  */
// export const sample = async (
//   userId: string,
//   periodLabel: string,
//   unit: ReportUnit,
//   redirectUrl: string
// ) => {
//   await createNotification({
//     userId,
//     type: NotificationType.DASHBOARD_COMPLETED,
//     title: `${periodLabel}의 성과 리포트 발행 완료`,
//     content: `회원님의 ${unitLabel(unit)} 성과 리포트가 발행되었어요.\n[성과 대시보드]에서 확인해 주세요`,
//     redirectUrl,
//   });
// };
