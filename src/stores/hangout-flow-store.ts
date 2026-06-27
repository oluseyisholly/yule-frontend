"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { HangoutModalStep } from "@/screens/hangouts/modal-steps";

export type HangoutFlowMode = "create" | "edit";

type HangoutFlowDraftFields = {
  lastVisitedStep: HangoutModalStep | null;
  selectedEventTypeId: string;
  eventDate: string;
  eventName: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: string;
};

export type HangoutFlowSelectionState = HangoutFlowDraftFields & {
  selectedParticipantContactIds: string[];
  selectedListingIds: string[];
  selectedListingsById: Record<string, MarketplaceProduct>;
};

type HangoutFlowStore = {
  flowSelectionsByKey: Record<string, HangoutFlowSelectionState>;
  setSelectedParticipantContactIds: (flowKey: string, ids: string[]) => void;
  setSelectedListingIds: (flowKey: string, ids: string[]) => void;
  setSelectedListingsById: (
    flowKey: string,
    itemsById: Record<string, MarketplaceProduct>,
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<HangoutFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_HANGOUT_FLOW_SELECTION: HangoutFlowSelectionState = {
  lastVisitedStep: null,
  selectedEventTypeId: "",
  eventDate: "",
  eventName: "",
  checkInDate: "",
  checkOutDate: "",
  guestCount: "",
  selectedParticipantContactIds: [],
  selectedListingIds: [],
  selectedListingsById: {},
};

export function isHangoutFlowMode(
  value: string | null | undefined,
): value is HangoutFlowMode {
  return value === "create" || value === "edit";
}

function normalizeHangoutFlowSelection(
  selection?: Partial<HangoutFlowSelectionState> | null,
): HangoutFlowSelectionState {
  return {
    ...EMPTY_HANGOUT_FLOW_SELECTION,
    ...(selection ?? {}),
    selectedParticipantContactIds: Array.isArray(
      selection?.selectedParticipantContactIds,
    )
      ? selection.selectedParticipantContactIds
      : EMPTY_HANGOUT_FLOW_SELECTION.selectedParticipantContactIds,
    selectedListingIds: Array.isArray(selection?.selectedListingIds)
      ? selection.selectedListingIds
      : EMPTY_HANGOUT_FLOW_SELECTION.selectedListingIds,
    selectedListingsById:
      selection?.selectedListingsById &&
      typeof selection.selectedListingsById === "object"
        ? selection.selectedListingsById
        : EMPTY_HANGOUT_FLOW_SELECTION.selectedListingsById,
  };
}

function getFlowSelection(
  flowSelectionsByKey: Record<string, HangoutFlowSelectionState>,
  flowKey: string,
) {
  return normalizeHangoutFlowSelection(flowSelectionsByKey[flowKey]);
}

function haveSameStringArrayValues(current?: string[] | null, next?: string[] | null) {
  const normalizedCurrent = Array.isArray(current) ? current : [];
  const normalizedNext = Array.isArray(next) ? next : [];

  return (
    normalizedCurrent.length === normalizedNext.length &&
    normalizedCurrent.every((value, index) => value === normalizedNext[index])
  );
}

function hasFlowSelectionChanged(
  currentSelection: HangoutFlowSelectionState,
  nextSelection: HangoutFlowSelectionState,
) {
  return (
    currentSelection.lastVisitedStep !== nextSelection.lastVisitedStep ||
    currentSelection.selectedEventTypeId !== nextSelection.selectedEventTypeId ||
    currentSelection.eventDate !== nextSelection.eventDate ||
    currentSelection.eventName !== nextSelection.eventName ||
    currentSelection.checkInDate !== nextSelection.checkInDate ||
    currentSelection.checkOutDate !== nextSelection.checkOutDate ||
    currentSelection.guestCount !== nextSelection.guestCount
  );
}

export function buildHangoutFlowSelectionKey(
  mode: HangoutFlowMode,
  eventId?: string | null,
) {
  const resolvedId = eventId?.trim() || "new";
  return `${mode}:${resolvedId}`;
}

export function buildHangoutFlowHref(
  step: HangoutModalStep,
  mode: HangoutFlowMode,
  eventId?: string | null,
) {
  const nextParams = new URLSearchParams();

  nextParams.set("mode", mode);

  if (eventId?.trim()) {
    nextParams.set("eventId", eventId.trim());
  }

  return `/dashboard/hangouts/flow/${step}?${nextParams.toString()}`;
}

export const useHangoutFlowStore = create<HangoutFlowStore>()(
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
      setSelectedListingIds: (flowKey, ids) =>
        set((state) => {
          const currentSelection = getFlowSelection(
            state.flowSelectionsByKey,
            flowKey,
          );

          if (haveSameStringArrayValues(currentSelection.selectedListingIds, ids)) {
            return state;
          }

          return {
            flowSelectionsByKey: {
              ...state.flowSelectionsByKey,
              [flowKey]: {
                ...currentSelection,
                selectedListingIds: ids,
              },
            },
          };
        }),
      setSelectedListingsById: (flowKey, itemsById) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedListingsById: itemsById,
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
      name: "hangout-flow-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
