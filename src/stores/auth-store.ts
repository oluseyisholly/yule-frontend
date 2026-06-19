"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "yule-auth-storage";

type AuthStoreState = {
  user: Omit<AuthUser, "token"> | null;
  token: string | null;
  refreshToken: string | null;
  profile: AuthUser["profile"] | null;
  currentContactId: string | null;
  isAuthenticated: boolean;
  setAuthSession: (authUser: AuthUser) => void;
  setCurrentContactId: (contactId: string | null) => void;
  clearAuthSession: () => void;
};

const initialAuthState = {
  user: null,
  token: null,
  refreshToken: null,
  profile: null,
  currentContactId: null,
  isAuthenticated: false,
} satisfies Pick<
  AuthStoreState,
  | "user"
  | "token"
  | "refreshToken"
  | "profile"
  | "currentContactId"
  | "isAuthenticated"
>;

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      ...initialAuthState,
      setAuthSession: (authUser) =>
        set({
          user: {
            id: authUser.id,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            phoneNumber: authUser.phoneNumber,
            email: authUser.email,
            refreshToken: authUser.refreshToken ?? null,
            profileId: authUser.profileId ?? null,
            mode: authUser.mode ?? null,
            hostBusinessId: authUser.hostBusinessId ?? null,
            hostAccountId: authUser.hostAccountId ?? null,
            profile: authUser.profile ?? null,
          },
          token: authUser.token,
          refreshToken: authUser.refreshToken ?? null,
          profile: authUser.profile ?? null,
          currentContactId: null,
          isAuthenticated: true,
        }),
      setCurrentContactId: (contactId) => set({ currentContactId: contactId }),
      clearAuthSession: () => set(initialAuthState),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        profile: state.profile,
        currentContactId: state.currentContactId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

type PersistedAuthSnapshot = {
  state?: Pick<
    AuthStoreState,
    | "user"
    | "token"
    | "refreshToken"
    | "profile"
    | "currentContactId"
    | "isAuthenticated"
  >;
};

function getPersistedAuthSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const persistedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!persistedValue) {
    return null;
  }

  try {
    return JSON.parse(persistedValue) as PersistedAuthSnapshot;
  } catch {
    return null;
  }
}

export function getStoredAuthToken() {
  return useAuthStore.getState().token ?? getPersistedAuthSnapshot()?.state?.token ?? null;
}

export function getStoredCurrentContactId() {
  return (
    useAuthStore.getState().currentContactId ??
    getPersistedAuthSnapshot()?.state?.currentContactId ??
    null
  );
}

export function clearStoredAuthSession() {
  useAuthStore.getState().clearAuthSession();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}
