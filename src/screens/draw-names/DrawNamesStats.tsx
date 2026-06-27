import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useDrawNameMetricsQuery } from "@/features/draw-name-events/hooks/useDrawNameMetricsQuery";

function GiftBoxStatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.333 9.167v6.666c0 .442.176.866.488 1.179.313.312.737.488 1.179.488h10c.442 0 .866-.176 1.178-.488.313-.313.489-.737.489-1.179V9.167"
        stroke="#3300C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.583c0-.773-.308-1.515-.854-2.061a2.917 2.917 0 0 0-2.063-.855c-.552 0-1.082.22-1.473.61a2.083 2.083 0 0 0-.61 1.473A2.083 2.083 0 0 0 7.083 5.833H10m0-1.25v1.25m0-1.25c0-.773.307-1.515.854-2.061a2.917 2.917 0 0 1 2.063-.855c.552 0 1.082.22 1.473.61.39.391.61.921.61 1.473 0 .273-.053.544-.158.794s-.26.477-.452.668c-.193.193-.422.346-.674.45-.252.105-.523.158-.795.158H10"
        stroke="#3300C9"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.167V17.5M2.5 5.833h15v3.334h-15V5.833Z"
        stroke="#3300C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarStatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="2.917"
        y="4.167"
        width="14.167"
        height="13.333"
        rx="2"
        stroke="#1FAB54"
        strokeWidth="1.4"
      />
      <path
        d="M2.917 8.333h14.166M6.667 2.5v3.333M13.333 2.5v3.333"
        stroke="#1FAB54"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NamesStatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14.167 17.5v-1.667a3.333 3.333 0 0 0-3.334-3.333H5a3.333 3.333 0 0 0-3.333 3.333V17.5"
        stroke="#C28A00"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="7.917"
        cy="6.25"
        r="3.333"
        stroke="#C28A00"
        strokeWidth="1.4"
      />
      <path
        d="M18.333 17.5v-1.667a3.333 3.333 0 0 0-2.5-3.225M13.333 2.608a3.333 3.333 0 0 1 0 6.459"
        stroke="#C28A00"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendStatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="m2.5 14.583 5-5 3.333 3.334L17.5 6.25"
        stroke="#E04F4F"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 6.25h5v5"
        stroke="#E04F4F"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ParticipatedStatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.25 10a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm7.5 1.25a2.917 2.917 0 1 0 0-5.833 2.917 2.917 0 0 0 0 5.833Z"
        stroke="#0067C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.667 17.5v-.833a5 5 0 0 1 5-5h1.666a5 5 0 0 1 5 5v.833M12.5 17.5v-.833a4.167 4.167 0 0 1 4.167-4.167"
        stroke="#0067C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type StatCardProps = {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
};

const DrawNamesStatsInner = () => {
  const { data: metrics = null } = useDrawNameMetricsQuery(true);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const d = metrics ?? {
    totalGifts: { value: 0, percentageChangeThisMonth: 0 },
    activeDrawNames: { value: 0, newThisWeek: 0 },
    totalDrawNamesParticipated: { value: 0 },
    totalNames: { value: 0 },
    activeMembers: { value: 0 },
  };

  const stats: StatCardProps[] = [
    {
      icon: <GiftBoxStatIcon />,
      iconBg: "#EFE6FD",
      value: String(d.totalGifts.value),
      label: "Total Gifts",
      hint: d.totalGifts.percentageChangeThisMonth
        ? `+${d.totalGifts.percentageChangeThisMonth}% this month`
        : undefined,
      hintColor: "#24A959",
    },
    {
      icon: <CalendarStatIcon />,
      iconBg: "#D9F4E2",
      value: String(d.activeDrawNames?.value),
      label: "Active Draw Names",
      hint: d.activeDrawNames?.newThisWeek
        ? `+${d.activeDrawNames?.newThisWeek} new this week`
        : undefined,
      hintColor: "#24A959",
    },
    {
      icon: <NamesStatIcon />,
      iconBg: "#FCEEC8",
      value: String(d.totalDrawNamesParticipated?.value),
      label: "Total Draw Names",
    },
    {
      icon: <TrendStatIcon />,
      iconBg: "#FDE0DE",
      value: String(d.activeMembers?.value),
      label: "Active Members",
    },
  ];

  return (
    <>
      {/* Carousel for mobile */}
      <div className="sm:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 flex-[0_0_100%]">
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid for tablet and above */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </>
  );
};

function StatCard({
  icon,
  iconBg,
  value,
  label,
  hint,
  hintColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)]">
      <div className="flex items-start justify-between">
        <span
          className="flex size-10 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </span>

        <button
          type="button"
          aria-label="More options"
          className="text-[#9A97A5] transition-colors hover:text-[#434343]"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="mt-5 text-[34px] font-bold leading-none tracking-[-0.02em] text-[#1e1e1e]">
        {value}
      </p>

      <p className="mt-2 text-[13px] font-medium text-[#7d7d7d]">{label}</p>

      {hint ? (
        <p
          className="mt-2 text-[12px] font-medium"
          style={{ color: hintColor ?? "#24A959" }}
        >
          {hint}
        </p>
      ) : (
        <p className="mt-2 h-[15px]" aria-hidden="true" />
      )}
    </div>
  );
}

export default function DrawNamesStats() {
  return <DrawNamesStatsInner />;
}
