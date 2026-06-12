"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import BudgetIcon from "@/components/icons/BudgetIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GiftBudgetStepProps = {
  value: string;
  customValue: string;
  onChange: (value: string) => void;
  onCustomValueChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

const BUDGET_OPTIONS = [
  "N10,000",
  "N15,000",
  "N20,000",
  "N35,000",
  "N50,000",
  "N85,000",
  "N100,000",
  "More",
] as const;

export default function GiftBudgetStep({
  value,
  customValue,
  onChange,
  onCustomValueChange,
  onBack,
  onNext,
}: GiftBudgetStepProps) {
  const isNextDisabled = !value || (value === "More" && !customValue.trim());

  return (
    <div className="mx-auto max-w-[532px] space-y-12 pt-1">
      <div className="space-y-3 text-left">
        <p className="max-w-[430px] text-[24px] font-semibold leading-[1.2] text-[#434343] sm:text-[30px]">
          We figured you might want to buy gifts for each other. 🎁
        </p>
        <div className="flex items-center gap-2">
          <BudgetIcon className="h-6 w-7 flex-shrink-0" aria-hidden />
          <p className="text-[16px] font-normal text-[#434343]">What&apos;s the maximum spend?</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {BUDGET_OPTIONS.map((option) => {
            const isActive = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option)}
                className={cn(
                  "flex h-[51px] items-center justify-center rounded-[6px] bg-[#E7E7EA] px-6 text-[22px] font-semibold text-[#3300C9] transition-colors",
                  isActive && "bg-[#3300C9] text-white",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        {value === "More" ? (
          <Input
            type="text"
            value={customValue}
            onChange={(event) => onCustomValueChange(event.target.value)}
            placeholder="Enter amount"
            className="h-[56px] rounded-[10px] border-[#ECE8F7] bg-white px-5 text-[18px] text-[#434343] shadow-none placeholder:text-[#B5B0C8] focus-visible:ring-0"
          />
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <BackButton
          onClick={onBack}
          className="flex h-[46px] max-w-[80px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="max-w-[146px] !h-[36px] px-6 text-[20px]"
        >
          Next
        </ModalButton>
      </div>
    </div>
  );
}
