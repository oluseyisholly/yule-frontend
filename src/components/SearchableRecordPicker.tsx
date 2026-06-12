"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import ExclusionIcon from "@/components/icons/ExclusionIcon";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchableRecordItem = {
  id: string;
  name: string;
  subtitle: string;
  email?: string;
  createdById?: string | null;
  isManageable?: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "";
  avatar?: ReactNode;
  initials?: string;
  avatarBg?: string;
  avatarColor?: string;
};

type SearchableRecordPickerProps = {
  title: string;
  items: SearchableRecordItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  lockedSelectedIds?: string[];
  maxSelected?: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  disableLocalFiltering?: boolean;
  isLoading?: boolean;
  emptyStateText?: string;
  addActionLabel?: string;
  onAddAction?: () => void;
  onEditItem?: (item: SearchableRecordItem) => void;
  onDeleteItem?: (item: SearchableRecordItem) => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  pairedItemsById?: Record<string, SearchableRecordItem[] | undefined>;
  pairedIndicatorIdsById?: Record<string, string[] | undefined>;
  topAction?: ReactNode;
  footer?: ReactNode;
  showBottomChevron?: boolean;
  className?: string;
};

function AvatarBubble({
  item,
  className,
}: {
  item: SearchableRecordItem;
  className?: string;
}) {
  if (item.avatar) {
    return (
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-full",
          className,
        )}
      >
        {item.avatar}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full text-sm font-semibold",
        className,
      )}
      style={{
        backgroundColor: item.avatarBg ?? "#EFE6FD",
        color: item.avatarColor ?? "#3300C9",
      }}
    >
      {item.initials ?? item.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function RecordAvatar({
  item,
  pairedItems,
  pairedIndicatorIds,
}: {
  item: SearchableRecordItem;
  pairedItems?: SearchableRecordItem[];
  pairedIndicatorIds?: string[];
}) {
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const visiblePairedItems = pairedItems?.slice(0, 2) ?? [];
  const overflowCount = Math.max((pairedItems?.length ?? 0) - 2, 0);
  const stackSize = visiblePairedItems.length + (overflowCount > 0 ? 1 : 0);

  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-visible">
      <AvatarBubble item={item} className="size-12 shrink-0 text-sm" />

      {visiblePairedItems.length > 0 ? (
        <span
          className="absolute top-[37px] left-[32px] flex -translate-y-1/2 items-center"
          onMouseLeave={() => setActiveBubbleId(null)}
        >
          {visiblePairedItems.map((pairedItem, index) => {
            const shouldShowIndicator = pairedIndicatorIds?.includes(
              pairedItem.id,
            );
            const isActive = activeBubbleId === pairedItem.id;

            return (
              <span
                key={`${item.id}-${pairedItem.id}-${index}`}
                className={cn(
                  "relative overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_4px_12px_rgba(26,19,61,0.16)] transition-transform duration-150 hover:scale-105 focus-visible:scale-105",
                  index > 0 ? "-ml-[15px]" : "",
                )}
                style={{
                  zIndex: isActive
                    ? stackSize + 3
                    : index + 1,
                }}
                role="button"
                tabIndex={0}
                onMouseEnter={() => setActiveBubbleId(pairedItem.id)}
                onFocus={() => setActiveBubbleId(pairedItem.id)}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveBubbleId(pairedItem.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveBubbleId(pairedItem.id);
                  }
                }}
              >
                <AvatarBubble
                  item={pairedItem}
                  className="size-5 shrink-0 text-[9px] font-semibold"
                />

                {shouldShowIndicator ? (
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#191A1F]/45 backdrop-blur-[0.3px]">
                    <span className="scale-[0.42]">
                      <ExclusionIcon className="brightness-0 invert" />
                    </span>
                  </span>
                ) : null}
              </span>
            );
          })}

          {overflowCount > 0 ? (
            <span
              className="-ml-[15px] flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#3300C9] text-[9px] font-semibold text-white shadow-[0_4px_12px_rgba(26,19,61,0.16)] transition-transform duration-150 hover:scale-105"
              style={{ zIndex: stackSize + 1 }}
            >
              +{overflowCount}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

export default function SearchableRecordPicker({
  title,
  items,
  selectedIds,
  onSelectedIdsChange,
  lockedSelectedIds = [],
  maxSelected,
  searchPlaceholder = "",
  searchValue,
  onSearchValueChange,
  disableLocalFiltering = false,
  isLoading = false,
  emptyStateText,
  addActionLabel = "Add New",
  onAddAction,
  onEditItem,
  onDeleteItem,
  secondaryActionLabel,
  onSecondaryAction,
  pairedItemsById,
  pairedIndicatorIdsById,
  topAction,
  footer,
  showBottomChevron = true,
  className,
}: SearchableRecordPickerProps) {
  const [internalSearchValue, setInternalSearchValue] = useState("");

  const effectiveSearchValue = searchValue ?? internalSearchValue;
  const setEffectiveSearchValue = onSearchValueChange ?? setInternalSearchValue;

  const filteredItems = useMemo(() => {
    if (disableLocalFiltering) {
      return items;
    }

    const normalizedQuery = effectiveSearchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const haystack = `${item.name} ${item.subtitle}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [disableLocalFiltering, effectiveSearchValue, items]);

  const toggleItem = (id: string) => {
    const isLockedSelected = lockedSelectedIds.includes(id);

    if (selectedIds.includes(id)) {
      if (isLockedSelected) {
        return;
      }

      onSelectedIdsChange(
        selectedIds.filter((selectedId) => selectedId !== id),
      );
      return;
    }

    const nextIds = [...selectedIds, id];

    if (maxSelected && nextIds.length > maxSelected) {
      return;
    }

    onSelectedIdsChange(nextIds);
  };

  return (
    <div
      className={cn(
        "rounded-[20px] border border-[#ECE8F7] bg-white shadow-[0_14px_44px_rgba(26,19,61,0.08)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <p className="text-[18px] font-medium text-[#666666]">{title}</p>
        <ChevronUpIcon className="size-5 text-[#7D7D7D]" />
      </div>

      <div className="h-px bg-[#EEEAF7]" />

      <div className="px-5 py-4">
        <div className="relative">
          <Input
            type="text"
            value={effectiveSearchValue}
            onChange={(event) => setEffectiveSearchValue(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-[40px] w-full rounded-[16px] border border-[#ECE8F7] bg-white px-4 pr-12 text-sm text-[#434343] outline-none transition-colors placeholder:text-[#B6B2C4] focus:border-[#D6CCF5]"
          />
          {isLoading ? (
            <Spinner className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#C8C5D2]" />
          ) : (
            <SearchIcon className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#C8C5D2]" />
          )}
        </div>

        {topAction ? <div className="mt-4 flex justify-center">{topAction}</div> : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          {onAddAction ? (
            <button
              type="button"
              onClick={onAddAction}
              className="inline-flex items-center gap-3 text-[16px] font-medium text-[#7B61FF] transition-colors hover:text-[#5F44F0]"
            >
              <PlusIcon className="size-5" />
              {addActionLabel}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {secondaryActionLabel ? (
              onSecondaryAction ? (
                <button
                  type="button"
                  onClick={onSecondaryAction}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-[rgb(253,224,222)] px-4 text-[14px] font-medium text-black transition-colors hover:bg-[#F7CFCB]"
                >
                  {secondaryActionLabel}
                </button>
              ) : (
                <span className="inline-flex h-9 items-center justify-center rounded-full bg-[rgb(253,224,222)] px-4 text-[14px] font-medium text-black">
                  {secondaryActionLabel}
                </span>
              )
            ) : null}
            <ChevronUpIcon className="size-4 text-[#7D7D7D]" />
          </div>
        </div>

        <div className="mt-3 max-h-[318px] overflow-y-auto pr-2">
          <div className="space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isLockedSelected = lockedSelectedIds.includes(item.id);

                const canManageItem =
                  !isLockedSelected &&
                  item.isManageable !== false &&
                  (Boolean(onEditItem) || Boolean(onDeleteItem));

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleItem(item.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-[14px] px-2 py-2 text-left transition-colors hover:bg-[#F8F5FF]",
                      isLockedSelected && "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                        isSelected
                          ? "border-[#3300C9] bg-[#3300C9]"
                          : "border-[#D8D5E5] bg-white",
                      )}
                    >
                      {isSelected ? (
                        <span className="size-2 rounded-full bg-white" />
                      ) : null}
                    </span>

                    <RecordAvatar
                      item={item}
                      pairedItems={pairedItemsById?.[item.id]}
                      pairedIndicatorIds={pairedIndicatorIdsById?.[item.id]}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[18px] font-medium text-[#5A5A5A]">
                        {item.name}
                      </span>
                      <span className="mt-[1px] block truncate text-[12px] text-[#8A8892]">
                        {item.subtitle}
                      </span>
                    </span>

                    {canManageItem ? (
                      <span className="ml-auto inline-flex items-center gap-2">
                        {onEditItem ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditItem(item);
                            }}
                            aria-label={`Edit ${item.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-[#E6E0FF] text-[#3300C9] transition-colors hover:bg-[#D8D0FB]"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>
                        ) : null}
                        {onDeleteItem ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteItem(item);
                            }}
                            aria-label={`Delete ${item.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-[#FDE7E7] text-[#D94C4C] transition-colors hover:bg-[#F8D9D9]"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="px-2 py-6 text-sm text-[#7D7D7D]">
                {emptyStateText ?? "No colleague found."}
              </div>
            )}
          </div>
        </div>

        {showBottomChevron ? (
          <div className="mt-2 flex justify-end">
            <ChevronDownIcon className="size-4 text-[#7D7D7D]" />
          </div>
        ) : null}

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
