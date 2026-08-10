import { Example } from 'tsoa';

export class CreateTagRequest {
  @Example('Wordy')
  tagName!: string;

  @Example('#4F46E5')
  color?: string;

  @Example('Wordy 프로젝트')
  projectName?: string;

  @Example('AI 기반 업무 관리 서비스 개발')
  projectPurpose?: string;

  @Example('사용자가 업무 성과를 체계적으로 관리할 수 있음')
  expectedOutcome?: string;

  @Example('2026-07-01')
  expectedStartDate?: string;

  @Example('2026-12-31')
  expectedEndDate?: string;

  @Example([
    {
      name: 'AI 기능 개발 완료율',
      target: '100%',
    },
  ])
  kpis?: unknown;
}


export class UpdateTagRequest {
  @Example('Wordy Backend')
  tagName?: string;

  @Example('#22C55E')
  color?: string;

  @Example('Wordy 프로젝트')
  projectName?: string;

  @Example('AI 업무 관리 시스템 개선')
  projectPurpose?: string;

  @Example('서비스 안정성 향상')
  expectedOutcome?: string;

  @Example('2026-07-15')
  expectedStartDate?: string;

  @Example('2026-12-31')
  expectedEndDate?: string;

  @Example([
    {
      name: 'API 응답 속도',
      target: '200ms 이하',
    },
  ])
  kpis?: unknown;
}


export class TagResponse {
  @Example('7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2')
  tagId!: string;

  @Example('Wordy')
  tagName!: string;

  @Example('#4F46E5')
  color!: string | null;

  @Example('Wordy 프로젝트')
  projectName!: string | null;

  @Example('AI 기반 업무 관리 서비스 개발')
  projectPurpose!: string | null;

  @Example('사용자가 업무 성과를 관리하고 성장 흐름을 확인')
  expectedOutcome!: string | null;

  @Example(new Date('2026-07-01'))
  expectedStartDate!: Date | null;

  @Example(new Date('2026-12-31'))
  expectedEndDate!: Date | null;

  @Example([
    {
      name: 'AI 기능 개발 완료율',
      target: '100%',
    },
  ])
  kpis!: unknown;

  @Example(new Date('2026-07-01T09:00:00.000Z'))
  createdAt!: Date;

  @Example(new Date('2026-07-21T10:00:00.000Z'))
  updatedAt!: Date;

  @Example(null)
  deletedAt!: Date | null;

  @Example('5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a')
  userId!: string;
}