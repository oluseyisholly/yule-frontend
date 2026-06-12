"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AddColleagueFormValues } from "@/components/AddColleagueForm";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { DrawNameModalStep } from "@/screens/draw-names/modal-steps";

type AddRecordReturnStep = "record" | "review-records";
export type DrawNameFlowRole = "creator" | "participant";

type DrawNameFlowDraftFields = {
  lastVisitedStep: DrawNameModalStep | null;
  selectedEventId: string;
  exclusionChoice: "yes" | "no" | "";
  eventDate: string;
  groupName: string;
  cameToBudgetFromGroupName: boolean;
  selectedBudget: string;
  customBudget: string;
  wishlistNotificationChoice: "yes" | "no";
};

type DrawNameAddRecordDraftState = {
  editingRecordId: string | null;
  returnStep: AddRecordReturnStep;
  form: AddColleagueFormValues;
};

export type DrawNameFlowSelectionState = DrawNameFlowDraftFields & {
  selectedRecordIds: string[];
  selectedWishlistGiftIds: string[];
  selectedWishlistGiftProductsById: Record<string, MarketplaceProduct>;
  customRecordOptions: SearchableRecordItem[];
  persistedFetchedRecordItemsById: Record<string, SearchableRecordItem>;
  pairedRecordIdsById: Record<string, string[]>;
  addRecordDraft: DrawNameAddRecordDraftState;
};

type DrawNameFlowStore = {
  flowSelectionsByKey: Record<string, DrawNameFlowSelectionState>;
  setSelectedRecordIds: (flowKey: string, ids: string[]) => void;
  setSelectedWishlistGiftIds: (flowKey: string, ids: string[]) => void;
  setSelectedWishlistGiftProductsById: (
    flowKey: string,
    itemsById: Record<string, MarketplaceProduct>,
  ) => void;
  setCustomRecordOptions: (
    flowKey: string,
    items: SearchableRecordItem[],
  ) => void;
  setPersistedFetchedRecordItemsById: (
    flowKey: string,
    itemsById: Record<string, SearchableRecordItem>,
  ) => void;
  setPairedRecordIdsById: (
    flowKey: string,
    pairedRecordIdsById: Record<string, string[]>,
  ) => void;
  setAddRecordDraft: (
    flowKey: string,
    draft: DrawNameAddRecordDraftState,
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<DrawNameFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_DRAW_NAME_ADD_RECORD_DRAFT: DrawNameAddRecordDraftState = {
  editingRecordId: null,
  returnStep: "record",
  form: {
    gender: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  },
};

export const EMPTY_DRAW_NAME_FLOW_SELECTION: DrawNameFlowSelectionState = {
  lastVisitedStep: null,
  selectedEventId: "",
  exclusionChoice: "",
  eventDate: "",
  groupName: "",
  cameToBudgetFromGroupName: false,
  selectedBudget: "",
  customBudget: "",
  wishlistNotificationChoice: "yes",
  selectedRecordIds: [],
  selectedWishlistGiftIds: [],
  selectedWishlistGiftProductsById: {},
  customRecordOptions: [],
  persistedFetchedRecordItemsById: {},
  pairedRecordIdsById: {},
  addRecordDraft: EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
};

function getFlowSelection(
  flowSelectionsByKey: Record<string, DrawNameFlowSelectionState>,
  flowKey: string,
) {
  return flowSelectionsByKey[flowKey] ?? EMPTY_DRAW_NAME_FLOW_SELECTION;
}

export function buildDrawNameFlowSelectionKey(
  role: DrawNameFlowRole,
  drawNameEventId?: string | null,
  eventId?: string | null,
) {
  const resolvedId = drawNameEventId?.trim() || eventId?.trim() || "new";
  return `${role}:${resolvedId}`;
}

export function buildDrawNameFlowHref(
  step: DrawNameModalStep,
  eventId?: string | null,
  drawNameEventId?: string | null,
) {
  const nextParams = new URLSearchParams();

  if (eventId?.trim()) {
    nextParams.set("eventId", eventId.trim());
  }

  if (drawNameEventId?.trim()) {
    nextParams.set("drawNameEventId", drawNameEventId.trim());
  }

  const nextQuery = nextParams.toString();
  const nextPath = `/dashboard/draw-names/flow/${step}`;

  return nextQuery ? `${nextPath}?${nextQuery}` : nextPath;
}

export const useDrawNameFlowStore = create<DrawNameFlowStore>()(
  persist(
    (set) => ({
      flowSelectionsByKey: {},
      setSelectedRecordIds: (flowKey, ids) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedRecordIds: ids,
            },
          },
        })),
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
      setCustomRecordOptions: (flowKey, items) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              customRecordOptions: items,
            },
          },
        })),
      setPersistedFetchedRecordItemsById: (flowKey, itemsById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              persistedFetchedRecordItemsById: itemsById,
            },
          },
        })),
      setPairedRecordIdsById: (flowKey, pairedRecordIdsById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              pairedRecordIdsById,
            },
          },
        })),
      setAddRecordDraft: (flowKey, draft) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              addRecordDraft: draft,
            },
          },
        })),
      setDraftFields: (flowKey, fields) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              ...fields,
            },
          },
        })),
      resetFlowSelection: (flowKey) =>
        set((state) => {
          const nextFlowSelectionsByKey = { ...state.flowSelectionsByKey };
          delete nextFlowSelectionsByKey[flowKey];

          return {
            flowSelectionsByKey: nextFlowSelectionsByKey,
          };
        }),
    }),
    {
      name: "draw-name-flow-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
