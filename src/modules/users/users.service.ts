import { verifyAccessToken } from '../../auth.config';
import { UsersRepository } from './users.repository';
import { CompleteProfileRequest, UserProfileData, YearsOfService, JobRole } from './users.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';

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
    const profile = await this.usersRepository.upsertProfile(userId, body);
    return { userId: profile.userId, email: profile.user.email };
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