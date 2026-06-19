"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { GiftModalStep } from "@/screens/gifts/modal-steps";

export type GiftFlowMode = "create" | "edit";

type GiftFlowDraftFields = {
  lastVisitedStep: GiftModalStep | null;
  selectedEventTypeId: string;
  eventDate: string;
  giftDeadline: string;
  eventName: string;
};

export type GiftFlowSelectionState = GiftFlowDraftFields & {
  selectedParticipantContactIds: string[];
  selectedGiftIds: string[];
  selectedGiftProductsById: Record<string, MarketplaceProduct>;
};

type GiftFlowStore = {
  flowSelectionsByKey: Record<string, GiftFlowSelectionState>;
  setSelectedParticipantContactIds: (flowKey: string, ids: string[]) => void;
  setSelectedGiftIds: (flowKey: string, ids: string[]) => void;
  setSelectedGiftProductsById: (
    flowKey: string,
    itemsById: Record<string, MarketplaceProduct>,
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<GiftFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_GIFT_FLOW_SELECTION: GiftFlowSelectionState = {
  lastVisitedStep: null,
  selectedEventTypeId: "",
  eventDate: "",
  giftDeadline: "",
  eventName: "",
  selectedParticipantContactIds: [],
  selectedGiftIds: [],
  selectedGiftProductsById: {},
};

export function isGiftFlowMode(
  value: string | null | undefined,
): value is GiftFlowMode {
  return value === "create" || value === "edit";
}

function getFlowSelection(
  flowSelectionsByKey: Record<string, GiftFlowSelectionState>,
  flowKey: string,
) {
  return normalizeGiftFlowSelection(flowSelectionsByKey[flowKey]);
}

function hasFlowSelectionChanged(
  currentSelection: GiftFlowSelectionState,
  nextSelection: GiftFlowSelectionState,
) {
  return (
    currentSelection.lastVisitedStep !== nextSelection.lastVisitedStep ||
    currentSelection.selectedEventTypeId !== nextSelection.selectedEventTypeId ||
    currentSelection.eventDate !== nextSelection.eventDate ||
    currentSelection.giftDeadline !== nextSelection.giftDeadline ||
    currentSelection.eventName !== nextSelection.eventName
  );
}

function normalizeGiftFlowSelection(
  selection?: Partial<GiftFlowSelectionState> | null,
): GiftFlowSelectionState {
  return {
    ...EMPTY_GIFT_FLOW_SELECTION,
    ...(selection ?? {}),
    selectedParticipantContactIds: Array.isArray(
      selection?.selectedParticipantContactIds,
    )
      ? selection.selectedParticipantContactIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedParticipantContactIds,
    selectedGiftIds: Array.isArray(selection?.selectedGiftIds)
      ? selection.selectedGiftIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedGiftIds,
    selectedGiftProductsById:
      selection?.selectedGiftProductsById &&
      typeof selection.selectedGiftProductsById === "object"
        ? selection.selectedGiftProductsById
        : EMPTY_GIFT_FLOW_SELECTION.selectedGiftProductsById,
  };
}

function haveSameStringArrayValues(
  current?: string[] | null,
  next?: string[] | null,
) {
  const normalizedCurrent = Array.isArray(current) ? current : [];
  const normalizedNext = Array.isArray(next) ? next : [];

  return (
    normalizedCurrent.length === normalizedNext.length &&
    normalizedCurrent.every((value, index) => value === normalizedNext[index])
  );
}

export function buildGiftFlowSelectionKey(
  mode: GiftFlowMode,
  giftingEventId?: string | null,
  eventId?: string | null,
) {
  const resolvedId = giftingEventId?.trim() || eventId?.trim() || "new";
  return `${mode}:${resolvedId}`;
}

export function buildGiftFlowHref(
  step: GiftModalStep,
  mode: GiftFlowMode,
  eventId?: string | null,
  giftingEventId?: string | null,
) {
  const nextParams = new URLSearchParams();

  nextParams.set("mode", mode);

  if (eventId?.trim()) {
    nextParams.set("eventId", eventId.trim());
  }

  if (giftingEventId?.trim()) {
    nextParams.set("giftingEventId", giftingEventId.trim());
  }

  return `/dashboard/gifts/flow/${step}?${nextParams.toString()}`;
}

export const useGiftFlowStore = create<GiftFlowStore>()(
  persist(
    (set) => ({
      flowSelectionsByKey: {},
      setSelectedParticipantContactIds: (flowKey, ids) =>
        set((state) => {
          const currentSelection = getFlowSelection(
            state.flowSelectionsByKey,
            flowKey,
          );

          if (
            haveSameStringArrayValues(
              currentSelection.selectedParticipantContactIds,
              ids,
            )
          ) {
            return state;
          }

          return {
            flowSelectionsByKey: {
              ...state.flowSelectionsByKey,
              [flowKey]: {
                ...currentSelection,
                selectedParticipantContactIds: ids,
              },
            },
          };
        }),
      setSelectedGiftIds: (flowKey, ids) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedGiftIds: ids,
            },
          },
        })),
      setSelectedGiftProductsById: (flowKey, itemsById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedGiftProductsById: itemsById,
            },
          },
        })),
      setDraftFields: (flowKey, fields) =>
        set((state) => {
          const currentSelection = getFlowSelection(
            state.flowSelectionsByKey,
            flowKey,
          );
          const nextSelection = {
            ...currentSelection,
            ...fields,
          };

          if (!hasFlowSelectionChanged(currentSelection, nextSelection)) {
            return state;
          }

          return {
            flowSelectionsByKey: {
              ...state.flowSelectionsByKey,
              [flowKey]: nextSelection,
            },
          };
        }),
      resetFlowSelection: (flowKey) =>
        set((state) => {
          if (!state.flowSelectionsByKey[flowKey]) {
            return state;
          }

          const nextFlowSelectionsByKey = { ...state.flowSelectionsByKey };
          delete nextFlowSelectionsByKey[flowKey];

          return {
            flowSelectionsByKey: nextFlowSelectionsByKey,
          };
        }),
    }),
    {
      name: "gift-flow-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
