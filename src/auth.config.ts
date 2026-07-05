import jwt from 'jsonwebtoken';

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
  return jwt.verify(token, process.env.JWT_SECRET as string) as EmailVerificationPayload;
}

export function generateAccessToken(payload: Omit<AccessTokenPayload, 'purpose'>): string {
  return jwt.sign(
    { ...payload, purpose: 'access' },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as AccessTokenPayload;
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, purpose: 'refresh' },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' },
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as RefreshTokenPayload;
}
