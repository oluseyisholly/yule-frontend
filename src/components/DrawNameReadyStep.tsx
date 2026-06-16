"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";

type DrawNameReadyStepProps = {
  eventName: string;
  onBack: () => void;
  onDrawName: () => void;
  isDrawing?: boolean;
};

export default function DrawNameReadyStep({
  eventName,
  onBack,
  onDrawName,
  isDrawing = false,
}: DrawNameReadyStepProps) {
  return (
    <div className="space-y-8 pt-1 sm:space-y-10">
      <div className="space-y-3">
        <p className="max-w-[640px] text-[20px] font-semibold leading-[1.35] text-[#434343] sm:text-[24px] lg:text-[28px]">
          {eventName} is all set up! 😊
        </p>
        <p className="text-[18px] font-normal leading-[1.3] text-[#434343] sm:text-[20px] lg:text-[24px]">
          Now, proceed to draw name.
        </p>
      </div>

      <ModalButton
        type="button"
        onClick={onDrawName}
        disabled={isDrawing}
        className="w-full rounded-[18px]"
      >
        {isDrawing ? "Drawing..." : "Draw a name"}
      </ModalButton>

      <div className="flex justify-center pt-4">
        <BackButton
          onClick={onBack}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />
      </div>
    </div>
  );
}
