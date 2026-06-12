"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "yule-auth-storage";

type AuthStoreState = {
  user: Omit<AuthUser, "token"> | null;
  token: string | null;
  currentContactId: string | null;
  isAuthenticated: boolean;
  setAuthSession: (authUser: AuthUser) => void;
  setCurrentContactId: (contactId: string | null) => void;
  clearAuthSession: () => void;
};

const initialAuthState = {
  user: null,
  token: null,
  currentContactId: null,
  isAuthenticated: false,
} satisfies Pick<
  AuthStoreState,
  "user" | "token" | "currentContactId" | "isAuthenticated"
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
          },
          token: authUser.token,
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
        currentContactId: state.currentContactId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

type PersistedAuthSnapshot = {
  state?: Pick<
    AuthStoreState,
    "user" | "token" | "currentContactId" | "isAuthenticated"
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
