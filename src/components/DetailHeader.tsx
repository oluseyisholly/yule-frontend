import type { ReactNode } from "react";

type DetailHeaderAvatar = {
  initials: string;
  color: string;
  bg: string;
};

type DetailHeaderProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  avatar: DetailHeaderAvatar;
  avatarBadge?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

function DetailHeaderAvatar({
  avatar,
  badge,
}: {
  avatar: DetailHeaderAvatar;
  badge?: ReactNode;
}) {
  return (
    <span className="relative flex shrink-0 items-center justify-center">
      <span
        className="flex size-[88px] items-center justify-center rounded-full text-[28px] font-semibold sm:size-[112px] sm:text-[32px] lg:size-[140px] lg:text-[40px]"
        style={{
          backgroundColor: avatar.bg,
          color: avatar.color,
        }}
      >
        {avatar.initials}
      </span>

      {badge ? (
        <span className="absolute right-0 bottom-0 translate-x-[8%] translate-y-[8%]">
          {badge}
        </span>
      ) : null}
    </span>
  );
}

export default function DetailHeader({
  title,
  subtitle,
  meta,
  avatar,
  avatarBadge,
  actions,
  className,
}: DetailHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <DetailHeaderAvatar avatar={avatar} badge={avatarBadge} />

        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#1E1E1E] sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#7D7D7D]">{subtitle}</p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">{meta}</div>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
