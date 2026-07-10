import { clsx, type ClassValue } from "clsx";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SharePlatform = "facebook" | "whatsapp";

type ShareInviteParams = {
  platform: SharePlatform;
  inviteUrl: string;
  message: string;
  title?: string;
};

export const shareInvite = async ({
  platform,
  inviteUrl,
  message,
  title = "Draw Name Invitation",
}: ShareInviteParams): Promise<boolean> => {
  if (typeof window === "undefined") {
    return false;
  }

  const trimmedInviteUrl = inviteUrl?.trim();
  const trimmedMessage = message?.trim();

  if (!trimmedInviteUrl) {
    toast.error("Unable to resolve this invitation link right now.");
    return false;
  }

  try {
    new URL(trimmedInviteUrl);
  } catch {
    toast.error("The invitation link is invalid.");
    return false;
  }

  const fullMessage = trimmedMessage
    ? `${trimmedMessage}\n\n${trimmedInviteUrl}`
    : trimmedInviteUrl;

  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigator.userAgent,
  );

  /*
   * Open the native mobile share menu first.
   */
  if (isMobileDevice && typeof navigator.share === "function") {
    const shareData: ShareData = {
      title,
      text: trimmedMessage || title,
      url: trimmedInviteUrl,
    };

    const canShare =
      typeof navigator.canShare !== "function" || navigator.canShare(shareData);

    if (canShare) {
      try {
        await navigator.share(shareData);

        toast.success("Invitation shared successfully.");
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return false;
        }

        console.error("Native sharing failed:", error);
      }
    }
  }

  const shareUrl =
    platform === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(fullMessage)}`
      : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          trimmedInviteUrl,
        )}`;

  /*
   * Do not add noopener or noreferrer here because Chrome may return null
   * even when the popup opened successfully.
   */
  const shareWindow = window.open(
    shareUrl,
    `${platform}-share-window`,
    "width=700,height=650,resizable=yes,scrollbars=yes",
  );

  if (!shareWindow) {
    toast.error(
      `Unable to open ${
        platform === "whatsapp" ? "WhatsApp" : "Facebook"
      }. Please allow pop-ups and try again.`,
    );

    return false;
  }

  /*
   * Disconnect the opened page from your application for security.
   */
  try {
    shareWindow.opener = null;
  } catch {
    // Some browsers prevent changing opener for cross-origin windows.
  }

  shareWindow.focus();

  toast.success(
    `${platform === "whatsapp" ? "WhatsApp" : "Facebook"} sharing opened.`,
  );

  return true;
};
