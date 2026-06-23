"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import SearchableRecordPicker, {
  type SearchableRecordItem,
} from "@/components/SearchableRecordPicker";
import { cn } from "@/lib/utils";

type OverlayRecordPickerProps = {
  open?: boolean;
  items: SearchableRecordItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  lockedSelectedIds?: string[];
  placeholder?: string;
  panelTitle: string;
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
  pairedItemsById?: Record<string, SearchableRecordItem[] | undefined>;
  pairedIndicatorIdsById?: Record<string, string[] | undefined>;
  topAction?: ReactNode;
  triggerBottomAction?: ReactNode;
  footer?: ReactNode;
  suspendDismiss?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTriggerChevron?: boolean;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
};

export default function OverlayRecordPicker({
  open,
  items,
  selectedIds,
  onSelectedIdsChange,
  lockedSelectedIds,
  placeholder = "Search for record",
  panelTitle,
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
  pairedItemsById,
  pairedIndicatorIdsById,
  topAction,
  triggerBottomAction,
  footer,
  suspendDismiss = false,
  onOpenChange,
  showTriggerChevron = true,
  className,
  triggerClassName,
  panelClassName,
}: OverlayRecordPickerProps) {
  const PANEL_GAP = 14;
  const VIEWPORT_PADDING = 24;
  const FALLBACK_PANEL_HEIGHT = 540;
  const MIN_PANEL_WIDTH = 0;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = open ?? internalOpen;

  const setIsOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  );

  const triggerLabel =
    selectedItems.length > 0 ? `${selectedItems.length} selected` : placeholder;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (suspendDismiss) {
        return;
      }

      const targetNode = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(targetNode);
      const clickedPanel = panelRef.current?.contains(targetNode);

      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (suspendDismiss) {
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (!triggerRef.current) {
      return;
    }

    const updatePanelPosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const panelHeight =
        panelRef.current?.offsetHeight ?? FALLBACK_PANEL_HEIGHT;
      const maxPanelWidth = window.innerWidth - VIEWPORT_PADDING * 2;
      const panelWidth = Math.min(
        Math.max(triggerRect.width, MIN_PANEL_WIDTH),
        maxPanelWidth,
      );
      const availableBelow =
        window.innerHeight - triggerRect.bottom - PANEL_GAP - VIEWPORT_PADDING;
      const availableAbove = triggerRect.top - PANEL_GAP - VIEWPORT_PADDING;
      const shouldOpenAbove =
        availableBelow < panelHeight && availableAbove > availableBelow;
      const idealTop = shouldOpenAbove
        ? triggerRect.top - panelHeight - PANEL_GAP
        : triggerRect.bottom + PANEL_GAP;
      const clampedTop = Math.max(
        VIEWPORT_PADDING,
        Math.min(idealTop, window.innerHeight - VIEWPORT_PADDING - panelHeight),
      );
      const clampedLeft = Math.max(
        VIEWPORT_PADDING,
        Math.min(
          triggerRect.left,
          window.innerWidth - VIEWPORT_PADDING - panelWidth,
        ),
      );

      setPanelStyle({
        position: "fixed",
        top: clampedTop,
        left: clampedLeft,
        width: panelWidth,
        maxHeight: window.innerHeight - VIEWPORT_PADDING * 2,
      });
    };

    updatePanelPosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen, suspendDismiss]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-[48px] w-full items-center rounded-[14px] border border-[#3300C9] bg-white px-4 text-[18px] font-medium text-[#666666]",
          showTriggerChevron ? "justify-between" : "justify-center",
          triggerClassName,
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            !selectedItems.length && "text-[#666666]",
            !showTriggerChevron && "text-center",
          )}
        >
          {triggerLabel}
        </span>
        {showTriggerChevron ? (
          isOpen ? (
            <ChevronUpIcon className="size-5 text-[#7D7D7D]" />
          ) : (
            <ChevronDownIcon className="size-5 text-[#7D7D7D]" />
          )
        ) : null}
      </button>

      {!isOpen && triggerBottomAction ? (
        <div className="mt-4 flex justify-center">{triggerBottomAction}</div>
      ) : null}

      {mounted && isOpen
        ? createPortal(
            <div ref={panelRef} style={panelStyle} className="z-[130]">
              <SearchableRecordPicker
                title={panelTitle}
                items={items}
                selectedIds={selectedIds}
                onSelectedIdsChange={onSelectedIdsChange}
                lockedSelectedIds={lockedSelectedIds}
                searchPlaceholder={searchPlaceholder}
                searchValue={searchValue}
                onSearchValueChange={onSearchValueChange}
                disableLocalFiltering={disableLocalFiltering}
                isLoading={isLoading}
                emptyStateText={emptyStateText}
                addActionLabel={addActionLabel}
                onAddAction={onAddAction}
                onEditItem={onEditItem}
                onDeleteItem={onDeleteItem}
                pairedItemsById={pairedItemsById}
                pairedIndicatorIdsById={pairedIndicatorIdsById}
                topAction={topAction}
                footer={footer}
                className={panelClassName}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
