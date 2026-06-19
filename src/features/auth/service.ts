import { ApiRequestError, postApi } from "@/lib/api";
import type {
  CreateUserPayload,
  CreateUserResponse,
  ExternalProfileResponse,
  SignInPayload,
  SignInResponse,
} from "@/features/auth/types";

const SIGN_IN_ENDPOINT = "/user/signin";
const CREATE_USER_ENDPOINT = "/user";
const NEXT_PUBLIC_ONEDA_API_BASE_URL =
  process.env.NEXT_PUBLIC_ONEDA_API_BASE_URL?.trim().replace(/\/$/, "");

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

export async function getExternalProfile(
  profileId: string,
  accessToken: string,
) {
  if (!NEXT_PUBLIC_ONEDA_API_BASE_URL) {
    throw new ApiRequestError("Oneda profile base URL is not configured.");
  }

  const response = await fetch(
    `${NEXT_PUBLIC_ONEDA_API_BASE_URL}/profile/${encodeURIComponent(profileId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to load your profile right now.", {
      status: response.status,
      details: await response.text(),
    });
  }

  return (await response.json()) as ExternalProfileResponse;
}
