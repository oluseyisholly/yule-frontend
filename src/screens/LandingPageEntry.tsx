"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import HomeScreen from "@/screens/HomeScreen";
import { getExternalProfile } from "@/features/auth/service";
import type { AuthUser, SsoTokenPayload } from "@/features/auth/types";
import { getMyContactId, syncContact } from "@/features/contacts/service";
import { ApiRequestError, resetApiLogoutState } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import {
  clearStoredAuthSession,
  useAuthStore,
} from "@/stores/auth-store";

function buildSanitizedLandingUrl(searchParams: URLSearchParams) {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.delete("accessToken");
  nextSearchParams.delete("refreshToken");
  const nextSearch = nextSearchParams.toString();

  return nextSearch ? `/?${nextSearch}` : "/";
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
  const setCurrentContactId = useAuthStore((state) => state.setCurrentContactId);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const processedAccessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")?.trim() ?? "";
    const refreshToken = searchParams.get("refreshToken")?.trim() ?? "";

    if (!accessToken) {
      processedAccessTokenRef.current = null;
      setIsSigningIn(false);
      return;
    }

    if (processedAccessTokenRef.current === accessToken) {
      return;
    }

    processedAccessTokenRef.current = accessToken;

    let isCancelled = false;

    const bootstrapSsoSession = async () => {
      setIsSigningIn(true);
      clearStoredAuthSession();
      resetApiLogoutState();

      try {
        const decodedToken = jwtDecode<SsoTokenPayload>(accessToken);
        const email = decodedToken.email?.trim();
        const profileId = decodedToken.profileId?.trim();

        if (!email || !profileId) {
          throw new Error("Unable to resolve your sign-in details.");
        }

        const provisionalSession: AuthUser = {
          id: decodedToken.id?.trim() || profileId,
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email,
          token: accessToken,
          refreshToken: refreshToken || null,
          profileId,
          mode: decodedToken.mode?.trim() || null,
          hostBusinessId: decodedToken.hostBusinessId?.trim() || null,
          hostAccountId: decodedToken.hostAccountId?.trim() || null,
          profile: null,
        };

        if (!isCancelled) {
          setAuthSession(provisionalSession);
        }

        const profileResponse = await getExternalProfile(profileId, accessToken);
        const profileRecord = profileResponse.data;
        const account = profileRecord.accountId;

        const resolvedSession: AuthUser = {
          id: decodedToken.id?.trim() || account._id?.trim() || profileId,
          firstName: account.firstName?.trim() || "",
          lastName: account.lastName?.trim() || "",
          phoneNumber: account.phoneNumber?.trim() || "",
          email: account.email?.trim() || email,
          token: accessToken,
          refreshToken: refreshToken || null,
          profileId,
          mode: decodedToken.mode?.trim() || profileRecord.type?.trim() || null,
          hostBusinessId: decodedToken.hostBusinessId?.trim() || null,
          hostAccountId:
            decodedToken.hostAccountId?.trim() || account._id?.trim() || null,
          profile: profileRecord,
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
          userId: profileId,
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
          router.replace(buildSanitizedLandingUrl(searchParams));
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
          setIsSigningIn(false);
        }
      }
    };

    void bootstrapSsoSession();

    return () => {
      isCancelled = true;
    };
  }, [router, searchParams, setAuthSession, setCurrentContactId]);

  if (isSigningIn) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-[420px] flex-col items-center rounded-[28px] border border-[#EEEAF7] bg-white px-8 py-12 text-center shadow-[0_18px_50px_rgba(33,16,93,0.08)]">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#F3EEFF] text-[#3300C9]">
            <Spinner className="size-7" />
          </span>
          <h1 className="mt-6 text-[28px] font-semibold text-[#17191C]">
            Signing you in
          </h1>
          <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
            Please wait while we securely complete your sign-in.
          </p>
        </div>
      </main>
    );
  }

  return <HomeScreen />;
}
