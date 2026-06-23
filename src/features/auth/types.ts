export type SignInPayload = {
  email: string;
  password: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  confirmPassword: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  token: string;
  refreshToken?: string | null;
  profileId?: string | null;
  mode?: "BUSINESS" | "INDIVIDUAL" | string | null;
  hostBusinessId?: string | null;
  hostAccountId?: string | null;
  profile?: ExternalProfileRecord | null;
};

export type SsoTokenPayload = {
  id: string;
  email: string;
  profileId: string;
  mode: "BUSINESS" | "INDIVIDUAL" | string;
  hostBusinessId?: string;
  hostAccountId?: string;
  iat: number;
  exp: number;
};

export type ExternalAccountProfile = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  mfaEnabled: boolean;
  isPasswordSet: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ExternalProfileRecord = {
  _id: string;
  accountId: ExternalAccountProfile;
  default: boolean;
  host: boolean;
  type: string;
  active: boolean;
  status: string;
  above18: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ExternalProfileResponse = {
  success: boolean;
  data: ExternalProfileRecord;
};

export type ExternalBusinessRecord = {
  _id?: string;
  id?: string;
  businessName?: string;
  numberOfEmployees?: string;
  businessLocation?: string;
  industry?: string;
  currency?: string;
  timezone?: string;
  goals?: string[];
  services?: string[];
  state?: string;
  country?: string;
  switchActive?: boolean;
  onboardingCompleted?: boolean;
  accountId?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type ExternalBusinessesResponse = {
  success: boolean;
  data: ExternalBusinessRecord[];
};

export type SignInResponse = {
  code: number;
  message: string;
  data: AuthUser;
};

export type CreateUserResponse = {
  code: number;
  message: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
};
