"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import ExclusionIcon from "@/components/icons/ExclusionIcon";

type ExclusionChoiceStepProps = {
  value: "yes" | "no" | "";
  onChange: (value: "yes" | "no") => void;
  onBack: () => void;
  onNext: () => void;
};

export default function ExclusionChoiceStep({
  value,
  onChange,
  onBack,
  onNext,
}: ExclusionChoiceStepProps) {
  return (
    <div className="space-y-3 pt-1">
      <div className="rounded-[12px] bg-[#FFF0EE] px-5 py-3 text-center text-[14px] font-medium text-[#FF6A5C]">
        There must be at least 4 members for an exclusion to happen.
      </div>

      <div className="space-y-4 text-center">
        <p className="text-[16px] font-normal leading-[1.35] text-[#434343] sm:text-[20px]">
          Since the goal is to evoke pleasant surprises, we figured there might
          be people you might not want to pair with each other.
        </p>

        <div className="inline-flex items-center justify-center gap-2 text-center">
          <p className="text-[20px] font-semibold leading-tight text-[#111111] sm:text-[22px]">
            Would you like to make exclusion?
          </p>
          <ExclusionIcon className="size-5" />
        </div>
      </div>

      <div className="space-y-3">
        <ModalButton
          type="button"
          onClick={() => onChange("yes")}
          variant={value === "yes" ? "primary" : "secondary"}
          className="w-full"
        >
          Yes
        </ModalButton>

        <ModalButton
          type="button"
          onClick={() => onChange("no")}
          variant={value === "no" ? "primary" : "secondary"}
          className="w-full"
        >
          No
        </ModalButton>
      </div>

      <div className="flex  items-center justify-center gap-3 pt-4">
        <BackButton
          onClick={onBack}
          className="flex  min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[22px]"
        />

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={!value}
          className="max-w-[20px] !h-[37px]"
        >
          Next
        </ModalButton>
      </div>
    </div>
  );
}
