import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

interface EmailVerificationPayload {
  purpose: 'email-verification';
  email: string;
  passwordHash: string;
  agreements: { type: string; isAgreed: boolean }[];
}

interface AccessTokenPayload {
  purpose: 'access';
  userId: string;
  email: string;
}

interface RefreshTokenPayload {
  purpose: 'refresh';
  userId: string;
  jti: string;
}

interface GoogleSignupPendingPayload {
  purpose: 'google-signup-pending';
  email: string;
  googleId: string;
}

export function generateEmailVerificationToken(
  payload: Omit<EmailVerificationPayload, 'purpose'>,
): string {
  return jwt.sign(
    { ...payload, purpose: 'email-verification' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  );
}

export function verifyEmailVerificationToken(token: string): EmailVerificationPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string) as EmailVerificationPayload;
  if (payload.purpose !== 'email-verification') {
    throw new jwt.JsonWebTokenError('토큰의 용도가 올바르지 않습니다.');
  }
  return payload;
}

export function generateAccessToken(payload: Omit<AccessTokenPayload, 'purpose'>): string {
  return jwt.sign(
    { ...payload, purpose: 'access' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AccessTokenPayload;
  if (payload.purpose !== 'access') {
    throw new jwt.JsonWebTokenError('토큰의 용도가 올바르지 않습니다.');
  }
  return payload;
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, purpose: 'refresh', jti: randomUUID() },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' },
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string) as RefreshTokenPayload;
  if (payload.purpose !== 'refresh') {
    throw new jwt.JsonWebTokenError('토큰의 용도가 올바르지 않습니다.');
  }
  return payload;
}

export function generateGoogleSignupPendingToken(
  payload: Omit<GoogleSignupPendingPayload, 'purpose'>,
): string {
  return jwt.sign(
    { ...payload, purpose: 'google-signup-pending' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  );
}

export function verifyGoogleSignupPendingToken(token: string): GoogleSignupPendingPayload {
  const payload = jwt.verify(token, process.env.JWT_SECRET as string) as GoogleSignupPendingPayload;
  if (payload.purpose !== 'google-signup-pending') {
    throw new jwt.JsonWebTokenError('토큰의 용도가 올바르지 않습니다.');
  }
  return payload;
}
