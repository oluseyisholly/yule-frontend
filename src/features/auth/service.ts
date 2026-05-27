import { postApi } from "@/lib/api";
import type { SignInPayload, SignInResponse } from "@/features/auth/types";

const SIGN_IN_ENDPOINT = "/user/signin";

export async function signIn(payload: SignInPayload) {
  return postApi<SignInResponse, SignInPayload>(SIGN_IN_ENDPOINT, payload, {
    skipAuthLogout: true,
  });
}
