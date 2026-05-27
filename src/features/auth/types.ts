export type SignInPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  token: string;
};

export type SignInResponse = {
  code: number;
  message: string;
  data: AuthUser;
};
