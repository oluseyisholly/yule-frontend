"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type GiftBudgetOptionKey =
  | "under-10000"
  | "10000-25000"
  | "25000-50000"
  | "50000-100000"
  | "100000-250000"
  | "250000-500000"
  | "500000-plus"
  | "custom";

type BudgetRange = {
  minimumGiftBudget: number | null;
  maximumGiftBudget: number | null;
};

type GiftBudgetStepProps = {
  selectedOption: GiftBudgetOptionKey | "";
  customMinimumValue: string;
  customMaximumValue: string;
  onSelectOption: (value: GiftBudgetOptionKey) => void;
  onCustomMinimumValueChange: (value: string) => void;
  onCustomMaximumValueChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
};

const BUDGET_OPTIONS: Array<{
  key: GiftBudgetOptionKey;
  label: string;
}> = [
  { key: "under-10000", label: "Under N10,000" },
  { key: "10000-25000", label: "N10,000 - N25,000" },
  { key: "25000-50000", label: "N25,000 - N50,000" },
  { key: "50000-100000", label: "N50,000 - N100,000" },
  { key: "100000-250000", label: "N100,000 - N250,000" },
  { key: "250000-500000", label: "N250,000 - N500,000" },
  { key: "500000-plus", label: "N500,000 +" },
  { key: "custom", label: "Custom" },
];

function formatCurrencyInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(Number(digitsOnly));
}

export function resolveGiftBudgetRange(
  selectedOption: GiftBudgetOptionKey | "",
  customMinimumValue: string,
  customMaximumValue: string,
): BudgetRange {
  const customMinimum = Number(customMinimumValue.replace(/[^\d]/g, "")) || null;
  const customMaximum = Number(customMaximumValue.replace(/[^\d]/g, "")) || null;

  switch (selectedOption) {
    case "under-10000":
      return { minimumGiftBudget: 0, maximumGiftBudget: 10000 };
    case "10000-25000":
      return { minimumGiftBudget: 10000, maximumGiftBudget: 25000 };
    case "25000-50000":
      return { minimumGiftBudget: 25000, maximumGiftBudget: 50000 };
    case "50000-100000":
      return { minimumGiftBudget: 50000, maximumGiftBudget: 100000 };
    case "100000-250000":
      return { minimumGiftBudget: 100000, maximumGiftBudget: 250000 };
    case "250000-500000":
      return { minimumGiftBudget: 250000, maximumGiftBudget: 500000 };
    case "500000-plus":
      return { minimumGiftBudget: 500000, maximumGiftBudget: null };
    case "custom":
      return {
        minimumGiftBudget: customMinimum,
        maximumGiftBudget: customMaximum,
      };
    default:
      return { minimumGiftBudget: null, maximumGiftBudget: null };
  }
}

export function deriveGiftBudgetOption(
  minimumGiftBudget?: number | null,
  maximumGiftBudget?: number | null,
): GiftBudgetOptionKey | "" {
  const minimum = minimumGiftBudget ?? null;
  const maximum = maximumGiftBudget ?? null;

  if (minimum === 0 && maximum === 10000) {
    return "under-10000";
  }

  if (minimum === 10000 && maximum === 25000) {
    return "10000-25000";
  }

  if (minimum === 25000 && maximum === 50000) {
    return "25000-50000";
  }

  if (minimum === 50000 && maximum === 100000) {
    return "50000-100000";
  }

  if (minimum === 100000 && maximum === 250000) {
    return "100000-250000";
  }

  if (minimum === 250000 && maximum === 500000) {
    return "250000-500000";
  }

  if (minimum === 500000 && maximum === null) {
    return "500000-plus";
  }

  if (minimum !== null || maximum !== null) {
    return "custom";
  }

  return "";
}

export default function GiftBudgetStep({
  selectedOption,
  customMinimumValue,
  customMaximumValue,
  onSelectOption,
  onCustomMinimumValueChange,
  onCustomMaximumValueChange,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Next",
}: GiftBudgetStepProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-2 text-center sm:min-h-[340px]">
      <div className="w-full max-w-[540px] space-y-8">
        <h2 className="mx-auto max-w-[360px] text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#1E1E1E] sm:text-[31px]">
          What&apos;s your budget?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {BUDGET_OPTIONS.map((option) => {
            const isActive = selectedOption === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelectOption(option.key)}
                className={cn(
                  "flex h-[56px] items-center justify-center rounded-[8px] bg-[#F3EFFB] px-4 text-center text-[16px] font-medium text-[#3300C9] transition-colors sm:h-[58px] sm:text-[17px]",
                  isActive &&
                    "bg-[#3300C9] text-white shadow-[0_8px_20px_rgba(51,0,201,0.18)]",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {selectedOption === "custom" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="text"
              value={customMinimumValue}
              onChange={(event) =>
                onCustomMinimumValueChange(formatCurrencyInput(event.target.value))
              }
              placeholder="Minimum amount"
              className="h-[52px] rounded-[14px] border-[#ECE8F7] bg-white px-4 text-[16px] text-[#434343] shadow-none placeholder:text-[#B5B0C8] focus-visible:ring-0"
            />
            <Input
              type="text"
              value={customMaximumValue}
              onChange={(event) =>
                onCustomMaximumValueChange(formatCurrencyInput(event.target.value))
              }
              placeholder="Maximum amount"
              className="h-[52px] rounded-[14px] border-[#ECE8F7] bg-white px-4 text-[16px] text-[#434343] shadow-none placeholder:text-[#B5B0C8] focus-visible:ring-0"
            />
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-3">
          <BackButton
            onClick={onBack}
            className="flex h-[45px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
            iconClassName="size-[24px]"
          />

          <ModalButton
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="h-[38px] !w-fit min-w-[96px] px-6"
          >
            {nextLabel}
          </ModalButton>
        </div>
      </div>
    </div>
  );
}
