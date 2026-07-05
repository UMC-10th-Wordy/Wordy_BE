import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthProvider } from '../../generated/prisma/enums';
import {
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../auth.config';
import { AuthRepository } from './auth.repository';
import { sendVerificationEmail } from '../../mailer';
import { AgreementInput, AgreementType } from './auth.dto';
import { ApiError } from '../../common/errors/api.error';
import { ErrorCode } from '../../common/errors/error.code';

const REQUIRED_AGREEMENT_TYPES = Object.values(AgreementType).filter(
  (type) => type !== AgreementType.MARKETING,
);

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

export class AuthService {
  private authRepository = new AuthRepository();

  /**
   * 회원가입
   * - 이메일 중복 확인 후 인증 메일 발송
   */
  public async signup(email: string, password: string, agreements: AgreementInput[]): Promise<void> {
    const hasAllRequiredAgreements = REQUIRED_AGREEMENT_TYPES.every((type) =>
      agreements.some((agreement) => agreement.type === type && agreement.isAgreed),
    );
    if (!hasAllRequiredAgreements) throw new InvalidAgreementError();

    const existing = await this.authRepository.findByEmail(email);
    if (existing) throw new DuplicateEmailError();

    const passwordHash = await bcrypt.hash(password, 10);
    const token = generateEmailVerificationToken({ email, passwordHash, agreements });

    const verifyUrl = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${token}`;
    await sendVerificationEmail(email, verifyUrl);
  }

  /**
   * 이메일 인증
   * - 인증 토큰 검증 후 유저 생성 및 액세스/리프레시 토큰 발급
   */
  public async verifyEmail(token: string): Promise<{ accessToken: string; refreshToken: string; email: string }> {
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

    return { accessToken, refreshToken, email: user.email };
  }

  /**
   * 로그인
   */
  public async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || !user.password) throw new InvalidCredentialsError();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new InvalidCredentialsError();

    const accessToken = generateAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = generateRefreshToken(user.userId);
    await this.authRepository.saveRefreshToken(user.userId, refreshToken);

    return { accessToken, refreshToken, email: user.email };
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
}