"use client";

import { cn } from "@/lib/utils";

export type GiftRecipientChoiceValue = "someone-special" | "myself";

type GiftRecipientChoiceStepProps = {
  value: GiftRecipientChoiceValue;
  onChange: (value: GiftRecipientChoiceValue) => void;
};

const OPTIONS: Array<{
  value: GiftRecipientChoiceValue;
  label: string;
}> = [
  {
    value: "someone-special",
    label: "Someone special 🥰",
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
    <div className="flex min-h-[320px] flex-col items-center justify-center px-2 text-center sm:min-h-[340px]">
      <div className="w-full max-w-[410px] space-y-8">
        <h2 className="mx-auto max-w-[390px] text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#1E1E1E] sm:max-w-[320px] sm:text-[31px]">
          Who are we celebrating today?😉
        </h2>

        <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full bg-[#E7EDC7] p-2">
          {OPTIONS.map((option) => {
            const isActive = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[16px] font-medium transition-colors sm:text-[17px]",
                  isActive
                    ? "bg-[#3300C9] text-white shadow-[0_8px_20px_rgba(51,0,201,0.18)]"
                    : "bg-transparent text-[#3300C9] hover:bg-white/35",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
