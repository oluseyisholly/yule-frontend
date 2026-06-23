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
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import ModalButton from "@/components/ModalButtons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type OverlaySelectOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  isManageable?: boolean;
};

type OverlaySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: OverlaySelectOption[];
  placeholder?: string;
  panelTitle?: string;
  searchPlaceholder?: string;
  addActionLabel?: string;
  onAddAction?: () => void;
  onCreateOption?: (
    label: string,
  ) => Promise<OverlaySelectOption | void> | OverlaySelectOption | void;
  onUpdateOption?: (
    option: OverlaySelectOption,
    label: string,
  ) => Promise<OverlaySelectOption | void> | OverlaySelectOption | void;
  onDeleteOption?: (option: OverlaySelectOption) => Promise<void> | void;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
};

export default function OverlaySelect({
  value,
  onValueChange,
  options,
  placeholder = "Select option",
  panelTitle = "Select an option",
  searchPlaceholder = "Search",
  addActionLabel = "Add New",
  onAddAction,
  onCreateOption,
  onUpdateOption,
  onDeleteOption,
  className,
  triggerClassName,
  panelClassName,
}: OverlaySelectProps) {
  const PANEL_GAP = 18;
  const VIEWPORT_PADDING = 24;
  const FALLBACK_PANEL_HEIGHT = 520;
  const MIN_PANEL_WIDTH = 0;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [composerMode, setComposerMode] = useState<"idle" | "create" | "edit">(
    "idle",
  );
  const [composerValue, setComposerValue] = useState("");
  const [editingOption, setEditingOption] =
    useState<OverlaySelectOption | null>(null);
  const [pendingDeleteOption, setPendingDeleteOption] =
    useState<OverlaySelectOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, searchValue]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setComposerMode("idle");
      setComposerValue("");
      setEditingOption(null);
      setPendingDeleteOption(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || pendingDeleteOption) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(targetNode);
      const clickedPanel = panelRef.current?.contains(targetNode);

      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, pendingDeleteOption]);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
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

    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleOpenCreate = () => {
    if (onCreateOption) {
      setComposerMode("create");
      setComposerValue("");
      setEditingOption(null);
      return;
    }

    onAddAction?.();
  };

  const handleOpenEdit = (option: OverlaySelectOption) => {
    setComposerMode("edit");
    setComposerValue(option.label);
    setEditingOption(option);
  };

  const handleCancelComposer = () => {
    setComposerMode("idle");
    setComposerValue("");
    setEditingOption(null);
  };

  const handleComposerSubmit = async () => {
    const trimmedValue = composerValue.trim();

    if (!trimmedValue) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (composerMode === "edit" && editingOption && onUpdateOption) {
        const updatedOption =
          (await onUpdateOption(editingOption, trimmedValue)) ?? undefined;

        if (updatedOption?.value) {
          onValueChange(updatedOption.value);
        }
      } else if (composerMode === "create" && onCreateOption) {
        const createdOption = (await onCreateOption(trimmedValue)) ?? undefined;

        if (createdOption?.value) {
          onValueChange(createdOption.value);
        }
      }

      handleCancelComposer();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : composerMode === "edit"
            ? "Unable to update this event right now."
            : "Unable to create this event right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOption = async () => {
    if (!pendingDeleteOption || !onDeleteOption) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteOption(pendingDeleteOption);

      if (value === pendingDeleteOption.value) {
        onValueChange("");
      }

      setPendingDeleteOption(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this event right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowManageActions = Boolean(onUpdateOption || onDeleteOption);
  const showInlineComposer = composerMode !== "idle";
  const canSubmitComposer = composerValue.trim().length > 0 && !isSubmitting;
  const showAddAction = Boolean(onAddAction || onCreateOption);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-[48px] w-full items-center justify-between rounded-[10px] border border-[#ECE8F7] bg-white px-4 text-sm text-[#434343] transition-colors hover:border-[#D6CCF5]",
          triggerClassName,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-2",
            !selectedOption && "text-[#7D7D7D]",
          )}
        >
          {selectedOption?.icon ? (
            <span className="flex size-6 shrink-0 items-center justify-center text-[#5B5B5B]">
              {selectedOption.icon}
            </span>
          ) : null}
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        {isOpen ? (
          <ChevronUpIcon className="size-5 text-[#7D7D7D]" />
        ) : (
          <ChevronDownIcon className="size-5 text-[#7D7D7D]" />
        )}
      </button>

      {mounted && isOpen
        ? createPortal(
            <div
              ref={panelRef}
              style={panelStyle}
              className={cn(
                "z-[130] rounded-[20px] bg-white px-6 py-5 shadow-[0_20px_70px_rgba(24,18,56,0.16)]",
                panelClassName,
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[16px] font-medium text-[#666666]">
                  {panelTitle}
                </p>
                <ChevronUpIcon className="size-5 text-[#7D7D7D]" />
              </div>

              <div className="mt-4 h-px bg-[#EEEAF7]" />

              <div className="relative mt-4">
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-[47px] w-full rounded-[16px] border border-[#ECE8F7] bg-white px-4 pr-12 text-sm text-[#434343] outline-none transition-colors placeholder:text-[#B6B2C4] focus:border-[#D6CCF5]"
                />
                <SearchIcon className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#C8C5D2]" />
              </div>

              {showAddAction ? (
                <div className="mt-6">
                  {showInlineComposer ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={composerValue}
                          onChange={(event) =>
                            setComposerValue(event.target.value)
                          }
                          placeholder={
                            composerMode === "edit"
                              ? "Edit event name"
                              : "Enter event name"
                          }
                          className="h-[47px] rounded-[16px] border border-[#ECE8F7] bg-white px-4 text-sm text-[#434343] placeholder:text-[#B6B2C4] focus-visible:border-[#D6CCF5] focus-visible:ring-0"
                        />
                        <button
                          type="button"
                          onClick={handleCancelComposer}
                          className="inline-flex size-10 items-center justify-center rounded-full text-[#7D7D7D] transition-colors hover:bg-[#F8F5FF] hover:text-[#2400A1]"
                          aria-label="Cancel"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>

                      <ModalButton
                        type="button"
                        onClick={handleComposerSubmit}
                        disabled={!canSubmitComposer}
                        className="!h-[42px] max-w-[120px] !rounded-[14px] !text-base"
                      >
                        {isSubmitting ? (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : composerMode === "edit" ? (
                          "Edit"
                        ) : (
                          "Add"
                        )}
                      </ModalButton>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-3 text-[18px] font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                      >
                        <PlusIcon className="size-5" />
                        {addActionLabel}
                      </button>
                      <ChevronUpIcon className="size-4 text-[#7D7D7D]" />
                    </div>
                  )}
                </div>
              ) : null}

              <div className=" max-h-[360px] overflow-y-auto ">
                <div className="space-y-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2 rounded-[12px] py-1 text-[14px] text-[#434343] transition-colors hover:bg-[#F8F5FF]"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <span className="flex size-10 shrink-0 items-center justify-center text-[#5B5B5B]">
                            {option.icon}
                          </span>
                          <span className="truncate">{option.label}</span>
                        </button>

                        {shouldShowManageActions && option.isManageable ? (
                          <div className="flex items-center gap-1">
                            {onUpdateOption ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleOpenEdit(option);
                                }}
                                className="inline-flex size-8 items-center justify-center rounded-full text-[#3300C9] transition-colors hover:bg-[#F3EFFB]"
                                aria-label={`Edit ${option.label}`}
                              >
                                <PencilIcon className="size-4" />
                              </button>
                            ) : null}

                            {onDeleteOption ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setPendingDeleteOption(option);
                                }}
                                className="inline-flex size-8 items-center justify-center rounded-full text-[#E04F4F] transition-colors hover:bg-[#FFF5F5]"
                                aria-label={`Delete ${option.label}`}
                              >
                                <Trash2Icon className="size-4" />
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-sm text-[#7D7D7D]">
                      No events found.
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <ConfirmationModal
        open={Boolean(pendingDeleteOption)}
        onClose={() => {
          if (!isSubmitting) {
            setPendingDeleteOption(null);
          }
        }}
        onConfirm={handleDeleteOption}
        action="delete"
        isLoading={isSubmitting}
        title="Delete event?"
        description={`Are you sure you want to delete ${pendingDeleteOption?.label ?? "this event"}?`}
        confirmText="Delete"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </div>
  );
}
