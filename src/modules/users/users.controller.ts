import { Controller, Post, Put, Get, Route, Tags, Body, Header, UploadedFile, Example, Response } from 'tsoa';
import { UsersService, UnauthorizedError, UserNotFoundError } from './users.service';
import { CompleteProfileRequest, ProfileImageData, UserProfileData, YearsOfService, JobRole } from './users.dto';
import { ApiResponse } from '../../common/responses/api.response';
import { success } from '../../common/responses/response';
import { SuccessCode } from '../../common/responses/success.code';

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
  private usersService = new UsersService();

  /**
   * 프로필 등록 - 이메일 인증 후 발급된 액세스 토큰으로 인증
   * @summary 프로필 등록
   * @example body {"userName": "홍길동", "yearsOfService": "ONE_TO_3", "jobRole": "DEVELOPMENT"}
   */
  @Post('profile')
  @Example<ApiResponse<{ userId: string; email: string }>>({
    success: true,
    code: 'S201',
    message: '프로필 등록이 완료되었습니다.',
    result: {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      email: 'uesr@email.com',
    },
  })
  public async completeProfile(
    @Header('Authorization') authorization: string | undefined,
    @Body() body: CompleteProfileRequest,
  ): Promise<ApiResponse<{ userId: string; email: string }>> {
    const data = await this.usersService.completeProfile(authorization, body);

    this.setStatus(201);

    return success(
      SuccessCode.CREATED.code,
      "프로필 등록이 완료되었습니다.",
      data
    );
  }

  /**
   * 닉네임/연차/직무/프로필 이미지 중 원하는 값을 보내면 됨 - 등록과 동일하게 upsert로 동작
   * @summary 프로필 수정
   * @example body {"userName": "홍길동", "yearsOfService": "ONE_TO_3", "jobRole": "DEVELOPMENT"}
   */
  @Put('profile')
  @Example<ApiResponse<{ userId: string; email: string }>>({
    success: true,
    code: 'S200',
    message: '프로필이 수정되었습니다.',
    result: {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      email: 'uesr@email.com',
    },
  })
  public async updateProfile(
    @Header('Authorization') authorization: string | undefined,
    @Body() body: CompleteProfileRequest,
  ): Promise<ApiResponse<{ userId: string; email: string }>> {
    const data = await this.usersService.completeProfile(authorization, body);

    return success(
      SuccessCode.OK.code,
      "프로필이 수정되었습니다.",
      data
    );
  }

  /**
   * 프로필이 이미 등록된 경우 즉시 반영되고, 등록 전이면 응답으로 받은 URL을 프로필 등록 API의 profileImgUrl로 함께 보내면 됨 (jpg/png/webp/gif, 최대 5MB)
   * @summary 프로필 이미지 업로드
   */
  @Post('profile/image')
  @Example<ApiResponse<ProfileImageData>>({
    success: true,
    code: 'S201',
    message: '프로필 이미지가 업로드되었습니다.',
    result: {
      profileImgUrl: 'http://localhost:3000/uploads/profile/3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg',
    },
  })
  public async uploadProfileImage(
    @Header('Authorization') authorization: string | undefined,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ApiResponse<ProfileImageData>> {
    const data = await this.usersService.uploadProfileImage(authorization, image);

    this.setStatus(201);

    return success(
      SuccessCode.CREATED.code,
      "프로필 이미지가 업로드되었습니다.",
      data
    );
  }

  /**
   * JWT 토큰의 사용자 ID를 기준으로 내 프로필 정보 조회
   *
   * @summary 내 프로필 조회
   */
  @Get('profile')
  @Example<ApiResponse<UserProfileData>>({
    success: true,
    code: 'S200',
    message: '프로필 조회 성공',
    result: {
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      email: 'hong@example.com',
      userName: '홍길동',
      profileImgUrl: 'https://example.com/profile.jpg',
      yearsOfService: YearsOfService.ONE_TO_3,
      jobRole: JobRole.DEVELOPMENT,
      createdAt: new Date('2026-06-20T16:00:00.000Z'),
    },
  })
  public async getMyProfile(
    @Header('Authorization') authorization: string | undefined,
  ): Promise<ApiResponse<UserProfileData>> {
    const data = await this.usersService.getProfile(authorization);

    return success(
      SuccessCode.OK.code,
      "프로필 조회 성공",
      data
    );
  }
}