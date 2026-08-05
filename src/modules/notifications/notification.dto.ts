import { Example } from "tsoa";

export enum NotificationType {
  MARKETING_PROMOTION = "MARKETING_PROMOTION",
  DASHBOARD_COMPLETED = "DASHBOARD_COMPLETED",
  DASHBOARD_INDUCE = "DASHBOARD_INDUCE",
}

export class NotificationItem {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  notificationId!: string;

  @Example(NotificationType.DASHBOARD_COMPLETED)
  type!: NotificationType;

  @Example("성과 대시보드가 완성됐어요")
  title!: string;

  @Example("이번 주 성과 리포트를 확인해보세요.")
  content!: string;

  @Example("/dashboard/weekly/550e8400-e29b-41d4-a716-446655440000")
  redirectUrl!: string | null;

  @Example(false)
  isRead!: boolean;

  @Example("2026-08-04T09:00:00.000Z")
  createdAt!: Date;
}

export class MarkNotificationReadResponse {
  @Example("550e8400-e29b-41d4-a716-446655440000")
  notificationId!: string;

  @Example(true)
  isRead!: boolean;

  @Example("/dashboard/weekly/550e8400-e29b-41d4-a716-446655440000")
  redirectUrl!: string | null;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  redirectUrl?: string;
}