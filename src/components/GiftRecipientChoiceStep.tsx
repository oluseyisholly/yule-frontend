"use client";

import { cn } from "@/lib/utils";

export type GiftRecipientChoiceValue =
  | "someone-special"
  | "group"
  | "myself";

type GiftRecipientChoiceStepProps = {
  value: GiftRecipientChoiceValue;
  onChange: (value: GiftRecipientChoiceValue) => void;
};

const OPTIONS: Array<{
  value: GiftRecipientChoiceValue;
  label: string;
  emoji?: string;
}> = [
  {
    value: "someone-special",
    label: "Someone special",
    emoji: "🥰",
  },
  {
    value: "group",
    label: "Persons",
    emoji: "🎉",
  },
  {
    value: "myself",
    label: "Myself",
  },
];

export default function GiftRecipientChoiceStep({
  value,
  onChange,
}: GiftRecipientChoiceStepProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-3 text-center sm:min-h-[320px] sm:px-2">
      <div className="w-full max-w-[450px] space-y-6">
        <h2 className="mx-auto max-w-[390px] text-[20px] font-normal leading-[1.25] text-[#434343] sm:max-w-[320px] sm:text-[22px]">
          Who are we celebrating today?😉
        </h2>

        <div className="mx-auto grid w-full max-w-[360px] grid-cols-1 gap-1.5 rounded-[24px] bg-[#E7EDC7] p-1.5 sm:max-w-full sm:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_minmax(0,0.8fr)]">
          {OPTIONS.map((option) => {
            const isActive = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex min-h-[42px] w-full items-center justify-center rounded-full px-3 py-1.5 text-center text-[14px] font-medium leading-tight transition-colors sm:min-h-[42px] sm:px-3.5 sm:text-[15px]",
                  isActive
                    ? "bg-[#3300C9] text-white shadow-[0_8px_20px_rgba(51,0,201,0.18)]"
                    : "bg-transparent text-[#3300C9] hover:bg-white/35",
                )}
              >
                <span className="inline-flex items-center justify-center gap-1 whitespace-nowrap">
                  <span>{option.label}</span>
                  {option.emoji ? <span>{option.emoji}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
