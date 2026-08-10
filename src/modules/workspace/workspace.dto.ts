import { Example } from "tsoa";

export class CreateWorkspaceRequestDto {
  @Example("개발 워크스페이스")
  name!: string;
}

export class WorkspaceResponseDto {
  @Example("8c2d4f6a-7e91-4b23-a567-123456789abc")
  workspaceId!: string;

  @Example("개발팀 워크스페이스")
  name!: string;

  @Example("false")
  isDefault!: boolean;

  @Example("2026-08-10T06:00:00.000Z")
  createdAt!: Date;

  @Example("2026-08-10T06:00:00.000Z")
  updatedAt!: Date;
}