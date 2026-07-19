import { Body, Controller, Delete, Get, Header, Patch, Path, Post, Route, Tags } from 'tsoa';
import { CreateTagRequest, TagResponse, UpdateTagRequest } from './tag.dto';
import { TagService } from './tag.service';
import { ApiResponse } from '../../common/responses/api.response';
import { success } from '../../common/responses/response';
import { SuccessCode } from '../../common/responses/success.code';

@Route('tags')
@Tags('Tags')
export class TagController extends Controller {
  private tagService = new TagService();

  /** @summary 태그 목록 조회 */
  @Get()
  public async getTags(
    @Header('Authorization') authorization: string | undefined,
  ): Promise<ApiResponse<TagResponse[]>> {
    const data = await this.tagService.getTags(authorization);
    return success(SuccessCode.OK.code, '태그 목록 조회 성공', data);
  }

  /** @summary 태그 생성 */
  @Post()
  public async createTag(
    @Header('Authorization') authorization: string | undefined,
    @Body() body: CreateTagRequest,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.createTag(authorization, body);
    this.setStatus(201);
    return success(SuccessCode.CREATED.code, '태그가 생성되었습니다.', data);
  }

  /** @summary 태그 상세 조회 */
  @Get('{tagId}')
  public async getTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.getTag(authorization, tagId);
    return success(SuccessCode.OK.code, '태그 상세 조회 성공', data);
  }

  /** @summary 태그 수정 */
  @Patch('{tagId}')
  public async updateTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
    @Body() body: UpdateTagRequest,
  ): Promise<ApiResponse<TagResponse>> {
    const data = await this.tagService.updateTag(authorization, tagId, body);
    return success(SuccessCode.UPDATED.code, '태그가 수정되었습니다.', data);
  }

  /** @summary 태그 삭제 */
  @Delete('{tagId}')
  public async deleteTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
  ): Promise<ApiResponse<null>> {
    await this.tagService.deleteTag(authorization, tagId);
    return success(SuccessCode.DELETED.code, '태그가 삭제되었습니다.', null);
  }
}