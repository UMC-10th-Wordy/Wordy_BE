import { TagRepository } from './tag.repository';
import { CreateTagRequest, UpdateTagRequest } from './tag.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';
import { verifyAccessToken } from '../../auth.config';

export class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, ErrorCode.UNAUTHORIZED.message);
  }
}

export class TagNotFoundError extends ApiError {
  constructor() {
    super(ErrorCode.NOT_FOUND.status, ErrorCode.NOT_FOUND.code, '태그를 찾을 수 없습니다.');
  }
}

export class InvalidTagError extends ApiError {
  constructor(message: string) {
    super(ErrorCode.BAD_REQUEST.status, ErrorCode.BAD_REQUEST.code, message);
  }
}

export class TagService {
  private tagRepository = new TagRepository();

  private getUserIdFromAuthorization(authorization: string | undefined): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const payload = verifyAccessToken(token);
      return payload.userId;
    } catch {
      throw new UnauthorizedError();
    }
  }

  private validateCreateBody(body: CreateTagRequest): void {
    if (!body.tagName || body.tagName.trim().length === 0) {
      throw new InvalidTagError('태그명을 입력해주세요.');
    }

    if (body.tagName.length > 30) {
      throw new InvalidTagError('태그명은 30자 이하로 입력해주세요.');
    }

    this.validateDateRange(body.expectedStartDate, body.expectedEndDate);
  }

  private validateUpdateBody(body: UpdateTagRequest): void {
    if (body.tagName !== undefined && body.tagName.trim().length === 0) {
      throw new InvalidTagError('태그명을 입력해주세요.');
    }

    if (body.tagName !== undefined && body.tagName.length > 30) {
      throw new InvalidTagError('태그명은 30자 이하로 입력해주세요.');
    }

    this.validateDateRange(body.expectedStartDate, body.expectedEndDate);
  }

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new InvalidTagError('예상 기간의 날짜 형식이 올바르지 않습니다.');
    }

    if (start > end) {
      throw new InvalidTagError('예상 시작일은 예상 종료일보다 늦을 수 없습니다.');
    }
  }

  public async getTags(authorization: string | undefined) {
    const userId = this.getUserIdFromAuthorization(authorization);
    return this.tagRepository.findManyByUserId(userId);
  }

  public async createTag(authorization: string | undefined, body: CreateTagRequest) {
    const userId = this.getUserIdFromAuthorization(authorization);
    this.validateCreateBody(body);

    return this.tagRepository.create(userId, {
      ...body,
      tagName: body.tagName.trim(),
    });
  }

  public async getTag(authorization: string | undefined, tagId: string) {
    const userId = this.getUserIdFromAuthorization(authorization);
    const tag = await this.tagRepository.findActiveByIdAndUserId(tagId, userId);

    if (!tag) throw new TagNotFoundError();

    return tag;
  }

  public async updateTag(authorization: string | undefined, tagId: string, body: UpdateTagRequest) {
    const userId = this.getUserIdFromAuthorization(authorization);
    this.validateUpdateBody(body);

    const tag = await this.tagRepository.findActiveByIdAndUserId(tagId, userId);
    if (!tag) throw new TagNotFoundError();

    return this.tagRepository.update(tagId, {
      ...body,
      ...(body.tagName !== undefined && { tagName: body.tagName.trim() }),
    });
  }

  public async deleteTag(authorization: string | undefined, tagId: string) {
    const userId = this.getUserIdFromAuthorization(authorization);
    const tag = await this.tagRepository.findActiveByIdAndUserId(tagId, userId);

    if (!tag) throw new TagNotFoundError();

    await this.tagRepository.softDelete(tagId);
  }
}