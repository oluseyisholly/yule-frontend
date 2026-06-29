"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { Spinner } from "@/components/ui/spinner";
import HomeScreen from "@/screens/HomeScreen";
import { getExternalProfile } from "@/features/auth/service";
import type { AuthUser, SsoTokenPayload } from "@/features/auth/types";
import { getMyContactId, syncContact } from "@/features/contacts/service";
import { ApiRequestError, resetApiLogoutState } from "@/lib/api";
import {
  clearStoredAuthSession,
  getStoredAuthStateSnapshot,
  useAuthStore,
} from "@/stores/auth-store";

function buildSanitizedLandingUrl(searchParams: URLSearchParams) {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.delete("accessToken");
  nextSearchParams.delete("refreshToken");
  const nextSearch = nextSearchParams.toString();

  return nextSearch ? `/?${nextSearch}` : "/dashboard";
}

function resolvePostSsoRedirect(searchParams: URLSearchParams) {
  const redirectUrl = searchParams.get("redirectUrl")?.trim();

  if (!redirectUrl) {
    return buildSanitizedLandingUrl(searchParams);
  }

  if (typeof window === "undefined") {
    return buildSanitizedLandingUrl(searchParams);
  }

  try {
    const resolvedUrl = new URL(redirectUrl, window.location.origin);

    if (resolvedUrl.origin !== window.location.origin) {
      return buildSanitizedLandingUrl(searchParams);
    }

    resolvedUrl.searchParams.delete("accessToken");
    resolvedUrl.searchParams.delete("refreshToken");

    const resolvedSearch = resolvedUrl.searchParams.toString();

    return `${resolvedUrl.pathname}${resolvedSearch ? `?${resolvedSearch}` : ""}${resolvedUrl.hash}`;
  } catch {
    return buildSanitizedLandingUrl(searchParams);
  }
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }

  return "Unable to sign you in right now. Please try again.";
}

