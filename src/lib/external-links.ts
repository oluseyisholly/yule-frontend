const DEFAULT_AUTH_APP_BASE_URL = "http://localhost:4000";
export const DASHBOARD_URL = "/dashboard";

export const AUTH_APP_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_BASE_URL?.replace(/\/$/, "") ||
  DEFAULT_AUTH_APP_BASE_URL;

export const YULE_SIGN_IN_URL = `${AUTH_APP_BASE_URL}/signin?source=yule`;
export const YULE_SIGN_UP_URL = `${AUTH_APP_BASE_URL}/signup?source=yule`;

export function getAuthAwareCtaHref(
  isAuthenticated: boolean,
  guestHref: string,
) {
  return isAuthenticated ? DASHBOARD_URL : guestHref;
}
