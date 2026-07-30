import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthProvider } from '../../generated/prisma/enums.js';
import {
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  generateGoogleSignupPendingToken,
  verifyGoogleSignupPendingToken,
} from '../../auth.config.js';
import { getGoogleAuthUrl, getGoogleProfile } from '../../google.config.js';
import { AuthRepository } from './auth.repository.js';
import { sendVerificationEmail } from '../../mailer.js';
import { AgreementInput, AgreementType, AuthSessionResult, GoogleCallbackResult } from './auth.dto.js';
import { PlanType } from '../home/home.dto.js';
import { ApiError } from '../../common/errors/api.error.js';
import { ErrorCode } from '../../common/errors/error.code.js';

const REQUIRED_AGREEMENT_TYPES = Object.values(AgreementType).filter(
  (type) => type !== AgreementType.MARKETING,
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class DuplicateEmailError extends ApiError {
  constructor() {
    super(409, "E409", "이미 가입된 이메일입니다.");
  }
}

export class InvalidAgreementError extends ApiError {
  constructor() {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "필수 약관에 모두 동의해야 합니다."
    );
  }
}

export class InvalidTokenError extends ApiError {
  constructor(expired: boolean) {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      expired
        ? "인증 링크가 만료되었습니다."
        : "유효하지 않은 인증 링크입니다."
    );
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "이메일 또는 비밀번호가 올바르지 않습니다."
    );
  }
}

export class InvalidRefreshTokenError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "유효하지 않은 리프레시 토큰입니다."
    );
  }
}

export class LocalAccountExistsError extends ApiError {
  constructor() {
    super(409, "E409", "이미 이메일/비밀번호로 가입된 계정입니다.");
  }
}

export class InvalidEmailError extends ApiError {
  constructor() {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "올바른 이메일 형식이 아닙니다."
    );
  }
}

export class GoogleAuthFailedError extends ApiError {
  constructor() {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "구글 인증에 실패했습니다."
    );
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(ErrorCode.UNAUTHORIZED.status, ErrorCode.UNAUTHORIZED.code, "인증이 필요합니다.");
  }
}

export class NoPasswordSetError extends ApiError {
  constructor() {
    super(
      ErrorCode.BAD_REQUEST.status,
      ErrorCode.BAD_REQUEST.code,
      "구글 계정은 비밀번호를 변경할 수 없습니다."
    );
  }
}

export class InvalidCurrentPasswordError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "현재 비밀번호가 올바르지 않습니다."
    );
  }
}

export class WithdrawnAccountError extends ApiError {
  constructor() {
    super(
      ErrorCode.UNAUTHORIZED.status,
      ErrorCode.UNAUTHORIZED.code,
      "탈퇴한 계정입니다."
    );
  }
}

export class AuthService {
  private authRepository = new AuthRepository();

  /**
   * 로그인 응답에 포함할 닉네임/요금제/프로필 이미지 조회
   * - 요금제가 아직 없으면(홈 화면 미방문) DB에 만들지 않고 기본값 FREE로 표시만 함
   */
  private async getSessionExtras(
    userId: string,
  ): Promise<Pick<AuthSessionResult, 'userName' | 'plan' | 'profileImgUrl'>> {
    const user = await this.authRepository.findByIdWithProfileAndPlan(userId);

    return {
      userName: user?.profile?.userName ?? null,
      profileImgUrl: user?.profile?.profileImgUrl ?? null,
      plan: (user?.plan?.type as unknown as PlanType) ?? PlanType.FREE,
    };
  }

  /**
   * 회원가입
   * - 이메일 중복 확인 후 인증 메일 발송
   */
  public async signup(email: string, password: string, agreements: AgreementInput[]): Promise<void> {
    if (!EMAIL_REGEX.test(email)) throw new InvalidEmailError();

    const hasAllRequiredAgreements = REQUIRED_AGREEMENT_TYPES.every((type) =>
      agreements.some((agreement) => agreement.type === type && agreement.isAgreed),
    );
    if (!hasAllRequiredAgreements) throw new InvalidAgreementError();

    const existing = await this.authRepository.findByEmail(email);
    if (existing) throw new DuplicateEmailError();

    const passwordHash = await bcrypt.hash(password, 10);
    const token = generateEmailVerificationToken({ email, passwordHash, agreements });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(email, verifyUrl);
  }

  /**
   * 이메일 인증
   * - 인증 토큰 검증 후 유저 생성 및 액세스/리프레시 토큰 발급
   */
  public async verifyEmail(token: string): Promise<AuthSessionResult> {
    let payload;
    try {
      payload = verifyEmailVerificationToken(token);
    } catch (err) {
      throw new InvalidTokenError(err instanceof jwt.TokenExpiredError);
    }

    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) throw new DuplicateEmailError();

    const user = await this.authRepository.createUser(
      payload.email,
      payload.passwordHash,
      AuthProvider.local,
      payload.agreements as AgreementInput[],
    );
    const accessToken = generateAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = generateRefreshToken(user.userId);
    await this.authRepository.saveRefreshToken(user.userId, refreshToken);
    await this.authRepository.updateLastLogin(user.userId);

