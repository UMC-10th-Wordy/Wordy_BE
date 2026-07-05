import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../../auth.config';
import { UsersRepository } from './users.repository';
import { CompleteProfileRequest, UserProfileData, YearsOfService, JobRole } from './users.dto';

export class UnauthorizedError extends Error {
  constructor() {
    super('인증이 필요합니다.');
    this.name = 'UnauthorizedError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('사용자 프로필을 찾을 수 없습니다.');
    this.name = 'UserNotFoundError';
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