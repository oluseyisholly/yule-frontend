"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { Input } from "@/components/ui/input";

type GroupNameStepProps = {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onGoToEventName?: () => void;
  title?: string;
  description?: string;
  placeholder?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export default function GroupNameStep({
  value,
  onChange,
  onBack,
  onNext,
  onGoToEventName,
  title = "Your group is almost set up.",
  description = "We thought to suggest the name below for your group. Feel free to edit as you see fit.",
  placeholder = "Write group name",
  nextLabel = "Next",
  nextDisabled = false,
}: GroupNameStepProps) {
  return (
    <div className="space-y-10 pt-1">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-[24px] font-semibold leading-[1.35] text-[#434343] sm:text-[28px]">
            {title}
          </p>
          <p className="max-w-[420px] text-[14px]] leading-[1.45] text-[#666666]">
            {description}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-[42px] rounded-[8px] border-[#ECE8F7] bg-white px-4 text-[15px] text-[#434343] shadow-none placeholder:text-[#B5B0C8] focus-visible:ring-0"
          />

          {/* <div className="flex items-center justify-center gap-3 text-[#3300C9]">
            <button
              type="button"
              onClick={onGoToEventName}
              className="text-[12px] font-medium transition-colors hover:text-[#2D00B4]"
            >
              Last minute changes of mind on name of event?
            </button>
            <button
              type="button"
              onClick={onGoToEventName}
              className="inline-flex h-5 w-7 items-center justify-center rounded-full bg-[#3300C9] text-white transition-colors hover:bg-[#2D00B4]"
              aria-label="Go back to event name"
            >
              <ArrowRightIcon className="size-3.5" />
            </button>
          </div> */}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <BackButton
          onClick={onBack}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="max-w-[152px] !h-[38px] "
        >
          {nextLabel}
        </ModalButton>
      </div>
    </div>
  );
}