    return { accessToken, refreshToken, email: user.email, ...(await this.getSessionExtras(user.userId)) };
  }

  /**
   * 로그인
   */
  public async login(email: string, password: string): Promise<AuthSessionResult> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || !user.password) throw new InvalidCredentialsError();
    if (user.deletedAt) throw new WithdrawnAccountError();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new InvalidCredentialsError();

    const accessToken = generateAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = generateRefreshToken(user.userId);
    await this.authRepository.saveRefreshToken(user.userId, refreshToken);
    await this.authRepository.updateLastLogin(user.userId);

    return { accessToken, refreshToken, email: user.email, ...(await this.getSessionExtras(user.userId)) };
  }

  /**
   * 로그아웃
   * - 리프레시 토큰 검증 후 저장된 토큰 제거
   */
  public async logout(refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.authRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) throw new InvalidRefreshTokenError();

    await this.authRepository.clearRefreshToken(user.userId);
  }

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
   * 비밀번호 변경
   * - 현재 비밀번호 확인 후 변경, 다른 기기 세션은 재로그인하도록 리프레시 토큰 무효화
   */
  public async changePassword(
    authorization: string | undefined,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const userId = this.extractUserId(authorization);

    const user = await this.authRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    if (!user.password) throw new NoPasswordSetError();

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new InvalidCurrentPasswordError();

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(userId, passwordHash);
    await this.authRepository.clearRefreshToken(userId);
  }

  /**
   * 회원 탈퇴
   * - 액세스 토큰만으로 동작하는 단일 버튼 탈퇴 - 소프트 삭제 후 리프레시 토큰 무효화
   */
  public async withdraw(authorization: string | undefined): Promise<void> {
    const userId = this.extractUserId(authorization);

    const user = await this.authRepository.findById(userId);
    if (!user || user.deletedAt) throw new UnauthorizedError();

    await this.authRepository.withdrawUser(userId);
  }

  /**
   * 액세스 토큰 재발급
   */
  public async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.authRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) throw new InvalidRefreshTokenError();

    const newAccessToken = generateAccessToken({ userId: user.userId, email: user.email });
    const newRefreshToken = generateRefreshToken(user.userId);
    await this.authRepository.saveRefreshToken(user.userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * 구글 로그인 시작 URL 생성
   */
  public getGoogleAuthUrl(): string {
    return getGoogleAuthUrl();
  }

  /**
   * 구글 로그인 콜백
   * - 기존 google 유저면 로그인 처리, local 계정과 이메일이 겹치면 에러
   * - 신규 유저면 가입 대기 토큰 발급 (약관 동의 전이라 유저를 생성하지 않음)
   */
  public async googleCallback(code: string): Promise<GoogleCallbackResult> {
    let googleId: string, email: string;
    try {
      ({ googleId, email } = await getGoogleProfile(code));
    } catch {
      throw new GoogleAuthFailedError();
    }

    const existing = await this.authRepository.findByEmail(email);

    if (existing) {
      if (existing.provider !== AuthProvider.google) throw new LocalAccountExistsError();
      if (existing.deletedAt) throw new WithdrawnAccountError();

      const accessToken = generateAccessToken({ userId: existing.userId, email: existing.email });
      const refreshToken = generateRefreshToken(existing.userId);
      await this.authRepository.saveRefreshToken(existing.userId, refreshToken);
      await this.authRepository.updateLastLogin(existing.userId);

      return {
        status: 'login',
        accessToken,
        refreshToken,
        email: existing.email,
        ...(await this.getSessionExtras(existing.userId)),
      };
    }

    const pendingToken = generateGoogleSignupPendingToken({ email, googleId });
    return { status: 'pending', pendingToken, email };
  }

  /**
   * 구글 회원가입 완료
   * - 가입 대기 토큰 검증 후 약관 동의와 함께 유저 생성 및 토큰 발급
   */
  public async completeGoogleSignup(
    token: string,
    agreements: AgreementInput[],
  ): Promise<AuthSessionResult> {
    let payload;
    try {
      payload = verifyGoogleSignupPendingToken(token);
    } catch (err) {
      throw new InvalidTokenError(err instanceof jwt.TokenExpiredError);
    }

    const hasAllRequiredAgreements = REQUIRED_AGREEMENT_TYPES.every((type) =>
      agreements.some((agreement) => agreement.type === type && agreement.isAgreed),
    );
    if (!hasAllRequiredAgreements) throw new InvalidAgreementError();

    const existing = await this.authRepository.findByEmail(payload.email);
    if (existing) throw new DuplicateEmailError();

    const user = await this.authRepository.createUser(
      payload.email,
      null,
      AuthProvider.google,
      agreements,
    );
    const accessToken = generateAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = generateRefreshToken(user.userId);
    await this.authRepository.saveRefreshToken(user.userId, refreshToken);
    await this.authRepository.updateLastLogin(user.userId);

    return { accessToken, refreshToken, email: user.email, ...(await this.getSessionExtras(user.userId)) };
  }
}