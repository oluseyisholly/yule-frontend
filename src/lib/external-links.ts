export const DASHBOARD_URL = "/dashboard";

export const AUTH_APP_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_APP_BASE_URL?.replace(/\/$/, "") 
  
export const YULE_SIGN_IN_URL = `${AUTH_APP_BASE_URL}/signin?source=yule`;
export const YULE_SIGN_UP_URL = `${AUTH_APP_BASE_URL}/signup?source=yule`;

export function getAuthAwareCtaHref(
  isAuthenticated: boolean,
  guestHref: string,
) {
  return isAuthenticated ? DASHBOARD_URL : guestHref;
}
