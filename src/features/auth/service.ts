import { ApiRequestError, postApi } from "@/lib/api";
import type {
  AuthHandoffExchangeResponse,
  CreateUserPayload,
  CreateUserResponse,
  ExternalBusinessesResponse,
  ExternalProfileResponse,
  SignInPayload,
  SignInResponse,
  UpdateExternalProfilePayload,
  UpdateExternalProfileResponse,
} from "@/features/auth/types";

const SIGN_IN_ENDPOINT = "/user/signin";
const CREATE_USER_ENDPOINT = "/user";
const AUTH_HANDOFF_EXCHANGE_ENDPOINT = "/auth/handoff/exchange";
const NEXT_PUBLIC_ONEDA_API_BASE_URL =
  process.env.NEXT_PUBLIC_ONEDA_API_BASE_URL?.trim().replace(/\/$/, "");
const NEXT_PUBLIC_AUTH_APP_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_BASE_URL?.trim().replace(/\/$/, "");

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

export async function exchangeAuthHandoffCode(code: string) {
  if (!NEXT_PUBLIC_ONEDA_API_BASE_URL) {
    throw new ApiRequestError("Auth app base URL is not configured.");
  }

  const response = await fetch(
    `${NEXT_PUBLIC_ONEDA_API_BASE_URL}${AUTH_HANDOFF_EXCHANGE_ENDPOINT}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        targetApp: "FESTA",
      }),
      cache: "no-store",
    },
  );

  const contentType = response.headers.get("content-type") ?? "";
  const responseBody = contentType.includes("application/json")
    ? ((await response.json()) as AuthHandoffExchangeResponse | { message?: string })
    : null;

  if (!response.ok) {
    throw new ApiRequestError(
      responseBody && "message" in responseBody && responseBody.message
        ? responseBody.message
        : "Unable to exchange your sign-in code right now.",
      {
        status: response.status,
        details: responseBody,
      },
    );
  }

  return responseBody as AuthHandoffExchangeResponse;
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

export async function getExternalBusinesses(
  accountId: string,
  accessToken: string,
) {
  if (!NEXT_PUBLIC_ONEDA_API_BASE_URL) {
    throw new ApiRequestError("Oneda profile base URL is not configured.");
  }

  const response = await fetch(
    `${NEXT_PUBLIC_ONEDA_API_BASE_URL}/business/fetch`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        accountId,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to load your businesses right now.", {
      status: response.status,
      details: await response.text(),
    });
  }

  return (await response.json()) as ExternalBusinessesResponse;
}

export async function getExternalBusinessProfiles(
  hostBusinessId: string,
  accessToken: string,
  search?: string,
) {
  if (!NEXT_PUBLIC_ONEDA_API_BASE_URL) {
    throw new ApiRequestError("Oneda profile base URL is not configured.");
  }

  const resolvedSearch = search?.trim() ?? "";

  const response = await fetch(
    `${NEXT_PUBLIC_ONEDA_API_BASE_URL}/profile/fetch${
      resolvedSearch
        ? `?search=${encodeURIComponent(resolvedSearch)}`
        : ""
    }`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        hostBusinessId,
        excludeAuth: true,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new ApiRequestError("Unable to load business contacts right now.", {
      status: response.status,
      details: await response.text(),
    });
  }

  return (await response.json()) as {
    success: boolean;
    data:
      | Array<{
          _id: string;
          profilePhotoUrl?: string | null;
          accountId: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
          };
          hostBusinessId?: {
            _id?: string;
            businessName?: string;
          };
          host?: boolean;
          type?: string;
        }>
      | {
          profiles?: Array<{
            _id: string;
            profilePhotoUrl?: string | null;
            accountId: {
              _id: string;
              firstName: string;
              lastName: string;
              email: string;
              phoneNumber: string;
            };
            hostBusinessId?: {
              _id?: string;
              businessName?: string;
            };
            host?: boolean;
            type?: string;
          }>;
          totalDocs?: number;
          limit?: number;
          page?: number;
          totalPages?: number;
          hasPrevPage?: boolean;
          hasNextPage?: boolean;
          prevPage?: number | null;
          nextPage?: number | null;
        };
  };
}

export async function updateExternalProfile(
  profileId: string,
  accessToken: string,
  payload: UpdateExternalProfilePayload,
) {
  if (!NEXT_PUBLIC_ONEDA_API_BASE_URL) {
    throw new ApiRequestError("Oneda profile base URL is not configured.");
  }

  const response = await fetch(
    `${NEXT_PUBLIC_ONEDA_API_BASE_URL}/profile/${encodeURIComponent(profileId)}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  const contentType = response.headers.get("content-type") ?? "";
  const responseBody = contentType.includes("application/json")
    ? ((await response.json()) as UpdateExternalProfileResponse)
    : null;

  if (!response.ok) {
    throw new ApiRequestError(
      responseBody?.message || "Unable to update your profile right now.",
      {
        status: response.status,
        details: responseBody,
      },
    );
  }

  return responseBody ?? { success: true } satisfies UpdateExternalProfileResponse;
}
