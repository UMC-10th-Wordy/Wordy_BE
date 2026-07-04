import { Controller, Post, Get, Route, Tags, Body, Query } from 'tsoa';
import {
  AuthService,
  DuplicateEmailError,
  InvalidAgreementError,
  InvalidTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from './auth.service';
import { SignupRequest, LoginRequest, LogoutRequest, RefreshRequest, AuthResponseDto } from './auth.dto';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  private authService = new AuthService();

  /** @summary 회원가입 */
  @Post('signup')
  public async signup(
    @Body() body: SignupRequest,
  ): Promise<AuthResponseDto<{ email: string }>> {
    try {
      await this.authService.signup(body.email, body.password, body.agreements);
      this.setStatus(201);
      return { success: true, statusCode: 201, message: '인증 메일을 발송했습니다.', data: { email: body.email } };
    } catch (err) {
      if (err instanceof InvalidAgreementError) {
        this.setStatus(400);
        return { success: false, statusCode: 400, message: err.message, data: { email: body.email } };
      }
      if (err instanceof DuplicateEmailError) {
        this.setStatus(409);
        return { success: false, statusCode: 409, message: err.message, data: { email: body.email } };
      }
      throw err;
    }
  }

  /** @summary 이메일 인증 — 유저 생성 + 토큰 발급 */
  @Get('verify-email')
  public async verifyEmail(
    @Query() token: string,
  ): Promise<AuthResponseDto<{ accessToken: string; refreshToken: string; email: string } | null>> {
    try {
      const data = await this.authService.verifyEmail(token);
      return { success: true, statusCode: 200, message: '이메일 인증이 완료되었습니다. 프로필을 입력해주세요.', data };
    } catch (err) {
      if (err instanceof InvalidTokenError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      if (err instanceof DuplicateEmailError) {
        this.setStatus(409);
        return { success: false, statusCode: 409, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 로그인 */
  @Post('login')
  public async login(
    @Body() body: LoginRequest,
  ): Promise<AuthResponseDto<{ accessToken: string; refreshToken: string; email: string } | null>> {
    try {
      const data = await this.authService.login(body.email, body.password);
      return { success: true, statusCode: 200, message: '로그인이 완료되었습니다.', data };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 로그아웃 */
  @Post('logout')
  public async logout(
    @Body() body: LogoutRequest,
  ): Promise<AuthResponseDto<null>> {
    try {
      await this.authService.logout(body.refreshToken);
      return { success: true, statusCode: 200, message: '로그아웃이 완료되었습니다.', data: null };
    } catch (err) {
      if (err instanceof InvalidRefreshTokenError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      throw err;
    }
  }

  /** @summary 액세스 토큰 재발급 */
  @Post('refresh')
  public async refresh(
    @Body() body: RefreshRequest,
  ): Promise<AuthResponseDto<{ accessToken: string; refreshToken: string } | null>> {
    try {
      const data = await this.authService.refresh(body.refreshToken);
      return { success: true, statusCode: 200, message: '토큰이 재발급되었습니다.', data };
    } catch (err) {
      if (err instanceof InvalidRefreshTokenError) {
        this.setStatus(401);
        return { success: false, statusCode: 401, message: err.message, data: null };
      }
      throw err;
    }
  }
}