import { Body, Controller, Delete, Get, Header, Patch, Path, Post, Route, Tags } from 'tsoa';
import { ApiResponseDto, CreateTagRequest, TagResponse, UpdateTagRequest } from './tag.dto';
import { InvalidTagError, TagNotFoundError, TagService, UnauthorizedError } from './tag.service';

@Route('tags')
@Tags('Tags')
export class TagController extends Controller {
  private tagService = new TagService();

  /** @summary 태그 목록 조회 */
  @Get()
  public async getTags(
    @Header('Authorization') authorization: string | undefined,
  ): Promise<ApiResponseDto<TagResponse[] | null>> {
    try {
      const data = await this.tagService.getTags(authorization);
      return {
        success: true,
        statusCode: 200,
        message: '태그 목록 조회 성공',
        data,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 태그 생성 */
  @Post()
  public async createTag(
    @Header('Authorization') authorization: string | undefined,
    @Body() body: CreateTagRequest,
  ): Promise<ApiResponseDto<TagResponse | null>> {
    try {
      const data = await this.tagService.createTag(authorization, body);
      this.setStatus(201);
      return {
        success: true,
        statusCode: 201,
        message: '태그가 생성되었습니다.',
        data,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof InvalidTagError) {
        this.setStatus(400);
        return { success: false, statusCode: 400, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 태그 상세 조회 */
  @Get('{tagId}')
  public async getTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
  ): Promise<ApiResponseDto<TagResponse | null>> {
    try {
      const data = await this.tagService.getTag(authorization, tagId);
      return {
        success: true,
        statusCode: 200,
        message: '태그 상세 조회 성공',
        data,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof TagNotFoundError) {
        this.setStatus(404);
        return { success: false, statusCode: 404, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 태그 수정 */
  @Patch('{tagId}')
  public async updateTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
    @Body() body: UpdateTagRequest,
  ): Promise<ApiResponseDto<TagResponse | null>> {
    try {
      const data = await this.tagService.updateTag(authorization, tagId, body);
      return {
        success: true,
        statusCode: 200,
        message: '태그가 수정되었습니다.',
        data,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof InvalidTagError) {
        this.setStatus(400);
        return { success: false, statusCode: 400, message: err.message, data: null };
      }
      if (err instanceof TagNotFoundError) {
        this.setStatus(404);
        return { success: false, statusCode: 404, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 태그 삭제 */
  @Delete('{tagId}')
  public async deleteTag(
    @Header('Authorization') authorization: string | undefined,
    @Path() tagId: string,
  ): Promise<ApiResponseDto<null>> {
    try {
      await this.tagService.deleteTag(authorization, tagId);
      return {
        success: true,
        statusCode: 200,
        message: '태그가 삭제되었습니다.',
        data: null,
      };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof TagNotFoundError) {
        this.setStatus(404);
        return { success: false, statusCode: 404, message: err.message, data: null };
      }
      throw err;
    }
  }
}