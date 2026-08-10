import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Route, Tags } from 'tsoa';
import { CreateTagRequest, TagResponse, UpdateTagRequest } from './tag.dto.js';
import { TagService } from './tag.service.js';
import { ApiResponse } from '../../common/responses/api.response.js';
import { success } from '../../common/responses/response.js';
import { SuccessCode } from '../../common/responses/success.code.js';

@Route('workspaces/{workspaceId}/tags')
@Tags('Tags')
export class TagController extends Controller {
  private tagService = new TagService();

  /**
   * @summary 태그 목록 조회
   */
  @Get()
  @Example<ApiResponse<TagResponse[]>>({
    success: true,
    code: "S200",
    message: "태그 목록 조회 성공",
    result: [
      {
        tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
        workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
        tagName: "Wordy",
        color: "#4F46E5",
        projectName: "Wordy 프로젝트",
        projectPurpose: "AI 기반 업무 관리 서비스 개발",
        expectedOutcome: "사용자가 업무 성과를 체계적으로 관리",
        expectedStartDate: new Date("2026-07-01"),
        expectedEndDate: new Date("2026-12-31"),
        kpis: [
          {
            name: "AI 기능 개발 완료율",
            target: "100%",
          },
        ],
        createdAt: new Date("2026-07-01T09:00:00.000Z"),
        updatedAt: new Date("2026-07-21T10:00:00.000Z"),
        deletedAt: null,
        userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
      },
    ],
  })
  public async getTags(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
  ): Promise<ApiResponse<TagResponse[]>> {
    const data = await this.tagService.getTags(authorization, workspaceId);
    return success(SuccessCode.OK.code, '태그 목록 조회 성공', data);
  }

  /**
   * @summary 태그 생성
   */
  @Post()
  @Example<ApiResponse<TagResponse>>({
    success: true,
    code: "S201",
    message: "태그가 생성되었습니다.",
    result: {
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      tagName: "Wordy",
      color: "#4F46E5",
      projectName: "Wordy 프로젝트",
      projectPurpose: "AI 업무 관리 서비스 개발",
      expectedOutcome: "업무 성과 관리",
      expectedStartDate: new Date("2026-07-01"),
      expectedEndDate: new Date("2026-12-31"),
      kpis: [],
      createdAt: new Date("2026-07-01T09:00:00.000Z"),
      updatedAt: new Date("2026-07-01T09:00:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
    },
  })
  public async createTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
    @Body() body: CreateTagRequest,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.createTag(authorization, workspaceId, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, '태그가 생성되었습니다.', data);
  }

  /**
   * @summary 태그 상세 조회
   */
  @Get('{tagId}')
  @Example<ApiResponse<TagResponse>>({
    success: true,
    code: "S200",
    message: "태그 상세 조회 성공",
    result: {
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      tagName: "Wordy",
      color: "#4F46E5",
      projectName: "Wordy 프로젝트",
      projectPurpose: "AI 기반 업무 관리 서비스 개발",
      expectedOutcome: "사용자가 업무 성과를 체계적으로 관리할 수 있음",
      expectedStartDate: new Date("2026-07-01"),
      expectedEndDate: new Date("2026-12-31"),
      kpis: [
        {
          name: "AI 기능 개발 완료율",
          target: "100%",
        },
      ],
      createdAt: new Date("2026-07-01T09:00:00.000Z"),
      updatedAt: new Date("2026-07-21T10:00:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
    },
  })
  public async getTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() tagId: string,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.getTag(authorization, workspaceId, tagId);
    return success(SuccessCode.OK.code, '태그 상세 조회 성공', data);
  }

  /**
   * @summary 태그 수정
   */
  @Patch('{tagId}')
  @Example<ApiResponse<TagResponse>>({
    success: true,
    code: "S200",
    message: "태그가 수정되었습니다.",
    result: {
      tagId: "7f7d2c74-9d8d-4b48-9c44-7d1b63f2f9b2",
      workspaceId: "8c2d4f6a-7e91-4b23-a567-123456789abc",
      tagName: "Wordy Backend",
      color: "#22C55E",
      projectName: "Wordy 프로젝트",
      projectPurpose: "AI 업무 관리 시스템 개선",
      expectedOutcome: "서비스 안정성 향상",
      expectedStartDate: new Date("2026-07-15"),
      expectedEndDate: new Date("2026-12-31"),
      kpis: [
        {
          name: "API 응답 속도",
          target: "200ms 이하",
        },
      ],
      createdAt: new Date("2026-07-01T09:00:00.000Z"),
      updatedAt: new Date("2026-07-22T10:00:00.000Z"),
      deletedAt: null,
      userId: "5d90d6f3-ef0d-4ef2-9d77-f7a67b2b2d2a",
    },
  })
  public async updateTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() tagId: string,
    @Body() body: UpdateTagRequest,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.updateTag(authorization, workspaceId, tagId, body);
    return success(SuccessCode.UPDATED.code, '태그가 수정되었습니다.', data);
  }

  /**
   * @summary 태그 삭제
   */
  @Delete('{tagId}')
  @Example<ApiResponse<null>>({
    success: true,
    code: "S200",
    message: "태그가 삭제되었습니다.",
    result: null,
  })
  public async deleteTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() workspaceId: string,
    @Path() tagId: string,
  ): Promise<ApiResponse<null>> {
    await this.tagService.deleteTag(authorization, workspaceId, tagId);
    return success(SuccessCode.DELETED.code, '태그가 삭제되었습니다.', null);
  }
}