"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import type { ScheduleMessageFlowStep } from "@/screens/schedule/modal-steps";

export type ScheduleMessageFlowMode = "message" | "schedule";

export type ScheduleMessageFlowForm = {
  subject: string;
  message: string;
  giftUrl: string;
  giftUrlExpiresAt: string;
  scheduledAt: string;
  eventName: string;
  eventDate: string;
};

type ScheduleMessageFlowDraftFields = {
  lastVisitedStep: ScheduleMessageFlowStep | null;
  selectedEventTypeId: string;
  selectedEventId: string;
  selectedRecipientParticipantId: string;
  selectedRecipientParticipantIds: string[];
  selectedOnedaBusinessIds: string[];
  selectedOnedaContactIds: string[];
  form: ScheduleMessageFlowForm;
};

export type ScheduleMessageFlowSelectionState =
  ScheduleMessageFlowDraftFields & {
    selectedParticipantIds: string[];
    selectedParticipantRecords: SearchableRecordItem[];
    selectedGiftIds: string[];
    selectedGiftProductsById: Record<string, MarketplaceProduct>;
    giftRecipientQuantitiesById: Record<string, Record<string, number>>;
    customContactRecordItems: SearchableRecordItem[];
  };

type ScheduleMessageFlowStore = {
  flowSelectionsByKey: Record<string, ScheduleMessageFlowSelectionState>;
  setSelectedParticipantIds: (flowKey: string, ids: string[]) => void;
  setSelectedParticipantRecords: (
    flowKey: string,
    records: SearchableRecordItem[],
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
  setCustomContactRecordItems: (
    flowKey: string,
    items: SearchableRecordItem[],
  ) => void;
  setDraftFields: (
    flowKey: string,
    fields: Partial<ScheduleMessageFlowDraftFields>,
  ) => void;
  resetFlowSelection: (flowKey: string) => void;
};

export const EMPTY_SCHEDULE_MESSAGE_FLOW_FORM: ScheduleMessageFlowForm = {
  subject: "",
  message: "",
  giftUrl: "",
  giftUrlExpiresAt: "",
  scheduledAt: "",
  eventName: "",
  eventDate: "",
};

export const EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION: ScheduleMessageFlowSelectionState =
  {
    lastVisitedStep: null,
    selectedEventTypeId: "",
    selectedEventId: "",
    selectedRecipientParticipantId: "",
    selectedRecipientParticipantIds: [],
    selectedOnedaBusinessIds: [],
    selectedOnedaContactIds: [],
    form: EMPTY_SCHEDULE_MESSAGE_FLOW_FORM,
    selectedParticipantIds: [],
    selectedParticipantRecords: [],
    selectedGiftIds: [],
    selectedGiftProductsById: {},
    giftRecipientQuantitiesById: {},
    customContactRecordItems: [],
  };

function normalizeScheduleMessageFlowSelection(
  selection?: Partial<ScheduleMessageFlowSelectionState> | null,
): ScheduleMessageFlowSelectionState {
  return {
    ...EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION,
    ...(selection ?? {}),
    form: {
      ...EMPTY_SCHEDULE_MESSAGE_FLOW_FORM,
      ...(selection?.form ?? {}),
    },
    selectedOnedaBusinessIds: Array.isArray(selection?.selectedOnedaBusinessIds)
      ? selection.selectedOnedaBusinessIds
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedOnedaBusinessIds,
    selectedOnedaContactIds: Array.isArray(selection?.selectedOnedaContactIds)
      ? selection.selectedOnedaContactIds
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedOnedaContactIds,
    selectedRecipientParticipantIds: Array.isArray(
      selection?.selectedRecipientParticipantIds,
    )
      ? selection.selectedRecipientParticipantIds
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedRecipientParticipantIds,
    selectedParticipantIds: Array.isArray(selection?.selectedParticipantIds)
      ? selection.selectedParticipantIds
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedParticipantIds,
    selectedParticipantRecords: Array.isArray(
      selection?.selectedParticipantRecords,
    )
      ? selection.selectedParticipantRecords
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedParticipantRecords,
    selectedGiftIds: Array.isArray(selection?.selectedGiftIds)
      ? selection.selectedGiftIds
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedGiftIds,
    selectedGiftProductsById:
      selection?.selectedGiftProductsById &&
      typeof selection.selectedGiftProductsById === "object"
        ? selection.selectedGiftProductsById
        : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.selectedGiftProductsById,
    giftRecipientQuantitiesById:
      selection?.giftRecipientQuantitiesById &&
      typeof selection.giftRecipientQuantitiesById === "object"
        ? selection.giftRecipientQuantitiesById
        : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.giftRecipientQuantitiesById,
    customContactRecordItems: Array.isArray(selection?.customContactRecordItems)
      ? selection.customContactRecordItems
      : EMPTY_SCHEDULE_MESSAGE_FLOW_SELECTION.customContactRecordItems,
  };
}

function getFlowSelection(
  flowSelectionsByKey: Record<string, ScheduleMessageFlowSelectionState>,
  flowKey: string,
) {
  return normalizeScheduleMessageFlowSelection(flowSelectionsByKey[flowKey]);
}

export function buildScheduleMessageFlowSelectionKey(
  mode: ScheduleMessageFlowMode,
  scheduleEventMessageId?: string | null,
  eventId?: string | null,
) {
  const resolvedId =
    scheduleEventMessageId?.trim() || eventId?.trim() || "new";
  return `${mode}:${resolvedId}`;
}

export const useScheduleMessageFlowStore = create<ScheduleMessageFlowStore>()(
  persist(
    (set) => ({
      flowSelectionsByKey: {},
      setSelectedParticipantIds: (flowKey, ids) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedParticipantIds: ids,
            },
          },
        })),
      setSelectedParticipantRecords: (flowKey, records) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              selectedParticipantRecords: records,
            },
          },
        })),
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
      setCustomContactRecordItems: (flowKey, items) =>
        set((state) => ({
          flowSelectionsByKey: {
            ...state.flowSelectionsByKey,
            [flowKey]: {
              ...getFlowSelection(state.flowSelectionsByKey, flowKey),
              customContactRecordItems: items,
            },
          },
        })),
      setDraftFields: (flowKey, fields) =>
        set((state) => {
          const currentSelection = getFlowSelection(
            state.flowSelectionsByKey,
            flowKey,
          );

          return {
            flowSelectionsByKey: {
              ...state.flowSelectionsByKey,
              [flowKey]: {
                ...currentSelection,
                ...fields,
                form: fields.form
                  ? {
                      ...currentSelection.form,
                      ...fields.form,
                    }
                  : currentSelection.form,
              },
            },
          };
        }),
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
      name: "schedule-message-flow-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        flowSelectionsByKey: state.flowSelectionsByKey,
      }),
    },
  ),
);

export { normalizeScheduleMessageFlowSelection };
