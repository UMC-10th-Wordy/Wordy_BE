import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Route, Tags } from "tsoa";

import { verifyAccessToken } from "../../auth.config.js";
import { success } from "../../common/responses/response.js";
import { SuccessCode } from "../../common/responses/success.code.js";
import { ApiResponse } from "../../common/responses/api.response.js";

import { CreateWorkspaceRequestDto, UpdateWorkspaceRequestDto, WorkspaceResponseDto } from "./workspace.dto.js";
import { WorkspaceRepository } from "./workspace.repository.js";
import { WorkspaceService } from "./workspace.service.js";

@Route("workspaces")
@Tags("Workspace")
export class WorkspaceController extends Controller {
  private readonly workspaceService: WorkspaceService;

  constructor() {
    super();

    this.workspaceService = new WorkspaceService(
      new WorkspaceRepository(),
    );
  }

  /**
   * @summary Workspace 생성
   */
  @Post()
  @Example<ApiResponse<WorkspaceResponseDto>>({
    success: true,
    code: "S200",
    message: "워크스페이스 생성에 성공했습니다.",
    result: {
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      name: "개발 워크스페이스",
      isDefault: false,
      createdAt: new Date("2026-08-10T06:00:00.000Z"),
      updatedAt: new Date("2026-08-10T06:00:00.000Z"),
    },
  })
  public async createWorkspace(
    @Header("Authorization") authorization: string | undefined,
    @Body() request: CreateWorkspaceRequestDto,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const userId = this.getUserId(authorization);

    const result = await this.workspaceService.createWorkspace(
      userId,
      request,
    );

    return success(
      SuccessCode.OK.code,
      "워크스페이스 생성에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary Workspace 목록 조회
   */
  @Get()
  @Example<ApiResponse<WorkspaceResponseDto[]>>({
    success: true,
    code: "S200",
    message: "워크스페이스 조회에 성공했습니다.",
    result: [
      {
        workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
        name: "홍길동의 워크스페이스",
        isDefault: true,
        createdAt: new Date("2026-08-10T06:00:00.000Z"),
        updatedAt: new Date("2026-08-10T06:00:00.000Z"),
      },
      {
        workspaceId: "9d3e5f7b-8f02-4c34-b678-234567890abc",
        name: "개발 워크스페이스",
        isDefault: false,
        createdAt: new Date("2026-08-10T07:00:00.000Z"),
        updatedAt: new Date("2026-08-10T07:00:00.000Z"),
      },
    ],
  })
  public async getWorkspaces(
    @Header("Authorization") authorization: string | undefined,
  ): Promise<ApiResponse<WorkspaceResponseDto[]>> {
    const userId = this.getUserId(authorization);

    const result =
      await this.workspaceService.getWorkspaces(userId);

    return success(
      SuccessCode.OK.code,
      "워크스페이스 조회에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary Workspace 이름 수정
   */
  @Patch("{workspaceId}")
  @Example<ApiResponse<WorkspaceResponseDto>>({
    success: true,
    code: "S200",
    message: "워크스페이스 이름 수정에 성공했습니다.",
    result: {
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      name: "워디 워크스페이스",
      isDefault: false,
      createdAt: new Date("2026-08-10T06:00:00.000Z"),
      updatedAt: new Date("2026-08-10T07:00:00.000Z"),
    },
  })
  public async updateWorkspaceName(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
    @Body() request: UpdateWorkspaceRequestDto,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const userId = this.getUserId(authorization);

    const result = await this.workspaceService.updateWorkspaceName(
      userId,
      workspaceId,
      request.name,
    );

    return success(
      SuccessCode.OK.code,
      "워크스페이스 이름 수정에 성공했습니다.",
      result,
    );
  }

  /**
   * @summary Workspace 삭제
   */
  @Delete("{workspaceId}")
  @Example<ApiResponse<null>>({
    success: true,
    code: "S200",
    message: "워크스페이스 삭제에 성공했습니다.",
    result: null,
  })
  public async deleteWorkspace(
    @Header("Authorization") authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<null>> {
    const userId = this.getUserId(authorization);

    await this.workspaceService.deleteWorkspace(
      userId,
      workspaceId,
    );

    return success(
      SuccessCode.OK.code,
      "워크스페이스 삭제에 성공했습니다.",
      null,
    );
  }

  private getUserId(
    authorization: string | undefined,
  ): string {
    if (!authorization) {
      throw new Error("Authorization header is missing.");
    }

    const token = authorization.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    return payload.userId;
  }
}