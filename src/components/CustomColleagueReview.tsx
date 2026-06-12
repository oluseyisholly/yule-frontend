"use client";

import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import BackButton from "@/components/BackButton";

export type CustomColleagueReviewItem = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type CustomColleagueReviewProps = {
  greetingName: string;
  items: CustomColleagueReviewItem[];
  onAddNew: () => void;
  onBack: () => void;
  onNext: () => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  nextDisabled?: boolean;
};

function ReviewItem({
  item,
  onEdit,
  onDelete,
}: {
  item: CustomColleagueReviewItem;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
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
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${item.name}`}
              className="inline-flex size-5 items-center justify-center rounded-full bg-[#FDE7E7] text-[#D94C4C] transition-colors hover:bg-[#F8D9D9]"
            >
              <Trash2Icon className="size-3" />
            </button>
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
  onAddNew,
  onBack,
  onNext,
  onEdit,
  onDelete,
  nextDisabled = false,
}: CustomColleagueReviewProps) {
  return (
    <div className="space-y-5 pt-1">
      <div>
        <p className="text-[20px] font-semibold leading-tight text-[#434343] sm:text-[24px]">
          Hey {greetingName},
        </p>
        <p className="mt-1 text-[18px] font-normal text-[#434343]">
          Who&apos;d you like to draw names with?
        </p>
      </div>

      <button
        type="button"
        onClick={onAddNew}
        className="inline-flex items-center gap-2 text-[16px] font-medium text-[#5F33FF] transition-colors hover:text-[#4A22E8]"
      >
        <PlusIcon className="size-4" />
        Add New
      </button>

      <div className="space-y-2 scrollbar-thin max-h-[240px] overflow-y-auto pr-1">
        {items.map((item) => (
          <ReviewItem
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <BackButton
          onClick={onBack}
          className="flex h-[40px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[22px]"
        />

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex h-[40px] min-w-[108px] items-center justify-center rounded-[14px] bg-[#3300C9] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#2D00B4] disabled:cursor-not-allowed disabled:bg-[#BEB3EE]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
