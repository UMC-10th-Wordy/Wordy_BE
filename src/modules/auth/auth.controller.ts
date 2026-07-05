import { Controller, Post, Get, Route, Tags, Body, Query } from "tsoa";
import { AuthService } from "./auth.service";
import {
  SignupRequest,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
} from "./auth.dto";

import { ApiResponse } from "../../common/responses/api.response";
import { success } from "../../common/responses/response";
import { SuccessCode } from "../../common/responses/success.code";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private authService = new AuthService();

  /** @summary 회원가입 */
  @Post("signup")
  public async signup(
    @Body() body: SignupRequest,
  ): Promise<ApiResponse<{ email: string }>> {
    await this.authService.signup(
      body.email,
      body.password,
      body.agreements
    );

    this.setStatus(201);

    return success(
      SuccessCode.CREATED.code,
      "인증 메일을 발송했습니다.",
      {
        email: body.email,
      }
    );
  }

  /** @summary 이메일 인증 */
  @Get("verify-email")
  public async verifyEmail(
    @Query() token: string,
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      email: string;
    }>
  > {
    const data = await this.authService.verifyEmail(token);

    return success(
      SuccessCode.OK.code,
      "이메일 인증이 완료되었습니다. 프로필을 입력해주세요.",
      data
    );
  }

  /** @summary 로그인 */
  @Post("login")
  public async login(
    @Body() body: LoginRequest,
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      email: string;
    }>
  > {
    const data = await this.authService.login(
      body.email,
      body.password
    );

    return success(
      SuccessCode.OK.code,
      "로그인이 완료되었습니다.",
      data
    );
  }

  /** @summary 로그아웃 */
  @Post("logout")
  public async logout(
    @Body() body: LogoutRequest,
  ): Promise<ApiResponse<null>> {
    await this.authService.logout(body.refreshToken);

    return success(
      SuccessCode.OK.code,
      "로그아웃이 완료되었습니다.",
      null
    );
  }

  /** @summary 액세스 토큰 재발급 */
  @Post("refresh")
  public async refresh(
    @Body() body: RefreshRequest,
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>
  > {
    const data = await this.authService.refresh(body.refreshToken);

    return success(
      SuccessCode.OK.code,
      "토큰이 재발급되었습니다.",
      data
    );
  }
}