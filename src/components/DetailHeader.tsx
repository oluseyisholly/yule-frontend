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
  actions?: ReactNode;
  className?: string;
};

function DetailHeaderAvatar({ avatar }: { avatar: DetailHeaderAvatar }) {
  return (
    <span
      className="flex size-[140px] shrink-0 items-center justify-center rounded-full text-[40px] font-semibold"
      style={{
        backgroundColor: avatar.bg,
        color: avatar.color,
      }}
    >
      {avatar.initials}
    </span>
  );
}

export default function DetailHeader({
  title,
  subtitle,
  meta,
  avatar,
  actions,
  className,
}: DetailHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-4">
        <DetailHeaderAvatar avatar={avatar} />

        <div>
          <h1 className="text-xl font-semibold text-[#1E1E1E]">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#7D7D7D]">{subtitle}</p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">{meta}</div>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
