import { postApi } from "@/lib/api";
import type {
  CreateUserPayload,
  CreateUserResponse,
  SignInPayload,
  SignInResponse,
} from "@/features/auth/types";

const SIGN_IN_ENDPOINT = "/user/signin";
const CREATE_USER_ENDPOINT = "/user";

export async function signIn(payload: SignInPayload) {
  return postApi<SignInResponse, SignInPayload>(SIGN_IN_ENDPOINT, payload, {
    skipAuthLogout: true,
  });
}

export async function createUser(payload: CreateUserPayload) {
  return postApi<CreateUserResponse, CreateUserPayload>(
    CREATE_USER_ENDPOINT,
    payload,
    {
      skipAuthLogout: true,
    },
  );
}
