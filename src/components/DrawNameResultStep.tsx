"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";

type DrawNameResultStepProps = {
  selectedName: string;
  onBack: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel?: string;
  pendingPrimaryActionLabel?: string;
  isPrimaryActionPending?: boolean;
};

export default function DrawNameResultStep({
  selectedName,
  onBack,
  onPrimaryAction,
  primaryActionLabel = "Invite Members",
  pendingPrimaryActionLabel = "Saving...",
  isPrimaryActionPending = false,
}: DrawNameResultStepProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[18px] sm:rounded-[20px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/draw-result-confetti.svg')] bg-center bg-no-repeat bg-[length:100%_100%]"
      />

      <div className="relative z-10 px-4 py-6 sm:px-10 sm:py-10">
        <div className="space-y-8 pt-2 sm:space-y-10 sm:pt-6">
          <div className="space-y-4 text-center">
            <p className="text-[18px] font-normal leading-[1.3] text-[#434343] sm:text-[24px]">
              Your draw result is
            </p>
            <p className="text-[22px] font-semibold leading-none text-[#111111] sm:text-[28px]">
              {selectedName}
            </p>
          </div>

          <div className="mx-auto max-w-[390px]">
            <ModalButton
              type="button"
              onClick={onPrimaryAction}
              disabled={isPrimaryActionPending}
              className="w-full rounded-[18px]"
            >
              {isPrimaryActionPending
                ? pendingPrimaryActionLabel
                : primaryActionLabel}
            </ModalButton>
          </div>

          <div className="flex justify-center pt-2">
            <BackButton
              onClick={onBack}
              className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              iconClassName="size-[24px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
