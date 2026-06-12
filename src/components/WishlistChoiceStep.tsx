"use client";

import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";

type WishlistChoiceStepProps = {
  title?: string;
  value: "yes" | "no";
  onChange: (value: "yes" | "no") => void;
  onYes?: () => void;
  onNo?: () => void;
  onBack?: () => void;
  isPending?: boolean;
};

export default function WishlistChoiceStep({
  title = "Would you like to make your wishlist",
  value,
  onChange,
  onYes,
  onNo,
  onBack,
  isPending = false,
}: WishlistChoiceStepProps) {
  return (
    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center space-y-9 py-10 text-center">
      <p className="text-[20px] font-medium leading-[1.3] text-[#434343] sm:text-[24px]">
        {title}
      </p>

      <div className="w-full space-y-3">
        <ModalButton
          type="button"
          onClick={() => {
            onChange("yes");
            onYes?.();
          }}
          disabled={isPending}
          variant={value === "yes" ? "primary" : "secondary"}
          className="w-full rounded-[18px]"
        >
          {isPending && value === "yes" ? "Saving..." : "Yes"}
        </ModalButton>

        <ModalButton
          type="button"
          onClick={() => {
            onChange("no");
            onNo?.();
          }}
          disabled={isPending}
          variant={value === "no" ? "primary" : "secondary"}
          className="w-full rounded-[18px]"
        >
          No
        </ModalButton>
      </div>

      {onBack ? (
        <div className="flex justify-center pt-2">
          <BackButton
            onClick={onBack}
            disabled={isPending}
            className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
            iconClassName="size-[24px]"
          />
        </div>
      ) : null}
    </div>
  );
}
