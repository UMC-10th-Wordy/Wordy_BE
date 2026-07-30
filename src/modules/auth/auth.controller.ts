import { Controller, Post, Get, Delete, Route, Tags, Body, Query, Header, Res, TsoaResponse, Example } from "tsoa";
import { AuthService } from "./auth.service";
import {
  SignupRequest,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  ChangePasswordRequest,
  GoogleCompleteSignupRequest,
  GoogleCallbackResult,
  AuthSessionResult,
} from "./auth.dto";
import { PlanType } from "../home/home.dto";

import { ApiResponse } from "../../common/responses/api.response";
import { success } from "../../common/responses/response";
import { SuccessCode } from "../../common/responses/success.code";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private authService = new AuthService();

  /**
   * @summary 회원가입
   * @example body {"email": "user@email.com", "password": "TestPassword123!", "agreements": [{"type": "TERMS_OF_SERVICE", "isAgreed": true}, {"type": "PRIVACY_POLICY", "isAgreed": true}, {"type": "AGE_OVER_14", "isAgreed": true}, {"type": "MARKETING", "isAgreed": false}]}
   */
  @Post("signup")
  @Example<ApiResponse<{ email: string }>>({
    success: true,
    code: "S201",
    message: "인증 메일을 발송했습니다.",
    result: { email: "user@email.com" },
  })
  public async signup(
    @Body()
    body: SignupRequest,
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
  @Example<ApiResponse<AuthSessionResult>>({
    success: true,
    code: "S200",
    message: "이메일 인증이 완료되었습니다. 프로필을 입력해주세요.",
    result: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoiYWNjZXNzIn0...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoicmVmcmVzaCJ9...",
      email: "user@email.com",
      userName: null,
      plan: PlanType.FREE,
      profileImgUrl: null,
    },
  })
  public async verifyEmail(
    @Query() token: string,
  ): Promise<ApiResponse<AuthSessionResult>> {
    const data = await this.authService.verifyEmail(token);

    return success(
      SuccessCode.OK.code,
      "이메일 인증이 완료되었습니다. 프로필을 입력해주세요.",
      data
    );
  }

  /**
   * 이메일/비밀번호로 로그인 - 구글로 가입한 계정은 password가 없어 항상 401
   * @summary 로그인
   * @example body {"email": "user@email.com", "password": "TestPassword123!"}
   */
  @Post("login")
  @Example<ApiResponse<AuthSessionResult>>({
    success: true,
    code: "S200",
    message: "로그인이 완료되었습니다.",
    result: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoiYWNjZXNzIn0...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoicmVmcmVzaCJ9...",
      email: "user@email.com",
      userName: "홍길동",
      plan: PlanType.FREE,
      profileImgUrl: "https://storage.googleapis.com/wordy-gsc/profile/3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg",
    },
  })
  public async login(
    @Body() body: LoginRequest,
  ): Promise<ApiResponse<AuthSessionResult>> {
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

  /**
   * @summary 로그아웃
   * @example body {"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
   */
  @Post("logout")
  @Example<ApiResponse<null>>({
    success: true,
    code: "S200",
    message: "로그아웃이 완료되었습니다.",
    result: null,
  })
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

  /**
   * 현재 비밀번호 확인 후 새 비밀번호로 변경 - 성공 시 기존 리프레시 토큰이 무효화되어 다른 기기는 재로그인 필요, 구글 계정은 401
   * @summary 비밀번호 변경
   * @example body {"currentPassword": "OldPassword123!", "newPassword": "NewPassword123!"}
   */
  @Post("password")
  @Example<ApiResponse<null>>({
    success: true,
    code: "S200",
    message: "비밀번호가 변경되었습니다.",
    result: null,
  })
  public async changePassword(
    @Header("Authorization") authorization: string | undefined,
    @Body() body: ChangePasswordRequest,
  ): Promise<ApiResponse<null>> {
    await this.authService.changePassword(
      authorization,
      body.currentPassword,
      body.newPassword
    );

    return success(
      SuccessCode.OK.code,
      "비밀번호가 변경되었습니다.",
      null
    );
  }

  /**
   * 액세스 토큰만으로 동작하는 단일 버튼 탈퇴 - 별도 확인 없이 즉시 소프트 삭제되며 재로그인 불가
   * @summary 회원 탈퇴
   */
  @Delete("withdraw")
  @Example<ApiResponse<null>>({
    success: true,
    code: "S200",
    message: "탈퇴가 완료되었습니다.",
    result: null,
  })
  public async withdraw(
    @Header("Authorization") authorization: string | undefined,
  ): Promise<ApiResponse<null>> {
    await this.authService.withdraw(authorization);

    return success(
      SuccessCode.OK.code,
      "탈퇴가 완료되었습니다.",
      null
    );
  }

  /**
   * 리프레시 토큰 로테이션 - 응답으로 새 refreshToken이 내려오며, 기존 refreshToken은 이후 즉시 무효화됨
   * @summary 액세스 토큰 재발급
   * @example body {"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
   */
  @Post("refresh")
  @Example<ApiResponse<{ accessToken: string; refreshToken: string }>>({
    success: true,
    code: "S200",
    message: "토큰이 재발급되었습니다.",
    result: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoiYWNjZXNzIn0...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoicmVmcmVzaCJ9...",
    },
  })
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

  /**
   * 구글 로그인 페이지로 302 리다이렉트 - 프론트에서 fetch/axios로 호출하지 말고 `window.location.href = "/api/v1/auth/google"`처럼 브라우저 이동으로 처리해야 함
   * @summary 구글 로그인 시작
   */
  @Get("google")
  public async googleLogin(
    @Res() redirect: TsoaResponse<302, void>,
  ): Promise<void> {
    const url = this.authService.getGoogleAuthUrl();
    redirect(302, undefined, { Location: url });
  }

  /**
   * 구글이 인증 후 리다이렉트하는 콜백 - `result.status`로 분기 처리
   * - `"login"`: 기존에 가입된 구글 계정. accessToken/refreshToken이 바로 내려오므로 별도 `/auth/login` 호출 없이 그대로 로그인 상태로 처리하면 됨 (약관 동의/프로필 등록 화면 모두 스킵)
   * - `"pending"`: 처음 로그인하는 구글 계정. 아직 User가 생성되지 않은 상태이며 토큰도 없음. 약관 동의 화면으로 이동시킨 뒤, 체크한 약관과 함께 `pendingToken`을 `POST /auth/google/complete`로 보내야 가입이 완료됨
   * @summary 구글 로그인 콜백
   */
  @Get("google/callback")
  @Example<ApiResponse<GoogleCallbackResult>>(
    {
      success: true,
      code: "S200",
      message: "약관 동의 후 회원가입을 완료해주세요.",
      result: {
        status: "pending",
        pendingToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ii4uLiIsInB1cnBvc2UiOiJnb29nbGUtc2lnbnVwLXBlbmRpbmcifQ...",
        email: "uesr@google.com",
      },
    },
    "신규 유저 - 약관 동의 필요",
  )
  @Example<ApiResponse<GoogleCallbackResult>>(
    {
      success: true,
      code: "S200",
      message: "구글 로그인이 완료되었습니다.",
      result: {
        status: "login",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoiYWNjZXNzIn0...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoicmVmcmVzaCJ9...",
        email: "uesr@google.com",
        userName: "홍길동",
        plan: PlanType.FREE,
        profileImgUrl: null,
      },
    },
    "기존 유저 - 즉시 로그인",
  )
  public async googleCallback(
    @Query() code: string,
  ): Promise<ApiResponse<GoogleCallbackResult>> {
    const data = await this.authService.googleCallback(code);

    return success(
      SuccessCode.OK.code,
      data.status === "login"
        ? "구글 로그인이 완료되었습니다."
        : "약관 동의 후 회원가입을 완료해주세요.",
      data
    );
  }

  /**
   * `token`은 `/auth/google/callback`에서 받은 `pendingToken`을 그대로 전달 - 완료되면 accessToken/refreshToken이 바로 내려오므로 별도 로그인 호출 없이 프로필 등록 화면으로 이동
   * @summary 구글 회원가입 완료
   * @example body {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "agreements": [{"type": "TERMS_OF_SERVICE", "isAgreed": true}, {"type": "PRIVACY_POLICY", "isAgreed": true}, {"type": "AGE_OVER_14", "isAgreed": true}, {"type": "MARKETING", "isAgreed": false}]}
   */
  @Post("google/complete")
  @Example<ApiResponse<AuthSessionResult>>({
    success: true,
    code: "S201",
    message: "회원가입이 완료되었습니다. 프로필을 입력해주세요.",
    result: {
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoiYWNjZXNzIn0...",
      refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJwdXJwb3NlIjoicmVmcmVzaCJ9...",
      email: "uesr@google.com",
      userName: null,
      plan: PlanType.FREE,
      profileImgUrl: null,
    },
  })
  public async completeGoogleSignup(
    @Body() body: GoogleCompleteSignupRequest,
  ): Promise<ApiResponse<AuthSessionResult>> {
    const data = await this.authService.completeGoogleSignup(
      body.token,
      body.agreements
    );

    this.setStatus(201);

    return success(
      SuccessCode.CREATED.code,
      "회원가입이 완료되었습니다. 프로필을 입력해주세요.",
      data
    );
  }
}