export default function LandingPageEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const setCurrentContactId = useAuthStore(
    (state) => state.setCurrentContactId,
  );
  const setIsSsoSigningIn = useAuthStore((state) => state.setSsoSigningIn);
  const isSsoSigningIn = useAuthStore((state) => state.isSsoSigningIn);
  const processedAccessTokenRef = useRef<string | null>(null);
  const hasPendingAccessToken =
    Boolean(searchParams.get("accessToken")?.trim()) ||
    Boolean(searchParams.get("refreshToken")?.trim());

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")?.trim() ?? "";
    const refreshToken = searchParams.get("refreshToken")?.trim() ?? "";

    if (!accessToken) {
      processedAccessTokenRef.current = null;
      setIsSsoSigningIn(false);
      return;
    }

    if (processedAccessTokenRef.current === accessToken) {
      return;
    }

    processedAccessTokenRef.current = accessToken;

    let isCancelled = false;

    const bootstrapSsoSession = async () => {
      resetApiLogoutState();
      setIsSsoSigningIn(true);

      try {
        const decodedToken = jwtDecode<SsoTokenPayload>(accessToken);
        const email = decodedToken.email?.trim();
        const id = decodedToken.id?.trim();
        const profileId = decodedToken.profileId?.trim();

        if (!email || !id) {
          throw new Error("Unable to resolve your sign-in details.");
        }

        const normalizedEmail = email.toLowerCase();
        const storedAuthState = getStoredAuthStateSnapshot();
        const storedEmail =
          storedAuthState.user?.email?.trim().toLowerCase() || "";

        if (
          storedEmail &&
          storedEmail === normalizedEmail &&
          storedAuthState.user
        ) {
          const resumedSession: AuthUser = {
            id:
              storedAuthState.user.id?.trim() || decodedToken.id?.trim() || id,
            firstName: storedAuthState.user.firstName?.trim() || "",
            lastName: storedAuthState.user.lastName?.trim() || "",
            phoneNumber: storedAuthState.user.phoneNumber?.trim() || "",
            email: storedAuthState.user.email?.trim() || email,
            token: accessToken,
            refreshToken: refreshToken || storedAuthState.refreshToken || null,
            profileId: storedAuthState.user.id?.trim() || id,
            mode:
              decodedToken.mode?.trim() ||
              storedAuthState.user.mode?.trim() ||
              null,
            hostBusinessId:
              decodedToken.hostBusinessId?.trim() ||
              storedAuthState.user.hostBusinessId?.trim() ||
              null,
            hostAccountId:
              decodedToken.hostAccountId?.trim() ||
              storedAuthState.user.hostAccountId?.trim() ||
              null,
            profile:
              storedAuthState.profile ?? storedAuthState.user.profile ?? null,
          };

          if (!isCancelled) {
            setAuthSession(resumedSession);
            setCurrentContactId(storedAuthState.currentContactId ?? null);
            router.replace(resolvePostSsoRedirect(searchParams));
            toast.success("Sign in successful");
          }

          return;
        }

        clearStoredAuthSession();

        const provisionalSession: AuthUser = {
          id: decodedToken.id?.trim() || id,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email,
          token: accessToken,
          refreshToken: refreshToken || null,
          profileId: id,
          mode: decodedToken.mode?.trim() || null,
          hostBusinessId: decodedToken.hostBusinessId?.trim() || null,
          hostAccountId: decodedToken.hostAccountId?.trim() || null,
          profile: null,
        };

        if (!isCancelled) {
          setAuthSession(provisionalSession);
        }

        const profileResponse = await getExternalProfile(
          profileId,
          accessToken,
        );
        const profileRecord = profileResponse.data;
        const account = profileRecord.accountId;

        const resolvedSession: AuthUser = {
          id: decodedToken.id?.trim() || account._id?.trim() || id,
          firstName: account.firstName?.trim() || "",
          lastName: account.lastName?.trim() || "",
          phoneNumber: account.phoneNumber?.trim() || "",
          email: account.email?.trim() || email,
          token: accessToken,
          refreshToken: refreshToken || null,
          profileId: id,
          mode: decodedToken.mode?.trim() || profileRecord.type?.trim() || null,
          hostBusinessId: decodedToken.hostBusinessId?.trim() || null,
          hostAccountId:
            decodedToken.hostAccountId?.trim() || account._id?.trim() || null,
          profile: profileRecord,
          profilePhotoUrl: profileResponse.data.profilePhotoUrl?.trim() || null,
        };

        if (!isCancelled) {
          setAuthSession(resolvedSession);
        }

        await syncContact({
          gender: "male",
          firstName: resolvedSession.firstName || "Yule",
          lastName: resolvedSession.lastName || "User",
          phoneNumber: resolvedSession.phoneNumber || "",
          email: resolvedSession.email,
          userId: id,
          profileUrl: profileRecord.profilePhotoUrl?.trim() || "",
        });

        try {
          const currentContactIdResponse = await getMyContactId();

          if (!isCancelled) {
            setCurrentContactId(
              currentContactIdResponse.data?.contactId ?? null,
            );
          }
        } catch {
          if (!isCancelled) {
            setCurrentContactId(null);
          }
        }

        if (!isCancelled) {
          router.replace(resolvePostSsoRedirect(searchParams));
          toast.success("Sign in successful");
        }
      } catch (error) {
        clearStoredAuthSession();

        if (!isCancelled) {
          setCurrentContactId(null);
          router.replace(buildSanitizedLandingUrl(searchParams));
          toast.error(normalizeErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsSsoSigningIn(false);
        }
      }
    };

    void bootstrapSsoSession();

    return () => {
      isCancelled = true;
    };
  }, [
    router,
    searchParams,
    setAuthSession,
    setCurrentContactId,
    setIsSsoSigningIn,
  ]);

  return (
    <>
      <HomeScreen />

      {isSsoSigningIn || hasPendingAccessToken ? (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#120829]/55 px-6 backdrop-blur-[2px]">
          <div className="flex w-full max-w-[360px] flex-col items-center gap-4 rounded-[28px] border border-white/15 bg-white px-8 py-8 text-center shadow-[0_24px_60px_rgba(18,8,41,0.28)]">
            <Spinner className="size-10 text-[#3300C9]" />
            <div className="space-y-1">
              <p className="text-[18px] font-semibold text-[#1E1E1E]">
                Signing you in
              </p>
              <p className="text-sm text-[#6E6A78]">
                Please wait while we finish setting up your session.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
