"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { cn } from "@/lib/utils";

type FlowActionButtonsProps = {
  onBack?: () => void;
  onNext: () => void;
  onSaveAndContinue?: () => void;
  nextLabel?: string;
  saveAndContinueLabel?: string;
  nextDisabled?: boolean;
  isSaveAndContinuePending?: boolean;
  showBack?: boolean;
  stackSaveAndContinue?: boolean;
  inlineActions?: boolean;
  className?: string;
  nextClassName?: string;
  saveClassName?: string;
  backClassName?: string;
};

export default function FlowActionButtons({
  onBack,
  onNext,
  onSaveAndContinue,
  nextLabel = "Next",
  saveAndContinueLabel = "Save & Continue",
  nextDisabled = false,
  isSaveAndContinuePending = false,
  showBack = true,
  stackSaveAndContinue = true,
  inlineActions = false,
  className,
  nextClassName,
  saveClassName,
  backClassName,
}: FlowActionButtonsProps) {
  const saveButton = onSaveAndContinue ? (
    <ModalButton
      type="button"
      onClick={onSaveAndContinue}
      disabled={nextDisabled || isSaveAndContinuePending}
      className={cn(
        stackSaveAndContinue
          ? "h-[38px] w-full"
          : "h-[38px] !w-fit min-w-[140px] px-6",
        saveClassName,
      )}
    >
      {isSaveAndContinuePending ? "Saving..." : saveAndContinueLabel}
    </ModalButton>
  ) : null;

  return (
    <div className={cn("space-y-3 pt-4", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap",
          inlineActions && "flex-nowrap",
        )}
      >
        {showBack && onBack ? (
          <BackButton
            onClick={onBack}
            className={cn(
              "flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]",
              backClassName,
            )}
            iconClassName="size-[24px]"
          />
        ) : null}

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={nextDisabled || isSaveAndContinuePending}
          className={cn("h-[38px] !w-fit min-w-[96px] px-6", nextClassName)}
        >
          {nextLabel}
        </ModalButton>

        {!stackSaveAndContinue ? saveButton : null}
      </div>

      {stackSaveAndContinue ? saveButton : null}
    </div>
  );
}
