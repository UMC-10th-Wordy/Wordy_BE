import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { CreateWorkspaceRequestDto, WorkspaceResponseDto } from "./workspace.dto.js";

import { WorkspaceRepository } from "./workspace.repository.js";

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  // 기본 생성
  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    const workspaceCount =
      await this.workspaceRepository.countByUserId(userId);

    if (workspaceCount >= 2) {
      throw new ApiError(
        ErrorCode.CONFLICT.status,
        ErrorCode.CONFLICT.code,
        "워크스페이스는 최대 2개까지 생성할 수 있습니다.",
      );
    }

    const workspace = await this.workspaceRepository.create(
      userId,
      dto.name,
      false,
    );

    return this.toResponseDto(workspace);
  }  

  // 프로필 최초 등록 시 기본 Workspace 생성
  async createDefaultWorkspace(
    userId: string,
    userName: string,
  ): Promise<WorkspaceResponseDto> {
    const existingDefault =
      await this.workspaceRepository.findDefaultByUserId(userId);

    if (existingDefault) {
      return this.toResponseDto(existingDefault);
    }

    const workspace = await this.workspaceRepository.create(
      userId,
      `${userName}의 워크스페이스`,
      true,
    );

    return this.toResponseDto(workspace);
  }

  // 목록 조회
  async getWorkspaces(
    userId: string,
  ): Promise<WorkspaceResponseDto[]> {
    const workspaces =
      await this.workspaceRepository.findAllByUserId(userId);

    return workspaces.map((workspace) =>
      this.toResponseDto(workspace),
    );
  }

  // 프로필 닉네임 변경 시 기본 Workspace 이름 변경
  async updateDefaultWorkspaceName(
    userId: string,
    userName: string,
  ): Promise<void> {
    const workspace =
      await this.workspaceRepository.findDefaultByUserId(userId);

    if (!workspace) {
      return;
    }

    await this.workspaceRepository.updateName(
      workspace.workspaceId,
      userId,
      `${userName}의 워크스페이스`,
    );
  }


  // 삭제
  async deleteWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const workspace =
      await this.workspaceRepository.findByIdAndUserId(
        workspaceId,
        userId,
      );

    if (!workspace) {
      throw new ApiError(
        ErrorCode.NOT_FOUND.status,
        ErrorCode.NOT_FOUND.code,
        "워크스페이스를 찾을 수 없습니다.",
      );
    }

    await this.workspaceRepository.softDelete(
      workspaceId,
      userId,
    );
  }

  private toResponseDto(
    workspace: {
      workspaceId: string;
      name: string;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
  ): WorkspaceResponseDto {
    return {
      workspaceId: workspace.workspaceId,
      name: workspace.name,
      isDefault: workspace.isDefault,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}