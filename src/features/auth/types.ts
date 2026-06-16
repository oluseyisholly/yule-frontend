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
