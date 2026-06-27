"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { Input } from "@/components/ui/input";

type HangoutGuestCountStepProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
};

export default function HangoutGuestCountStep({
  value,
  onChange,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = "Next",
}: HangoutGuestCountStepProps) {
  return (
    <div className="space-y-8 pt-1 sm:space-y-10">
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-3">
          <p className="text-[20px] font-semibold leading-[1.35] text-[#434343] sm:text-[24px] lg:text-[28px]">
            How many guests are expected?
          </p>
          <p className="max-w-[420px] text-[14px] leading-[1.45] text-[#666666]">
            Add the number of guests for this hangout.
          </p>
        </div>

        <Input
          type="number"
          formatNumber
          inputMode="numeric"
          min="1"
          value={value}
          onChange={(event) =>
            onChange(event.target.value.replace(/[^\d]/g, ""))
          }
          placeholder="Enter number of guests"
          className="h-[46px] rounded-[8px] border-[#ECE8F7] bg-white px-4 text-[15px] text-[#434343] shadow-none placeholder:text-[#B5B0C8] focus-visible:ring-0 sm:h-[42px]"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 sm:flex-nowrap">
        <BackButton
          onClick={onBack}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="max-w-[152px] !h-[38px]"
        >
          {nextLabel}
        </ModalButton>
      </div>
    </div>
  );
}
