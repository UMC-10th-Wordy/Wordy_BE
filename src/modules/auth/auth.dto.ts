import { PlanType } from '../home/home.dto.js';

export enum AgreementType {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  AGE_OVER_14 = 'AGE_OVER_14',
  MARKETING = 'MARKETING',
}

export interface AgreementInput {
  type: AgreementType;
  isAgreed: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  agreements: AgreementInput[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleCompleteSignupRequest {
  token: string;
  agreements: AgreementInput[];
}

export interface AuthSessionResult {
  accessToken: string;
  refreshToken: string;
  email: string;
  userName: string | null;
  plan: PlanType;
  profileImgUrl: string | null;
}

export type GoogleCallbackResult =
  | ({ status: "login" } & AuthSessionResult)
  | { status: "pending"; pendingToken: string; email: string };