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
  isSsoSigningIn: boolean;
  setAuthSession: (authUser: AuthUser) => void;
  setSsoSigningIn: (value: boolean) => void;
  setCurrentContactId: (contactId: string | null) => void;
  updateUserProfile: (
    payload: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      businessCity: string;
      state: string;
      country: string;
      currency: string;
      profilePhotoUrl: string | null;
      address: string;
    }>,
  ) => void;
  clearAuthSession: () => void;
};

const initialAuthState = {
  user: null,
  token: null,
  refreshToken: null,
  profile: null,
  currentContactId: null,
  isAuthenticated: false,
  isSsoSigningIn: false,
} satisfies Pick<
  AuthStoreState,
  | "user"
  | "token"
  | "refreshToken"
  | "profile"
  | "currentContactId"
  | "isAuthenticated"
  | "isSsoSigningIn"
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
      setSsoSigningIn: (value) => set({ isSsoSigningIn: value }),
      setCurrentContactId: (contactId) => set({ currentContactId: contactId }),
      updateUserProfile: (payload) =>
        set((state) => {
          if (!state.user) {
            return state;
          }

          const nextProfile = state.user.profile
            ? {
                ...state.user.profile,
                businessCity:
                  payload.businessCity ?? state.user.profile.businessCity,
                state: payload.state ?? state.user.profile.state,
                country: payload.country ?? state.user.profile.country,
                currency: payload.currency ?? state.user.profile.currency,
                profilePhotoUrl:
                  payload.profilePhotoUrl ?? state.user.profile.profilePhotoUrl,
                address: payload.address ?? state.user.profile.address,
                accountId: {
                  ...state.user.profile.accountId,
                  firstName:
                    payload.firstName ?? state.user.profile.accountId.firstName,
                  lastName:
                    payload.lastName ?? state.user.profile.accountId.lastName,
                  email: payload.email ?? state.user.profile.accountId.email,
                  phoneNumber:
                    payload.phoneNumber ??
                    state.user.profile.accountId.phoneNumber,
                },
              }
            : state.user.profile;

          return {
            user: {
              ...state.user,
              ...payload,
              profile: nextProfile,
            },
            profile: nextProfile,
          };
        }),
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

export function getStoredAuthStateSnapshot() {
  const inMemoryState = useAuthStore.getState();
  const persistedState = getPersistedAuthSnapshot()?.state;

  return {
    user: inMemoryState.user ?? persistedState?.user ?? null,
    token: inMemoryState.token ?? persistedState?.token ?? null,
    refreshToken:
      inMemoryState.refreshToken ?? persistedState?.refreshToken ?? null,
    profile: inMemoryState.profile ?? persistedState?.profile ?? null,
    currentContactId:
      inMemoryState.currentContactId ?? persistedState?.currentContactId ?? null,
    isAuthenticated:
      inMemoryState.isAuthenticated || Boolean(persistedState?.isAuthenticated),
  };
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
