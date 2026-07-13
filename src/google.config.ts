import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export function getGoogleAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'consent',
  });
}

export interface GoogleProfile {
  googleId: string;
  email: string;
}

export async function getGoogleProfile(code: string): Promise<GoogleProfile> {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.id_token) {
    throw new Error('구글로부터 id_token을 받지 못했습니다.');
  }

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('구글 프로필 정보를 확인할 수 없습니다.');
  }

  return { googleId: payload.sub, email: payload.email };
}