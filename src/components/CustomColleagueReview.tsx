"use client";

import { PencilIcon, PlusIcon, RefreshCcwIcon, Trash2Icon } from "lucide-react";
import FlowActionButtons from "@/components/FlowActionButtons";

export type CustomColleagueReviewItem = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  actionLabel?: string;
};

type CustomColleagueReviewProps = {
  greetingName: string;
  items: CustomColleagueReviewItem[];
  prompt?: string;
  onAddNew?: () => void;
  onBack: () => void;
  onNext: () => void;
  onSaveAndContinue?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onItemAction?: (id: string) => void;
  topActionLabel?: string;
  onTopAction?: () => void;
  topActionIcon?: "add" | "replace";
  nextDisabled?: boolean;
  nextLabel?: string;
  saveAndContinueLabel?: string;
  isSaveAndContinuePending?: boolean;
  hideItemActions?: boolean;
};

function ReviewItem({
  item,
  onEdit,
  onDelete,
  onItemAction,
  hideActions = false,
}: {
  item: CustomColleagueReviewItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onItemAction?: (id: string) => void;
  hideActions?: boolean;
}) {
  return (
    <div className="rounded-[10px] border border-[#ECE8F7] bg-white p-1.5">
      <div className="flex h-[30px] items-center justify-between rounded-[6px] bg-[#F1F1F1] px-3">
        <span className="truncate text-[12px] font-medium text-[#8A8A8A]">
          {item.name}
        </span>

        {item.isAdmin ? (
          <span className="inline-flex h-[18px] items-center justify-center rounded-[4px] bg-[#3300C9] px-2 text-[10px] font-medium text-white">
            Admin
          </span>
        ) : item.actionLabel && onItemAction ? (
          <button
            type="button"
            onClick={() => onItemAction(item.id)}
            className="inline-flex items-center rounded-full bg-[#F3EFFB] px-2.5 py-1 text-[10px] font-medium text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          >
            {item.actionLabel}
          </button>
        ) : hideActions ? (
          <span />
        ) : (
          <span className="inline-flex items-center gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(item.id)}
                aria-label={`Edit ${item.name}`}
                className="inline-flex size-5 items-center justify-center rounded-full bg-[#E6E0FF] text-[#3300C9] transition-colors hover:bg-[#D8D0FB]"
              >
                <PencilIcon className="size-3" />
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.name}`}
                className="inline-flex size-5 items-center justify-center rounded-full bg-[#FDE7E7] text-[#D94C4C] transition-colors hover:bg-[#F8D9D9]"
              >
                <Trash2Icon className="size-3" />
              </button>
            ) : null}
          </span>
        )}
      </div>

      <div className="mt-1 flex h-[30px] items-center rounded-[6px] bg-[#F1F1F1] px-3">
        <span className="truncate text-[12px] text-[#8A8A8A]">
          {item.email}
        </span>
      </div>
    </div>
  );
}

export default function CustomColleagueReview({
  greetingName,
  items,
  prompt = "Who'd you like to draw names with?",
  onAddNew,
  onBack,
  onNext,
  onSaveAndContinue,
  onEdit,
  onDelete,
  onItemAction,
  topActionLabel,
  onTopAction,
  topActionIcon = "add",
  nextDisabled = false,
  nextLabel = "Next",
  saveAndContinueLabel = "Save & Continue",
  isSaveAndContinuePending = false,
  hideItemActions = false,
}: CustomColleagueReviewProps) {
  const TopActionIcon = topActionIcon === "replace" ? RefreshCcwIcon : PlusIcon;

  return (
    <div className="space-y-5 pt-1">
      <div>
        <p className="text-[20px] font-semibold leading-tight text-[#434343] sm:text-[24px]">
          Hey {greetingName},
        </p>
        <p className="mt-1 text-[18px] font-normal text-[#434343]">
          {prompt}
        </p>
      </div>

      {topActionLabel && onTopAction ? (
        <button
          type="button"
          onClick={onTopAction}
          className="inline-flex items-center gap-2 text-[16px] font-medium text-[#5F33FF] transition-colors hover:text-[#4A22E8]"
        >
          <TopActionIcon className="size-4" />
          {topActionLabel}
        </button>
      ) : onAddNew ? (
        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center gap-2 text-[16px] font-medium text-[#5F33FF] transition-colors hover:text-[#4A22E8]"
        >
          <PlusIcon className="size-4" />
          Add New
        </button>
      ) : null}

      <div className="space-y-2 scrollbar-thin max-h-[240px] overflow-y-auto pr-1">
        {items.map((item) => (
          <ReviewItem
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onItemAction={onItemAction}
            hideActions={hideItemActions}
          />
        ))}
      </div>

      <FlowActionButtons
        onBack={onBack}
        onNext={onNext}
        onSaveAndContinue={onSaveAndContinue}
        nextLabel={nextLabel}
        saveAndContinueLabel={saveAndContinueLabel}
        nextDisabled={nextDisabled}
        isSaveAndContinuePending={isSaveAndContinuePending}
      />
    </div>
  );
}
