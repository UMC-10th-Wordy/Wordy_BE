import { randomUUID } from 'crypto';
import { verifyAccessToken } from '../../auth.config.js';
import { UsersRepository } from './users.repository.js';
import { CompleteProfileRequest, ProfileImageData, UserProfileData, YearsOfService, JobRole } from './users.dto.js';
import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';
import { uploadToGcs } from '../../common/storage/gcs.storage.js';

const PROFILE_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, '인증이 필요합니다.');
  }
}

export class UserNotFoundError extends ApiError {
  constructor() {
    super(ErrorCode.NOT_FOUND.status, ErrorCode.NOT_FOUND.code, '사용자 프로필을 찾을 수 없습니다.');
  }
}

export class InvalidImageTypeError extends ApiError {
  constructor() {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      '지원하지 않는 이미지 형식입니다. (jpg, png, webp, gif만 가능)'
    );
  }
}

export class InvalidUserNameError extends ApiError {
  constructor() {
    super(ErrorCode.BAD_REQUEST.status, ErrorCode.BAD_REQUEST.code, '닉네임은 5자 이하로 입력해주세요.');
  }
}

export class UsersService {
  private usersRepository = new UsersRepository();

  /**
   * Authorization 헤더의 액세스 토큰에서 유저 ID를 추출
   */
  private extractUserId(authorization: string | undefined): string {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) throw new UnauthorizedError();

    try {
      return verifyAccessToken(token).userId;
    } catch {
      throw new UnauthorizedError();
    }
  }

  /**
   * 프로필 등록
   */
  public async completeProfile(authorization: string | undefined, body: CompleteProfileRequest): Promise<{ userId: string; email: string }> {
    const userId = this.extractUserId(authorization);
    if (body.userName.length > 5) throw new InvalidUserNameError();

    const profile = await this.usersRepository.upsertProfile(userId, body);
    return { userId: profile.userId, email: profile.user.email };
  }

  /**
   * 프로필 이미지 업로드
   * - 프로필이 이미 등록된 경우 바로 반영, 등록 전이면 URL만 반환 (프로필 등록 시 profileImgUrl로 함께 전달)
   */
  public async uploadProfileImage(authorization: string | undefined, file: Express.Multer.File): Promise<ProfileImageData> {
    const userId = this.extractUserId(authorization);

    const extension = PROFILE_IMAGE_EXTENSIONS[file.mimetype];
    if (!extension) throw new InvalidImageTypeError();

    const fileName = `${randomUUID()}.${extension}`;
    const profileImgUrl = await uploadToGcs(file.buffer, `profile/${fileName}`, file.mimetype);

    const user = await this.usersRepository.findById(userId);
    if (user?.profile) {
      await this.usersRepository.updateProfileImage(userId, profileImgUrl);
    }

    return { profileImgUrl };
  }

  /**
   * 유저 프로필 조회
   * - DB에서 조회된 유저 정보를 DTO 형식으로 변환하여 반환
   */
  public async getProfile(authorization: string | undefined): Promise<UserProfileData> {
    const userId = this.extractUserId(authorization);

    const user = await this.usersRepository.findById(userId);
    // 유저가 없을 경우 404 에러 던지기
    if (!user) throw new UserNotFoundError();

    return {
      userId: user.userId,
      email: user.email,
      userName: user.profile?.userName ?? null,
      profileImgUrl: user.profile?.profileImgUrl ?? null,
      yearsOfService: (user.profile?.yearsOfService as unknown as YearsOfService) ?? null,
      jobRole: (user.profile?.jobRole as unknown as JobRole) ?? null,
      createdAt: user.createdAt,
    };
  }
}