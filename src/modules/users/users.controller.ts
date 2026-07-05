import { Controller, Post, Get, Route, Tags, Body, Header, Example, Response } from 'tsoa';
import { UsersService, UnauthorizedError, UserNotFoundError } from './users.service';
import { CompleteProfileRequest, UserProfileData, YearsOfService, JobRole } from './users.dto';
import { AuthResponseDto } from '../auth/auth.dto';

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
  private usersService = new UsersService();

  /**
   * 프로필 등록 - 이메일 인증 후 발급된 액세스 토큰으로 인증
   * @summary 프로필 등록
   */
  @Post('profile')
  public async completeProfile(
    @Header('Authorization') authorization: string | undefined,
    @Body() body: CompleteProfileRequest,
  ): Promise<AuthResponseDto<{ userId: string; email: string } | null>> {
    try {
      const data = await this.usersService.completeProfile(authorization, body);
      this.setStatus(201);
      return {
        success: true,
        statusCode: 201,
        message: '프로필 등록이 완료되었습니다.',
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

  /**
   * JWT 토큰의 사용자 ID를 기준으로 내 프로필 정보 조회
   *
   * @summary 내 프로필 조회
   */
  @Get('profile')
  @Example<AuthResponseDto<UserProfileData>>({
    success: true,
    statusCode: 200,
    message: '프로필 조회 성공',
    data: {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      email: 'hong@example.com',
      userName: '홍길동',
      profileImgUrl: 'https://example.com/profile/honggildong.jpg',
      yearsOfService: YearsOfService.ONE_TO_3,
      jobRole: JobRole.DEVELOPMENT,
      createdAt: new Date('2026-06-20T16:00:00.000Z'),
    },
  })
  @Response<AuthResponseDto<null>>(401, '인증이 필요합니다.', {
    success: false,
    statusCode: 401,
    message: '인증이 필요합니다.',
    data: null,
  })
  @Response<AuthResponseDto<null>>(404, '사용자 프로필을 찾을 수 없습니다.', {
    success: false,
    statusCode: 404,
    message: '사용자 프로필을 찾을 수 없습니다.',
    data: null,
  })
  public async getMyProfile(
    @Header('Authorization') authorization: string | undefined,
  ): Promise<AuthResponseDto<UserProfileData | null>> {
    try {
      const data = await this.usersService.getProfile(authorization);
      return { success: true, statusCode: 200, message: '프로필 조회 성공', data };
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof UserNotFoundError) {
        this.setStatus(404);
        return { success: false, statusCode: 404, message: err.message, data: null };
      }
      throw err;
    }
  }
}