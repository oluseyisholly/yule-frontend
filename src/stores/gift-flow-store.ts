"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GiftRecipientChoiceValue } from "@/components/GiftRecipientChoiceStep";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { GiftModalStep } from "@/screens/gifts/modal-steps";

export type GiftFlowMode = "create" | "edit";

type GiftFlowDraftFields = {
  lastVisitedStep: GiftModalStep | null;
  celebrationTarget: GiftRecipientChoiceValue;
  selectedBudgetOption: string;
  minimumGiftBudget: number | null;
  maximumGiftBudget: number | null;
  selectedEventTypeId: string;
  eventDate: string;
  giftDeadline: string;
  eventName: string;
  selectedOnedaBusinessIds: string[];
  selectedOnedaContactIds: string[];
  activeRecipientContactId: string;
  recipientGender: "male" | "female" | "";
  recipientAgeRange: string;
  recipientRelationshipId: string;
  recipientDetailsByContactId: Record<
    string,
    {
      gender: "male" | "female" | "";
      ageRange: string;
      relationshipId: string;
    }
  >;
};

export type GiftFlowSelectionState = GiftFlowDraftFields & {
  selectedParticipantContactIds: string[];
  selectedParticipantRecordsById: Record<string, SearchableRecordItem>;
  selectedGiftIds: string[];
  selectedGiftProductsById: Record<string, MarketplaceProduct>;
  giftRecipientQuantitiesById: Record<string, Record<string, number>>;
};

type GiftFlowStore = {
  flowSelectionsByKey: Record<string, GiftFlowSelectionState>;
  setSelectedParticipantContactIds: (flowKey: string, ids: string[]) => void;
  setSelectedParticipantRecordsById: (
    flowKey: string,
    recordsById: Record<string, SearchableRecordItem>,
  ) => void;
  setSelectedGiftIds: (flowKey: string, ids: string[]) => void;
  setSelectedGiftProductsById: (
    flowKey: string,
    itemsById: Record<string, MarketplaceProduct>,
  ) => void;
  setGiftRecipientQuantitiesById: (
    flowKey: string,
    quantitiesById: Record<string, Record<string, number>>,
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<GiftFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_GIFT_FLOW_SELECTION: GiftFlowSelectionState = {
  lastVisitedStep: null,
  celebrationTarget: "myself",
  selectedBudgetOption: "",
  minimumGiftBudget: null,
  maximumGiftBudget: null,
  selectedEventTypeId: "",
  eventDate: "",
  giftDeadline: "",
  eventName: "",
  selectedOnedaBusinessIds: [],
  selectedOnedaContactIds: [],
  activeRecipientContactId: "",
  recipientGender: "",
  recipientAgeRange: "",
  recipientRelationshipId: "",
  recipientDetailsByContactId: {},
  selectedParticipantContactIds: [],
  selectedParticipantRecordsById: {},
  selectedGiftIds: [],
  selectedGiftProductsById: {},
  giftRecipientQuantitiesById: {},
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
    currentSelection.celebrationTarget !== nextSelection.celebrationTarget ||
    currentSelection.selectedBudgetOption !== nextSelection.selectedBudgetOption ||
    currentSelection.minimumGiftBudget !== nextSelection.minimumGiftBudget ||
    currentSelection.maximumGiftBudget !== nextSelection.maximumGiftBudget ||
    currentSelection.selectedEventTypeId !== nextSelection.selectedEventTypeId ||
    currentSelection.eventDate !== nextSelection.eventDate ||
    currentSelection.giftDeadline !== nextSelection.giftDeadline ||
    currentSelection.eventName !== nextSelection.eventName ||
    !haveSameStringArrayValues(
      currentSelection.selectedOnedaBusinessIds,
      nextSelection.selectedOnedaBusinessIds,
    ) ||
    !haveSameStringArrayValues(
      currentSelection.selectedOnedaContactIds,
      nextSelection.selectedOnedaContactIds,
    ) ||
    currentSelection.activeRecipientContactId !==
      nextSelection.activeRecipientContactId ||
    JSON.stringify(currentSelection.selectedParticipantRecordsById) !==
      JSON.stringify(nextSelection.selectedParticipantRecordsById) ||
    currentSelection.recipientGender !== nextSelection.recipientGender ||
    currentSelection.recipientAgeRange !== nextSelection.recipientAgeRange ||
    currentSelection.recipientRelationshipId !==
      nextSelection.recipientRelationshipId ||
    JSON.stringify(currentSelection.recipientDetailsByContactId) !==
      JSON.stringify(nextSelection.recipientDetailsByContactId)
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
    selectedParticipantRecordsById:
      selection?.selectedParticipantRecordsById &&
      typeof selection.selectedParticipantRecordsById === "object"
        ? selection.selectedParticipantRecordsById
        : EMPTY_GIFT_FLOW_SELECTION.selectedParticipantRecordsById,
    selectedOnedaBusinessIds: Array.isArray(selection?.selectedOnedaBusinessIds)
      ? selection.selectedOnedaBusinessIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedOnedaBusinessIds,
    selectedOnedaContactIds: Array.isArray(selection?.selectedOnedaContactIds)
      ? selection.selectedOnedaContactIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedOnedaContactIds,
    activeRecipientContactId:
      typeof selection?.activeRecipientContactId === "string"
        ? selection.activeRecipientContactId
        : EMPTY_GIFT_FLOW_SELECTION.activeRecipientContactId,
    selectedGiftIds: Array.isArray(selection?.selectedGiftIds)
      ? selection.selectedGiftIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedGiftIds,
    selectedGiftProductsById:
      selection?.selectedGiftProductsById &&
      typeof selection.selectedGiftProductsById === "object"
        ? selection.selectedGiftProductsById
        : EMPTY_GIFT_FLOW_SELECTION.selectedGiftProductsById,
    giftRecipientQuantitiesById:
      selection?.giftRecipientQuantitiesById &&
      typeof selection.giftRecipientQuantitiesById === "object"
        ? selection.giftRecipientQuantitiesById
        : EMPTY_GIFT_FLOW_SELECTION.giftRecipientQuantitiesById,
    recipientDetailsByContactId:
      selection?.recipientDetailsByContactId &&
      typeof selection.recipientDetailsByContactId === "object"
        ? selection.recipientDetailsByContactId
        : EMPTY_GIFT_FLOW_SELECTION.recipientDetailsByContactId,
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
      setSelectedParticipantRecordsById: (flowKey, recordsById) =>
        set((state) => {
          const currentSelection = getFlowSelection(
            state.flowSelectionsByKey,
            flowKey,
          );

          if (
            JSON.stringify(currentSelection.selectedParticipantRecordsById) ===
            JSON.stringify(recordsById)
          ) {
            return state;
          }

          return {
            flowSelectionsByKey: {
              ...state.flowSelectionsByKey,
              [flowKey]: {
                ...currentSelection,
                selectedParticipantRecordsById: recordsById,
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
      setGiftRecipientQuantitiesById: (flowKey, quantitiesById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              giftRecipientQuantitiesById: quantitiesById,
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
