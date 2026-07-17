import { YULE_SIGN_IN_URL } from "@/lib/external-links";

export function buildSignedInInviteUrl(redirectPath: string) {
  if (!redirectPath.trim()) {
    return "";
  }

  const redirectUrl =
    typeof window === "undefined"
      ? redirectPath
      : new URL(redirectPath, window.location.origin).toString();
  const signInUrl = YULE_SIGN_IN_URL?.trim() ?? "";

  if (!signInUrl || signInUrl.startsWith("undefined/")) {
    return redirectUrl;
  }

  return `${signInUrl}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
}

export function buildInviteShareMessage(title: string, inviteUrl: string) {
  const resolvedTitle = title.trim() || "this event";
  const resolvedInviteUrl = inviteUrl.trim();

  return `You have been invited to join ${resolvedTitle} on Festa.\n\nSign in with the link below to view the event and participate:\n${resolvedInviteUrl}`;
}
