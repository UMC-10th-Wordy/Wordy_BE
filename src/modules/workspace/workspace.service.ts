import { ApiError } from "../../common/errors/api.error.js";
import { ErrorCode } from "../../common/errors/error.code.js";
import { CreateWorkspaceRequestDto, WorkspaceResponseDto } from "./workspace.dto.js";

import { WorkspaceRepository } from "./workspace.repository.js";

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

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
    );

    return this.toResponseDto(workspace);
  }

  async getWorkspaces(
    userId: string,
  ): Promise<WorkspaceResponseDto[]> {
    const workspaces =
      await this.workspaceRepository.findAllByUserId(userId);

    return workspaces.map((workspace) =>
      this.toResponseDto(workspace),
    );
  }

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
      createdAt: Date;
      updatedAt: Date;
    },
  ): WorkspaceResponseDto {
    return {
      workspaceId: workspace.workspaceId,
      name: workspace.name,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}