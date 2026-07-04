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

export interface AuthResponseDto<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}