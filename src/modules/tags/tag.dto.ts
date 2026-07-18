export interface CreateTagRequest {
  tagName: string;
  color?: string;
  projectName?: string;
  projectPurpose?: string;
  expectedOutcome?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  kpis?: unknown;
}

export interface UpdateTagRequest {
  tagName?: string;
  color?: string;
  projectName?: string;
  projectPurpose?: string;
  expectedOutcome?: string;
  expectedStartDate?: string;
  expectedEndDate?: string;
  kpis?: unknown;
}

export interface TagResponse {
  tagId: string;
  tagName: string;
  color: string | null;
  projectName: string | null;
  projectPurpose: string | null;
  expectedOutcome: string | null;
  expectedStartDate: Date | null;
  expectedEndDate: Date | null;
  kpis: unknown;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
}