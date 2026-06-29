"use client";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string;
  initials?: string;
  imageUrl?: string | null;
  bgColor?: string;
  textColor?: string;
  className?: string;
  textClassName?: string;
  title?: string;
};

function resolveInitials(name?: string, initials?: string) {
  if (initials?.trim()) {
    return initials.trim().toUpperCase();
  }

  const derivedInitials = (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return derivedInitials || "YU";
}

export default function UserAvatar({
  name,
  initials,
  imageUrl,
  bgColor = "#EFE6FD",
  textColor = "#3300C9",
  className,
  textClassName,
  title,
}: UserAvatarProps) {
  const resolvedImageUrl = imageUrl?.trim() || null;
  const resolvedInitials = resolveInitials(name, initials);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        className,
      )}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      title={title}
    >
      {resolvedImageUrl ? (
        <img
          src={resolvedImageUrl}
          alt={name || "Profile photo"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cn("leading-none", textClassName)}>
          {resolvedInitials}
        </span>
      )}
    </span>
  );
}
