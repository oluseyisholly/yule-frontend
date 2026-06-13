"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { WishListModalStep } from "@/screens/wish-list/modal-steps";

export type WishListFlowMode = "create" | "edit";

type WishListFlowDraftFields = {
  lastVisitedStep: WishListModalStep | null;
  selectedEventTypeId: string;
  eventDate: string;
  eventDeadline: string;
  eventName: string;
  celebrationType: "" | "gifts" | "hangouts" | "both";
};

export type WishListFlowSelectionState = WishListFlowDraftFields & {
  selectedWishlistGiftIds: string[];
  selectedWishlistGiftProductsById: Record<string, MarketplaceProduct>;
};

type WishListFlowStore = {
  flowSelectionsByKey: Record<string, WishListFlowSelectionState>;
  setSelectedWishlistGiftIds: (flowKey: string, ids: string[]) => void;
  setSelectedWishlistGiftProductsById: (
    flowKey: string,
    itemsById: Record<string, MarketplaceProduct>,
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<WishListFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_WISHLIST_FLOW_SELECTION: WishListFlowSelectionState = {
  lastVisitedStep: null,
  selectedEventTypeId: "",
  eventDate: "",
  eventDeadline: "",
  eventName: "",
  celebrationType: "",
  selectedWishlistGiftIds: [],
  selectedWishlistGiftProductsById: {},
};

export function isWishListFlowMode(
  value: string | null | undefined,
): value is WishListFlowMode {
  return value === "create" || value === "edit";
}

function getFlowSelection(
  flowSelectionsByKey: Record<string, WishListFlowSelectionState>,
  flowKey: string,
) {
  return flowSelectionsByKey[flowKey] ?? EMPTY_WISHLIST_FLOW_SELECTION;
}

function hasFlowSelectionChanged(
  currentSelection: WishListFlowSelectionState,
  nextSelection: WishListFlowSelectionState,
) {
  return (
    currentSelection.lastVisitedStep !== nextSelection.lastVisitedStep ||
    currentSelection.selectedEventTypeId !== nextSelection.selectedEventTypeId ||
    currentSelection.eventDate !== nextSelection.eventDate ||
    currentSelection.eventDeadline !== nextSelection.eventDeadline ||
    currentSelection.eventName !== nextSelection.eventName ||
    currentSelection.celebrationType !== nextSelection.celebrationType
  );
}

export function buildWishListFlowSelectionKey(
  mode: WishListFlowMode,
  wishlistEventId?: string | null,
  eventId?: string | null,
) {
  const resolvedId = wishlistEventId?.trim() || eventId?.trim() || "new";
  return `${mode}:${resolvedId}`;
}

export function buildWishListFlowHref(
  step: WishListModalStep,
  mode: WishListFlowMode,
  eventId?: string | null,
  wishlistEventId?: string | null,
) {
  const nextParams = new URLSearchParams();

  nextParams.set("mode", mode);

  if (eventId?.trim()) {
    nextParams.set("eventId", eventId.trim());
  }

  if (wishlistEventId?.trim()) {
    nextParams.set("wishlistEventId", wishlistEventId.trim());
  }

  const nextQuery = nextParams.toString();
  const nextPath = `/dashboard/wish-list/flow/${step}`;

  return nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
}

export const useWishListFlowStore = create<WishListFlowStore>()(
  persist(
    (set) => ({
      flowSelectionsByKey: {},
      setSelectedWishlistGiftIds: (flowKey, ids) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedWishlistGiftIds: ids,
            },
          },
        })),
      setSelectedWishlistGiftProductsById: (flowKey, itemsById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedWishlistGiftProductsById: itemsById,
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
      name: "wishlist-flow-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
