export enum YearsOfService {
  UNDER_1 = 'UNDER_1',
  ONE_TO_3 = 'ONE_TO_3',
  THREE_TO_5 = 'THREE_TO_5',
  FIVE_TO_10 = 'FIVE_TO_10',
  OVER_10 = 'OVER_10',
}

export enum JobRole {
  PRODUCT_PLANNING = 'PRODUCT_PLANNING',
  DEVELOPMENT = 'DEVELOPMENT',
  DESIGN = 'DESIGN',
  MARKETING_SALES = 'MARKETING_SALES',
  DATA_ANALYSIS = 'DATA_ANALYSIS',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  HR = 'HR',
  FINANCE_ACCOUNTING = 'FINANCE_ACCOUNTING',
  EDUCATION_RESEARCH = 'EDUCATION_RESEARCH',
  FREELANCER = 'FREELANCER',
  STUDENT = 'STUDENT',
  ETC = 'ETC',
}

export interface CompleteProfileRequest {
  userName: string;
  profileImgUrl?: string;
  yearsOfService: YearsOfService;
  jobRole: JobRole;
}

export interface UserProfileData {
  userId: string;
  email: string;
  userName: string | null;
  profileImgUrl: string | null;
  yearsOfService: YearsOfService | null;
  jobRole: JobRole | null;
  createdAt: Date;
}