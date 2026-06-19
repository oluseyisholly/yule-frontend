"use client";

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import {
  clearStoredAuthSession,
  getStoredAuthToken,
} from "@/stores/auth-store";

const LANDING_PAGE_ROUTE = "/";
const PENDING_TOAST_STORAGE_KEY = "yule_pending_api_toast";
const TOKEN_STORAGE_KEYS = [
  "accessToken",
  "authToken",
  "token",
  "yule_access_token",
] as const;

type LogoutHandler = () => void;
type TokenResolver = () => string | null;
type ToastVariant = "error" | "success";

export type ApiRequestConfig<TPayload = unknown> =
  AxiosRequestConfig<TPayload> & {
    skipAuthLogout?: boolean;
  };

type PendingToast = {
  id?: string;
  message: string;
  type: ToastVariant;
};

export class ApiRequestError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      details?: unknown;
      isNetworkError?: boolean;
    },
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

let logoutHandler: LogoutHandler | null = null;
let tokenResolver: TokenResolver | null = null;
let isLoggingOut = false;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function isBrowser() {
  return typeof window !== "undefined";
}

function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  for (const key of TOKEN_STORAGE_KEYS) {
    const token =
      window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
}

function clearStoredAuthState() {
  if (!isBrowser()) {
    return;
  }

  for (const key of TOKEN_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

function defaultLogout() {
  if (!isBrowser() || isLoggingOut) {
    return;
  }

  isLoggingOut = true;
  clearStoredAuthSession();
  clearStoredAuthState();
  window.location.assign(LANDING_PAGE_ROUTE);
}

function resolveToken() {
  return tokenResolver?.() ?? getStoredAuthToken() ?? getStoredToken();
}

function savePendingToast(toastPayload: PendingToast) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(
    PENDING_TOAST_STORAGE_KEY,
    JSON.stringify(toastPayload),
  );
}

function showToastMessage(message: string, type: ToastVariant, id?: string) {
  if (!isBrowser()) {
    return;
  }

  const toastOptions = id ? { id } : undefined;

  if (type === "success") {
    toast.success(message, toastOptions);
    return;
  }

  toast.error(message, toastOptions);
}

function normalizeApiError(error: AxiosError) {
  const status = error.response?.status;
  const message =
    (typeof error.response?.data === "object" &&
      error.response?.data &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string" &&
      error.response.data.message) ||
    error.message ||
    "Something went wrong while processing your request.";

  return new ApiRequestError(message, {
    status,
    code: error.code,
    details: error.response?.data,
    isNetworkError: false,
  });
}

function normalizeNetworkError(error: AxiosError) {
  return new ApiRequestError(
    "Network failure. Please check your internet connection and try again.",
    {
      code: error.code ?? "ERR_NETWORK",
      details: error.cause,
      isNetworkError: true,
    },
  );
}

function isNetworkFailure(error: AxiosError) {
  return (
    !error.response &&
    (error.code === "ERR_NETWORK" || error.message === "Network Error")
  );
}

function handleUnauthorized() {
  const message = "Your session has expired. Please log in again.";

  if (logoutHandler) {
    showToastMessage(message, "error", "api-session-expired");
    logoutHandler();
    return;
  }

  savePendingToast({
    id: "api-session-expired",
    message,
    type: "error",
  });
  defaultLogout();
}

function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const token = resolveToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
}

function handleResponseError(error: AxiosError) {
  const requestConfig = error.config as ApiRequestConfig | undefined;

  if (isNetworkFailure(error)) {
    const normalizedError = normalizeNetworkError(error);
    showToastMessage(normalizedError.message, "error", "api-network-failure");
    return Promise.reject(normalizedError);
  }

  if (error.response?.status === 401) {
    if (requestConfig?.skipAuthLogout) {
      return Promise.reject(normalizeApiError(error));
    }

    handleUnauthorized();

    return Promise.reject(
      new ApiRequestError("Your session has expired. Please log in again.", {
        status: 401,
        code: error.code,
        details: error.response.data,
      }),
    );
  }

  return Promise.reject(normalizeApiError(error));
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use(attachAuthHeader);
  client.interceptors.response.use((response) => response, handleResponseError);

  return client;
}

export const apiClient = createApiClient();

export function setApiLogoutHandler(handler: LogoutHandler | null) {
  logoutHandler = handler;
}

export function setApiTokenResolver(resolver: TokenResolver | null) {
  tokenResolver = resolver;
}

export function resetApiLogoutState() {
  isLoggingOut = false;
}

export function consumePendingApiToast() {
  if (!isBrowser()) {
    return null;
  }

  const storedToast = window.sessionStorage.getItem(PENDING_TOAST_STORAGE_KEY);

  if (!storedToast) {
    return null;
  }

  window.sessionStorage.removeItem(PENDING_TOAST_STORAGE_KEY);

  try {
    return JSON.parse(storedToast) as PendingToast;
  } catch {
    return null;
  }
}

export async function postApi<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: ApiRequestConfig<TPayload>,
) {
  const response = await apiClient.post<TResponse>(url, payload, config);
  return response.data;
}

export async function getApi<TResponse>(
  url: string,
  config?: ApiRequestConfig,
) {
  const response = await apiClient.get<TResponse>(url, config);
  return response.data;
}

export async function patchApi<TResponse, TPayload = unknown>(
  url: string,
  payload?: TPayload,
  config?: ApiRequestConfig<TPayload>,
) {
  const response = await apiClient.patch<TResponse>(url, payload, config);
  return response.data;
}

export async function deleteApi<TResponse>(
  url: string,
  config?: ApiRequestConfig,
) {
  const response = await apiClient.delete<TResponse>(url, config);
  return response.data;
}
