"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { ModalPanelSkeleton } from "@/components/ui/context-skeletons";
import ContentModal from "@/components/ui/modal";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import OverlayRecordPicker from "@/components/OverlayRecordPicker";
import AddColleagueForm, {
  type AddColleagueFormValues,
} from "@/components/AddColleagueForm";
import CustomColleagueReview from "@/components/CustomColleagueReview";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import ExclusionChoiceStep from "@/components/ExclusionChoiceStep";
import EventDateStep from "@/components/EventDateStep";
import GiftBudgetStep from "@/components/GiftBudgetStep";
import GroupNameStep from "@/components/GroupNameStep";
import SearchableRecordPicker, {
  type SearchableRecordItem,
} from "@/components/SearchableRecordPicker";
import DrawNameExecutionFlowSteps from "@/screens/draw-names/DrawNameExecutionFlowSteps";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useDeleteContactMutation } from "@/features/contacts/hooks/useDeleteContactMutation";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import { useEnsureMyContactMutation } from "@/features/contacts/hooks/useEnsureMyContactMutation";
import { useMyContactIdMutation } from "@/features/contacts/hooks/useMyContactIdMutation";
import { useUpdateContactMutation } from "@/features/contacts/hooks/useUpdateContactMutation";
import type { Contact } from "@/features/contacts/types";
import { useCompleteDrawNameEventMutation } from "@/features/draw-name-events/hooks/useCompleteDrawNameEventMutation";
import { useCreateDrawNameEventMutation } from "@/features/draw-name-events/hooks/useCreateDrawNameEventMutation";
import { useDrawNameEventMutation } from "@/features/draw-name-events/hooks/useDrawNameEventMutation";
import { canManageDrawNameEvent } from "@/features/draw-name-events/access";
import { useDrawNameEventQuery } from "@/features/draw-name-events/hooks/useDrawNameEventQuery";
import { useUpdateDrawNameEventMutation } from "@/features/draw-name-events/hooks/useUpdateDrawNameEventMutation";
import type { DrawNameEventCreatePayload } from "@/features/draw-name-events/types";
import { useCreateParticipantExclusionsBulkMutation } from "@/features/participants/hooks/useCreateParticipantExclusionsBulkMutation";
import { useCreateParticipantsBulkMutation } from "@/features/participants/hooks/useCreateParticipantsBulkMutation";
import { useDeleteParticipantExclusionMutation } from "@/features/participants/hooks/useDeleteParticipantExclusionMutation";
import { useEventParticipantContactIdsQuery } from "@/features/participants/hooks/useEventParticipantContactIdsQuery";
import { useEventParticipantsQuery } from "@/features/participants/hooks/useEventParticipantsQuery";
import { useGiftRecipientQuery } from "@/features/participants/hooks/useGiftRecipientQuery";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import { useParticipantExclusionsQuery } from "@/features/participants/hooks/useParticipantExclusionsQuery";
import { useUpdateMyParticipantNotificationMutation } from "@/features/participants/hooks/useUpdateMyParticipantNotificationMutation";
import { useCreateBulkGiftsMutation } from "@/features/gifts/hooks/useCreateBulkGiftsMutation";
import { useParticipantGiftSelectionsQuery } from "@/features/gifts/hooks/useParticipantGiftSelectionsQuery";
import type { ParticipantGiftSelection } from "@/features/gifts/types";
import type {
  EventParticipant,
  GiftRecipientResult,
} from "@/features/participants/types";
import type {
  MarketplaceCondition,
  MarketplaceProduct,
} from "@/features/marketplace/types";
import { type DrawNameInviteParticipant } from "@/components/DrawNameInviteStep";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import { useDrawNameEventInvitationsQuery } from "@/features/invitations/hooks/useDrawNameEventInvitationsQuery";
import { useSendDrawNameEventInvitationsMutation } from "@/features/invitations/hooks/useSendDrawNameEventInvitationsMutation";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildDrawNameFlowSelectionKey,
  EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
  EMPTY_DRAW_NAME_FLOW_SELECTION,
  useDrawNameFlowStore,
} from "@/stores/draw-name-flow-store";
import {
  isParticipantDrawNameFlowStep,
  type DrawNameModalStep,
} from "@/screens/draw-names/modal-steps";

type DrawNameStartModalProps = {
  open: boolean;
  currentStep: DrawNameModalStep;
  eventId: string | null;
  drawNameEventId: string | null;
  flowActor: "creator" | "participant";
  onStepChange: (
    step: DrawNameModalStep,
    nextEventId?: string | null,
    nextDrawNameEventId?: string | null,
  ) => void;
  onReplaceStep: (
    step: DrawNameModalStep,
    nextEventId?: string | null,
    nextDrawNameEventId?: string | null,
  ) => void;
  onClose: () => void;
};

const EMPTY_NEW_COLLEAGUE_FORM: AddColleagueFormValues = {
  gender: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
};

const MINIMUM_COLLEAGUES_FOR_UNPAIRING = 4;
const BUDGET_PRESET_OPTIONS = [
  "N10,000",
  "N15,000",
  "N20,000",
  "N35,000",
  "N50,000",
  "N85,000",
  "N100,000",
] as const;

const RECORD_AVATAR_STYLES = [
  { avatarBg: "#FCEEC8", avatarColor: "#8A5B00" },
  { avatarBg: "#D9F4E2", avatarColor: "#1C8C4B" },
  { avatarBg: "#EFE6FD", avatarColor: "#3300C9" },
  { avatarBg: "#FDE0DE", avatarColor: "#C34040" },
  { avatarBg: "#DDF0FF", avatarColor: "#0067C9" },
  { avatarBg: "#E8E6F8", avatarColor: "#5A4CB8" },
] as const;

function getContactAvatarStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return RECORD_AVATAR_STYLES[hash % RECORD_AVATAR_STYLES.length];
}

function mapContactToRecordItem(
  contact: Contact,
  currentUserContactId: string | null,
): SearchableRecordItem {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const firstInitial = contact.firstName.trim().charAt(0);
  const lastInitial = contact.lastName.trim().charAt(0);
  const { avatarBg, avatarColor } = getContactAvatarStyle(
    contact.id || fullName,
  );

  return {
    id: contact.id,
    name:
      fullName ||
      contact.email ||
      contact.phone ||
      contact.phoneNumber ||
      "Unnamed contact",
    subtitle:
      contact.email ||
      contact.phone ||
      contact.phoneNumber ||
      contact.note ||
      "Contact",
    email: contact.email,
    createdById: contact.createdById ?? null,
    isManageable: Boolean(
      currentUserContactId && contact.createdById === currentUserContactId,
    ),
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber || contact.phone || "",
    gender:
      contact.gender === "male" || contact.gender === "female"
        ? contact.gender
        : "",
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mapEventParticipantToRecordItem(
  participant: EventParticipant,
): SearchableRecordItem | null {
  const contact = participant.eventContact;

  if (!contact) {
    return null;
  }

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const firstInitial = contact.firstName.trim().charAt(0);
  const lastInitial = contact.lastName.trim().charAt(0);
  const { avatarBg, avatarColor } = getContactAvatarStyle(
    contact.id || fullName || participant.id,
  );

  return {
    id: contact.id || participant.eventContactId || participant.id,
    name: fullName || contact.email || "Unnamed contact",
    subtitle: contact.email || "Contact",
    email: contact.email,
    createdById: null,
    isManageable: false,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: "",
    gender: "",
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mergeRecordItems(...groups: SearchableRecordItem[][]) {
  const nextRecordItemsById = new Map<string, SearchableRecordItem>();

  groups.flat().forEach((item) => {
    nextRecordItemsById.set(item.id, item);
  });

  return Array.from(nextRecordItemsById.values());
}

function normalizePairedRecordIdsById(
  value: Record<string, string | string[]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(value)
      .map(([recordId, pairedValue]) => [
        recordId,
        Array.isArray(pairedValue)
          ? Array.from(new Set(pairedValue.filter(Boolean)))
          : pairedValue
            ? [pairedValue]
            : [],
      ])
      .filter(([, pairedIds]) => pairedIds.length > 0),
  );
}

function mergePairedRecordMaps(...maps: Record<string, string[]>[]) {
  const nextMap = new Map<string, Set<string>>();

  maps.forEach((map) => {
    Object.entries(map).forEach(([recordId, pairedIds]) => {
      const current = nextMap.get(recordId) ?? new Set<string>();
      pairedIds.forEach((pairedId) => current.add(pairedId));
      nextMap.set(recordId, current);
    });
  });

  return Object.fromEntries(
    Array.from(nextMap.entries())
      .map(([recordId, pairedIds]) => [recordId, Array.from(pairedIds)] as const)
      .filter(([, pairedIds]) => pairedIds.length > 0),
  ) as Record<string, string[]>;
}

function getGiftRecipientDisplayName(result: GiftRecipientResult) {
  if (!result) {
    return "";
  }

  const firstName =
    result.eventContact?.firstName?.trim() || "";
  const lastName =
    result.eventContact?.lastName?.trim() || "";

  return `${firstName} ${lastName}`.trim();
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const [datePart] = value.split("T");
  return datePart ?? "";
}

function toBudgetSelection(value?: number | string | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return {
      selectedBudget: "",
      customBudget: "",
    };
  }

  const formattedValue = `N${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(numericValue)}`;

  if (
    BUDGET_PRESET_OPTIONS.includes(
      formattedValue as (typeof BUDGET_PRESET_OPTIONS)[number],
    )
  ) {
    return {
      selectedBudget: formattedValue,
      customBudget: "",
    };
  }

  return {
    selectedBudget: "More",
    customBudget: formattedValue,
  };
}

function getEventYear(value?: string | null) {
  if (!value) {
    return "";
  }

  const [datePart] = value.split("T");
  const parsedDate = new Date(datePart ?? value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return `${parsedDate.getFullYear()}`;
}

function normalizeParticipantGiftSelections(
  value: unknown,
): ParticipantGiftSelection[] {
  if (Array.isArray(value)) {
    return value as ParticipantGiftSelection[];
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: ParticipantGiftSelection[] }).data;
  }

  return [];
}

function toMarketplaceCondition(value?: string): MarketplaceCondition | undefined {
  const normalizedValue = value?.trim();

  if (
    normalizedValue === "new" ||
    normalizedValue === "used" ||
    normalizedValue === "foreign_used" ||
    normalizedValue === "refurbished" ||
    normalizedValue === "like_new" ||
    normalizedValue === "good" ||
    normalizedValue === "fair" ||
    normalizedValue === "poor"
  ) {
    return normalizedValue;
  }

  return undefined;
}

function mapParticipantGiftSelectionToMarketplaceProduct(
  selection: ParticipantGiftSelection,
): MarketplaceProduct | null {
  const productId =
    selection.participantGiftId?.trim() || selection.id?.trim() || "";

  if (!productId) {
    return null;
  }

  const amount =
    typeof selection.amount === "number"
      ? selection.amount
      : Number(selection.amount ?? 0);

  return {
    _id: productId,
    sellerId: selection.sellerId || undefined,
    categorySlug: selection.categorySlug || undefined,
    subCategorySlug: selection.subCategorySlug || undefined,
    title: selection.title?.trim() || "Selected gift",
    description: selection.description ?? "",
    amount: Number.isFinite(amount) ? amount : 0,
    images: Array.isArray(selection.images)
      ? selection.images.filter(Boolean)
      : selection.imageUrl
        ? [selection.imageUrl]
        : [],
    location: {
      state: selection.locationState || undefined,
      city: selection.locationCity || undefined,
    },
    condition: toMarketplaceCondition(selection.condition),
    slug: selection.productSlug || selection.slug || undefined,
  };
}

function hasRichMarketplaceProductSnapshot(product?: MarketplaceProduct | null) {
  if (!product) {
    return false;
  }

  return Boolean(
    (product.title?.trim() && product.title.trim() !== "Selected gift") ||
      (typeof product.amount === "number" && product.amount > 0) ||
      product.description?.trim() ||
      product.images?.length ||
      product.sellerId ||
      product.slug,
  );
}

function areMarketplaceProductSnapshotsEqual(
  left?: MarketplaceProduct | null,
  right?: MarketplaceProduct | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  const leftImages = left.images ?? [];
  const rightImages = right.images ?? [];

  return (
    left._id === right._id &&
    left.sellerId === right.sellerId &&
    left.categorySlug === right.categorySlug &&
    left.subCategorySlug === right.subCategorySlug &&
    left.title === right.title &&
    left.description === right.description &&
    left.amount === right.amount &&
    left.condition === right.condition &&
    left.slug === right.slug &&
    left.location?.state === right.location?.state &&
    left.location?.city === right.location?.city &&
    left.location?.lga === right.location?.lga &&
    leftImages.length === rightImages.length &&
    leftImages.every((image, index) => image === rightImages[index])
  );
}

function mergeMarketplaceProductSnapshots(
  existing?: MarketplaceProduct | null,
  incoming?: MarketplaceProduct | null,
) {
  if (!existing) {
    return incoming ?? null;
  }

  if (!incoming) {
    return existing;
  }

  const preferred =
    hasRichMarketplaceProductSnapshot(existing) ||
    !hasRichMarketplaceProductSnapshot(incoming)
      ? existing
      : incoming;
  const fallback = preferred === existing ? incoming : existing;

  return {
    ...fallback,
    ...preferred,
    _id: preferred._id || fallback._id,
    sellerId: preferred.sellerId || fallback.sellerId,
    categorySlug: preferred.categorySlug || fallback.categorySlug,
    subCategorySlug: preferred.subCategorySlug || fallback.subCategorySlug,
    title:
      preferred.title?.trim() && preferred.title.trim() !== "Selected gift"
        ? preferred.title
        : fallback.title,
    description: preferred.description || fallback.description,
    amount:
      typeof preferred.amount === "number" && preferred.amount > 0
        ? preferred.amount
        : fallback.amount,
    images: preferred.images?.length ? preferred.images : fallback.images,
    location: {
      state: preferred.location?.state || fallback.location?.state,
      city: preferred.location?.city || fallback.location?.city,
      lga: preferred.location?.lga || fallback.location?.lga,
    },
    condition: preferred.condition || fallback.condition,
    slug: preferred.slug || fallback.slug,
  } satisfies MarketplaceProduct;
}

export default function DrawNameStartModal({
  open,
  currentStep,
  eventId,
  drawNameEventId,
  flowActor,
  onStepChange,
  onReplaceStep,
  onClose,
}: DrawNameStartModalProps) {
  const authUser = useAuthStore((state) => state.user);
  const currentUserContactId = useAuthStore((state) => state.currentContactId);
  const setCurrentContactId = useAuthStore((state) => state.setCurrentContactId);
  const firstName = authUser?.firstName;
  const flowSelectionKey = buildDrawNameFlowSelectionKey(
    flowActor,
    drawNameEventId,
    eventId,
  );
  const isParticipantFlow = flowActor === "participant";
  const [isForceClosing, setIsForceClosing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [excludedRecordIds, setExcludedRecordIds] = useState<string[]>([]);
  const [pairedRecordIdsById, setPairedRecordIdsById] = useState<
    Record<string, string[]>
  >({});
  const [customRecordOptions, setCustomRecordOptions] = useState<
    SearchableRecordItem[]
  >([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<SearchableRecordItem | null>(null);
  const [isCompleteDrawConfirmationOpen, setIsCompleteDrawConfirmationOpen] =
    useState(false);
  const [isSendEmailConfirmationOpen, setIsSendEmailConfirmationOpen] =
    useState(false);
  const [isCopyInvitePanelOpen, setIsCopyInvitePanelOpen] = useState(false);
  const [inviteSearchValue, setInviteSearchValue] = useState("");
  const [debouncedInviteSearchValue, setDebouncedInviteSearchValue] =
    useState("");
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);
  const [addRecordReturnStep, setAddRecordReturnStep] = useState<
    "record" | "review-records"
  >("record");
  const [newColleagueForm, setNewColleagueForm] =
    useState<AddColleagueFormValues>(EMPTY_NEW_COLLEAGUE_FORM);
  const [exclusionChoice, setExclusionChoice] = useState<"yes" | "no" | "">("");
  const [eventDate, setEventDate] = useState("");
  const [groupName, setGroupName] = useState("");
  const [cameToBudgetFromGroupName, setCameToBudgetFromGroupName] =
    useState(false);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [selectedWishlistGiftIds, setSelectedWishlistGiftIds] = useState<
    string[]
  >([]);
  const [selectedWishlistGiftProductsById, setSelectedWishlistGiftProductsById] =
    useState<Record<string, MarketplaceProduct>>({});
  const [wishlistNotificationChoice, setWishlistNotificationChoice] = useState<
    "yes" | "no"
  >("yes");
  const [drawResultName, setDrawResultName] = useState("");
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [debouncedRecordSearchValue, setDebouncedRecordSearchValue] =
    useState("");
  const [persistedFetchedRecordItemsById, setPersistedFetchedRecordItemsById] =
    useState<Record<string, SearchableRecordItem>>({});
  const [hasEnsuredMyContact, setHasEnsuredMyContact] = useState(false);
  const [ensureRequested, setEnsureRequested] = useState(false);
  const [isFlowSelectionHydrated, setIsFlowSelectionHydrated] = useState(false);
  const hydratedDrawNameEventIdRef = React.useRef<string | null>(null);
  const hydratedFlowSelectionKeyRef = React.useRef<string | null>(null);
  const hasTouchedEventTypeRef = React.useRef(false);
  const hasTouchedEventDateRef = React.useRef(false);
  const suggestedGroupNameRef = React.useRef("");
  const hasTouchedGroupNameRef = React.useRef(false);
  const storedFlowSelection = useDrawNameFlowStore(
    (state) =>
      state.flowSelectionsByKey[flowSelectionKey] ??
      EMPTY_DRAW_NAME_FLOW_SELECTION,
  );
  const setStoredSelectedRecordIds = useDrawNameFlowStore(
    (state) => state.setSelectedRecordIds,
  );
  const setStoredSelectedWishlistGiftIds = useDrawNameFlowStore(
    (state) => state.setSelectedWishlistGiftIds,
  );
  const setStoredSelectedWishlistGiftProductsById = useDrawNameFlowStore(
    (state) => state.setSelectedWishlistGiftProductsById,
  );
  const setStoredCustomRecordOptions = useDrawNameFlowStore(
    (state) => state.setCustomRecordOptions,
  );
  const setStoredPersistedFetchedRecordItemsById = useDrawNameFlowStore(
    (state) => state.setPersistedFetchedRecordItemsById,
  );
  const setStoredPairedRecordIdsById = useDrawNameFlowStore(
    (state) => state.setPairedRecordIdsById,
  );
  const setStoredAddRecordDraft = useDrawNameFlowStore(
    (state) => state.setAddRecordDraft,
  );
  const setStoredDraftFields = useDrawNameFlowStore(
    (state) => state.setDraftFields,
  );
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const myContactIdMutation = useMyContactIdMutation();
  const completeDrawNameEventMutation = useCompleteDrawNameEventMutation();
  const createDrawNameEventMutation = useCreateDrawNameEventMutation();
  const drawNameEventMutation = useDrawNameEventMutation();
  const updateDrawNameEventMutation = useUpdateDrawNameEventMutation();
  const sendDrawNameEventInvitationsMutation =
    useSendDrawNameEventInvitationsMutation();
  const createParticipantsBulkMutation = useCreateParticipantsBulkMutation();
  const createBulkGiftsMutation = useCreateBulkGiftsMutation();
  const createParticipantExclusionsBulkMutation =
    useCreateParticipantExclusionsBulkMutation(eventId);
  const deleteParticipantExclusionMutation =
    useDeleteParticipantExclusionMutation(eventId);
  const updateMyParticipantNotificationMutation =
    useUpdateMyParticipantNotificationMutation();
  const ensureMyContactMutation = useEnsureMyContactMutation();
  const { data: drawNameEventResponse, refetch: refetchDrawNameEvent } =
    useDrawNameEventQuery(drawNameEventId, {
      enabled:
        open &&
        Boolean(drawNameEventId) &&
        [
          "event",
          "event-date",
          "group-name",
          "budget",
          "wishlist-gifts",
          "wishlist-notification",
          "draw-ready",
          "draw-spin",
          "draw-result",
        ].includes(currentStep),
    });
  const isCreatorForCurrentDrawFlow = useMemo(
    () =>
      canManageDrawNameEvent(drawNameEventResponse?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentUserContactId?.trim() || null,
      }),
    [
      authUser?.id,
      currentUserContactId,
      drawNameEventResponse?.data,
    ],
  );

  const {
    data: availableEventTypesResponse,
    isLoading: isAvailableEventTypesLoading,
    isError: isAvailableEventTypesError,
    refetch: refetchAvailableEventTypes,
  } = useAvailableEventTypesQuery(
    {
      per_page: 10,
      page: 1,
    },
    {
      enabled: open,
    },
  );
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    isFetching: isContactsFetching,
    isError: isContactsError,
    refetch: refetchContacts,
  } = useContactsQuery(
    {
      per_page: 25,
      page: 1,
      searchQuery: debouncedRecordSearchValue,
    },
    {
      enabled: open && currentStep === "record" && hasEnsuredMyContact,
    },
  );
  const {
    data: eventParticipantContactIdsResponse,
    isLoading: isEventParticipantContactIdsLoading,
    isFetching: isEventParticipantContactIdsFetching,
    isError: isEventParticipantContactIdsError,
    refetch: refetchEventParticipantContactIds,
  } = useEventParticipantContactIdsQuery(drawNameEventId, {
    enabled: open && currentStep === "record",
  });
  const {
    data: eventParticipantsResponse,
    isLoading: isEventParticipantsLoading,
    isFetching: isEventParticipantsFetching,
    isError: isEventParticipantsError,
    refetch: refetchEventParticipants,
  } = useEventParticipantsQuery(
    drawNameEventId,
    {
      per_page: 20,
      page: 1,
    },
    {
      enabled:
        open &&
        Boolean(drawNameEventId) &&
        [
          "review-records",
          "exclusion-choice",
          "exclusion-record",
          "draw-spin",
          "draw-result",
        ].includes(currentStep),
    },
  );
  const {
    data: participantExclusionsResponse,
    isLoading: isParticipantExclusionsLoading,
    isFetching: isParticipantExclusionsFetching,
    isError: isParticipantExclusionsError,
    refetch: refetchParticipantExclusions,
  } = useParticipantExclusionsQuery(eventId, {
    enabled:
      open &&
      Boolean(eventId) &&
      ["exclusion-choice", "exclusion-record"].includes(currentStep),
  });
  const { data: myParticipantResponse, refetch: refetchMyParticipant } =
    useMyParticipantQuery(eventId, {
      enabled:
        open &&
        ["wishlist-gifts", "wishlist-notification"].includes(currentStep),
    });
  const currentParticipantId = myParticipantResponse?.data?.id ?? null;
  const {
    data: participantGiftSelectionsResponse,
    isLoading: isParticipantGiftSelectionsLoading,
    isFetching: isParticipantGiftSelectionsFetching,
    isError: isParticipantGiftSelectionsError,
    refetch: refetchParticipantGiftSelections,
  } = useParticipantGiftSelectionsQuery(currentParticipantId, eventId, {
    enabled: open && currentStep === "wishlist-gifts",
  });
  const {
    data: drawNameEventInvitationsResponse,
    isLoading: isDrawNameEventInvitationsLoading,
    isFetching: isDrawNameEventInvitationsFetching,
    isError: isDrawNameEventInvitationsError,
    refetch: refetchDrawNameEventInvitations,
  } = useDrawNameEventInvitationsQuery(drawNameEventId, {
    per_page: 25,
    page: 1,
    searchQuery: debouncedInviteSearchValue,
  }, {
    enabled: open && currentStep === "draw-invite",
  });
  const { data: giftRecipientResponse, refetch: refetchGiftRecipient } =
    useGiftRecipientQuery(eventId, {
      enabled:
        open &&
        ["draw-result"].includes(currentStep),
    });

  const eventOptions = useMemo<OverlaySelectOption[]>(
    () =>
      (availableEventTypesResponse?.data.data ?? [])
        .filter((eventType) => eventType.isActive)
        .map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
          icon: getEventTypeIcon(eventType.key),
          isManageable: Boolean(eventType.user_id ?? eventType.createdById),
        })),
    [availableEventTypesResponse],
  );

  const fetchedRecordOptions = useMemo<SearchableRecordItem[]>(
    () =>
      (contactsResponse?.data.data ?? [])
        .map((contact) => mapContactToRecordItem(contact, currentUserContactId))
        .filter((record) => !deletedRecordIds.includes(record.id)),
    [contactsResponse, currentUserContactId, deletedRecordIds],
  );
  const fetchedParticipantRecords = useMemo<SearchableRecordItem[]>(
    () =>
      (eventParticipantsResponse?.data.data ?? [])
        .map((participant) => mapEventParticipantToRecordItem(participant))
        .filter((record): record is SearchableRecordItem => Boolean(record))
        .filter((record) => !deletedRecordIds.includes(record.id)),
    [deletedRecordIds, eventParticipantsResponse],
  );
  const participantByContactId = useMemo(
    () =>
      Object.fromEntries(
        (eventParticipantsResponse?.data.data ?? [])
          .map((participant) => {
            const contactId =
              participant.eventContact?.id ||
              participant.eventContactId ||
              null;

            return contactId ? [contactId, participant] : null;
          })
          .filter((entry): entry is [string, EventParticipant] =>
            Boolean(entry),
          ),
      ),
    [eventParticipantsResponse],
  );
  const participantContactIdByParticipantId = useMemo(
    () =>
      Object.fromEntries(
        (eventParticipantsResponse?.data.data ?? [])
          .map((participant) => {
            const contactId =
              participant.eventContact?.id ||
              participant.eventContactId ||
              null;

            return contactId ? [participant.id, contactId] : null;
          })
          .filter((entry): entry is [string, string] => Boolean(entry)),
      ),
    [eventParticipantsResponse],
  );
  const inviteUrlByParticipantId = useMemo(
    () =>
      Object.fromEntries(
        (drawNameEventInvitationsResponse?.data.data ?? []).map(
          (invitation) => [invitation.participantId, invitation.inviteUrl],
        ),
      ) as Record<string, string>,
    [drawNameEventInvitationsResponse],
  );
  const participantGiftSelections = useMemo(
    () =>
      normalizeParticipantGiftSelections(
        participantGiftSelectionsResponse?.data ?? null,
      ),
    [participantGiftSelectionsResponse],
  );
  const drawInviteParticipants = useMemo<DrawNameInviteParticipant[]>(
    () =>
      (drawNameEventInvitationsResponse?.data.data ?? []).map((invitation) => {
        const actor = invitation.eventContact;
        const fullName =
          `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim() ||
          actor.email ||
          "Participant";
        const firstInitial = actor.firstName?.trim().charAt(0) ?? "";
        const lastInitial = actor.lastName?.trim().charAt(0) ?? "";
        const initials =
          `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
          fullName.slice(0, 2).toUpperCase();
        const { avatarBg, avatarColor } = getContactAvatarStyle(
          actor.id || invitation.participantId || fullName,
        );

        return {
          id: actor.id || invitation.participantId,
          participantId: invitation.participantId,
          name: fullName,
          role:
            invitation.status.toLowerCase() === "accepted"
              ? "Accepted invite"
              : actor.email || "Pending invite",
          initials,
          avatarBg,
          avatarColor,
          inviteUrl: invitation.inviteUrl ?? null,
        };
      }),
    [drawNameEventInvitationsResponse],
  );
  const exclusionIdByContactPairKey = useMemo(
    () =>
      Object.fromEntries(
        (participantExclusionsResponse?.data ?? [])
          .map((exclusion) => {
            const [participantOneId, participantTwoId] =
              exclusion.participantIds;
            const participantOneContactId =
              participantContactIdByParticipantId[participantOneId] || null;
            const participantTwoContactId =
              participantContactIdByParticipantId[participantTwoId] || null;

            if (!participantOneContactId || !participantTwoContactId) {
              return null;
            }

            const pairKey = [participantOneContactId, participantTwoContactId]
              .sort()
              .join("::");

            return [pairKey, exclusion.id] as const;
          })
          .filter((entry): entry is readonly [string, string] =>
            Boolean(entry),
          ),
      ),
    [participantContactIdByParticipantId, participantExclusionsResponse],
  );

  const filteredCustomRecordOptions = useMemo(() => {
    const normalizedQuery = recordSearchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return customRecordOptions;
    }

    return customRecordOptions.filter((record) =>
      `${record.name} ${record.subtitle}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [customRecordOptions, recordSearchValue]);

  const recordOptions = useMemo(
    () => mergeRecordItems(fetchedRecordOptions, filteredCustomRecordOptions),
    [fetchedRecordOptions, filteredCustomRecordOptions],
  );

  const allKnownRecordOptions = useMemo(
    () =>
      mergeRecordItems(
        Object.values(persistedFetchedRecordItemsById),
        customRecordOptions,
      ).filter((record) => !deletedRecordIds.includes(record.id)),
    [customRecordOptions, deletedRecordIds, persistedFetchedRecordItemsById],
  );

  const selectedRecordOptions = useMemo(
    () =>
      allKnownRecordOptions.filter((record) =>
        selectedRecordIds.includes(record.id),
      ),
    [allKnownRecordOptions, selectedRecordIds],
  );
  const greetingName = firstName?.trim() || "Andrew";
  const signedInEmail = authUser?.email?.trim().toLowerCase() || "";
  const adminRecordId = useMemo(
    () =>
      allKnownRecordOptions.find(
        (record) => record.email?.trim().toLowerCase() === signedInEmail,
      )?.id ?? null,
    [allKnownRecordOptions, signedInEmail],
  );
  const lockedSelectedRecordIds = adminRecordId ? [adminRecordId] : [];

  const selectedRecordReviewItems = useMemo(
    () =>
      selectedRecordOptions
        .map((record) => ({
          id: record.id,
          name: record.name,
          email: record.email || record.subtitle,
          isAdmin: record.email?.trim().toLowerCase() === signedInEmail,
        }))
        .sort(
          (left, right) =>
            Number(Boolean(right.isAdmin)) - Number(Boolean(left.isAdmin)),
        ),
    [selectedRecordOptions, signedInEmail],
  );
  const selectedEventLabel =
    eventOptions.find((option) => option.value === selectedEventId)?.label ||
    "Team Retreat";
  const selectedEventYear = getEventYear(eventDate);
  const suggestedGroupName = selectedEventYear
    ? `${selectedEventLabel} - ${selectedEventYear}`
    : selectedEventLabel;
  const resolvedReadyStepEventName =
    groupName.trim() ||
    drawNameEventResponse?.data.event?.title?.trim() ||
    suggestedGroupName;
  const resolvedDrawResultName =
    getGiftRecipientDisplayName(giftRecipientResponse?.data ?? null) ||
    drawResultName ||
    selectedRecordReviewItems.find((item) => !item.isAdmin)?.name ||
    selectedRecordReviewItems[0]?.name ||
    "NO PARTICIPANT";
  const eventSelectPlaceholder = isAvailableEventTypesLoading
    ? "Loading events..."
    : isAvailableEventTypesError
      ? "Unable to load events"
      : "Select Event";
  const activeDraftMutation =
    createDrawNameEventMutation.isPending ||
    updateDrawNameEventMutation.isPending;
  const activeContactMutation =
    createContactMutation.isPending || updateContactMutation.isPending;

  useEffect(() => {
    if (currentStep !== "wishlist-gifts" || !participantGiftSelectionsResponse) {
      return;
    }

    const selectedProducts = participantGiftSelections
      .map((selection) => mapParticipantGiftSelectionToMarketplaceProduct(selection))
      .filter((product): product is MarketplaceProduct => Boolean(product));
    const hasLocalWishlistSelection =
      selectedWishlistGiftIds.length > 0 ||
      Object.keys(selectedWishlistGiftProductsById).length > 0;

    if (!hasLocalWishlistSelection) {
      const nextSelectedWishlistGiftIds = selectedProducts.map(
        (product) => product._id,
      );

      setSelectedWishlistGiftIds((current) =>
        current.length === nextSelectedWishlistGiftIds.length &&
        current.every((giftId, index) => giftId === nextSelectedWishlistGiftIds[index])
          ? current
          : nextSelectedWishlistGiftIds,
      );
    }

    setSelectedWishlistGiftProductsById((current) => {
      if (!hasLocalWishlistSelection) {
        const next = Object.fromEntries(
          selectedProducts.map((product) => [product._id, product]),
        );

        const hasChanged =
          Object.keys(current).length !== Object.keys(next).length ||
          Object.entries(next).some(
            ([productId, product]) =>
              !areMarketplaceProductSnapshotsEqual(current[productId], product),
          );

        return hasChanged ? next : current;
      }

      const next = { ...current };
      let hasChanged = false;

      selectedProducts.forEach((product) => {
        if (current[product._id] || selectedWishlistGiftIds.includes(product._id)) {
          const mergedProduct =
            mergeMarketplaceProductSnapshots(current[product._id], product) ??
            product;

          if (
            !areMarketplaceProductSnapshotsEqual(
              current[product._id],
              mergedProduct,
            )
          ) {
            next[product._id] = mergedProduct;
            hasChanged = true;
          }
        }
      });

      return hasChanged ? next : current;
    });
  }, [
    currentStep,
    participantGiftSelections,
    participantGiftSelectionsResponse,
    selectedWishlistGiftIds,
    selectedWishlistGiftProductsById,
  ]);

  const allRecordsSelected =
    recordOptions.length > 0 &&
    recordOptions.every((record) => selectedRecordIds.includes(record.id));
  const isSaveNewColleagueDisabled =
    !newColleagueForm.gender ||
    !newColleagueForm.firstName.trim() ||
    !newColleagueForm.lastName.trim();

  const getIsoDateValue = (value?: string) => {
    if (!value?.trim()) {
      return new Date().toISOString();
    }

    const normalizedDate = new Date(value);

    return Number.isNaN(normalizedDate.getTime())
      ? new Date().toISOString()
      : normalizedDate.toISOString();
  };

  const parseBudgetAmount = (value: string) => {
    const numericValue = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const getSelectedBudgetAmount = () => {
    if (selectedBudget === "More") {
      return parseBudgetAmount(customBudget);
    }

    return parseBudgetAmount(selectedBudget);
  };

  const resolvedWishlistMaximumSpend = useMemo(() => {
    const selectedAmount = getSelectedBudgetAmount();

    if (selectedAmount > 0) {
      return selectedAmount;
    }

    const persistedAmount = Number(
      drawNameEventResponse?.data?.budget ??
        drawNameEventResponse?.data?.maximumSpend ??
        0,
    );

    return Number.isFinite(persistedAmount) && persistedAmount > 0
      ? persistedAmount
      : undefined;
  }, [
    customBudget,
    drawNameEventResponse?.data?.budget,
    drawNameEventResponse?.data?.maximumSpend,
    selectedBudget,
  ]);

  const buildCreateDraftPayload = (): DrawNameEventCreatePayload => {
    const resolvedEventDate = getIsoDateValue(eventDate);
    const resolvedTitle = groupName.trim() || selectedEventLabel;

    return {
      drawDate: resolvedEventDate,
      event: {
        title: resolvedTitle,
        eventTypeId: selectedEventId,
        eventDate: resolvedEventDate,
      },
    };
  };

  const resetModalState = () => {
    setSelectedEventId("");
    setSelectedRecordIds([]);
    setExcludedRecordIds([]);
    setPairedRecordIdsById({});
    setCustomRecordOptions([]);
    setEditingRecordId(null);
    setRecordPendingDelete(null);
    setDeletedRecordIds([]);
    setAddRecordReturnStep("record");
    setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
    setExclusionChoice("");
    setEventDate("");
    setGroupName("");
    setCameToBudgetFromGroupName(false);
    setSelectedBudget("");
    setCustomBudget("");
    setSelectedWishlistGiftIds([]);
    setSelectedWishlistGiftProductsById({});
    setWishlistNotificationChoice("yes");
    setIsCompleteDrawConfirmationOpen(false);
    setIsSendEmailConfirmationOpen(false);
    setIsCopyInvitePanelOpen(false);
    setInviteSearchValue("");
    setDebouncedInviteSearchValue("");
    setDrawResultName("");
    setRecordSearchValue("");
    setDebouncedRecordSearchValue("");
    setPersistedFetchedRecordItemsById({});
    setHasEnsuredMyContact(false);
    setEnsureRequested(false);
    setIsFlowSelectionHydrated(false);
    hydratedFlowSelectionKeyRef.current = null;
  };

  useEffect(() => {
    if (open) {
      setIsForceClosing(false);
      return;
    }

    setIsForceClosing(false);
    hydratedDrawNameEventIdRef.current = null;
    hydratedFlowSelectionKeyRef.current = null;
    hasTouchedEventTypeRef.current = false;
    hasTouchedEventDateRef.current = false;
    suggestedGroupNameRef.current = "";
    hasTouchedGroupNameRef.current = false;
    resetModalState();
  }, [open]);

  useEffect(() => {
    if (hydratedFlowSelectionKeyRef.current === flowSelectionKey) {
      return;
    }

    setIsFlowSelectionHydrated(false);
    setSelectedEventId(storedFlowSelection.selectedEventId);
    setSelectedRecordIds(storedFlowSelection.selectedRecordIds);
    setExclusionChoice(storedFlowSelection.exclusionChoice);
    setEventDate(storedFlowSelection.eventDate);
    setGroupName(storedFlowSelection.groupName);
    setCameToBudgetFromGroupName(
      storedFlowSelection.cameToBudgetFromGroupName,
    );
    setSelectedBudget(storedFlowSelection.selectedBudget);
    setCustomBudget(storedFlowSelection.customBudget);
    setSelectedWishlistGiftIds(storedFlowSelection.selectedWishlistGiftIds);
    setSelectedWishlistGiftProductsById(
      storedFlowSelection.selectedWishlistGiftProductsById,
    );
    setWishlistNotificationChoice(
      storedFlowSelection.wishlistNotificationChoice,
    );
    setCustomRecordOptions(storedFlowSelection.customRecordOptions);
    setPersistedFetchedRecordItemsById(
      storedFlowSelection.persistedFetchedRecordItemsById,
    );
    setPairedRecordIdsById(
      normalizePairedRecordIdsById(storedFlowSelection.pairedRecordIdsById),
    );
    setEditingRecordId(storedFlowSelection.addRecordDraft.editingRecordId);
    setAddRecordReturnStep(storedFlowSelection.addRecordDraft.returnStep);
    setNewColleagueForm(storedFlowSelection.addRecordDraft.form);
    hydratedFlowSelectionKeyRef.current = flowSelectionKey;
    setIsFlowSelectionHydrated(true);
  }, [flowSelectionKey, storedFlowSelection]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredSelectedRecordIds(flowSelectionKey, selectedRecordIds);
  }, [
    flowSelectionKey,
    isFlowSelectionHydrated,
    selectedRecordIds,
    setStoredSelectedRecordIds,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredSelectedWishlistGiftIds(flowSelectionKey, selectedWishlistGiftIds);
  }, [
    flowSelectionKey,
    isFlowSelectionHydrated,
    selectedWishlistGiftIds,
    setStoredSelectedWishlistGiftIds,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredSelectedWishlistGiftProductsById(
      flowSelectionKey,
      selectedWishlistGiftProductsById,
    );
  }, [
    flowSelectionKey,
    isFlowSelectionHydrated,
    selectedWishlistGiftProductsById,
    setStoredSelectedWishlistGiftProductsById,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredCustomRecordOptions(flowSelectionKey, customRecordOptions);
  }, [
    customRecordOptions,
    flowSelectionKey,
    isFlowSelectionHydrated,
    setStoredCustomRecordOptions,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredPersistedFetchedRecordItemsById(
      flowSelectionKey,
      persistedFetchedRecordItemsById,
    );
  }, [
    flowSelectionKey,
    isFlowSelectionHydrated,
    persistedFetchedRecordItemsById,
    setStoredPersistedFetchedRecordItemsById,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredPairedRecordIdsById(flowSelectionKey, pairedRecordIdsById);
  }, [
    flowSelectionKey,
    isFlowSelectionHydrated,
    pairedRecordIdsById,
    setStoredPairedRecordIdsById,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredAddRecordDraft(flowSelectionKey, {
      editingRecordId,
      returnStep: addRecordReturnStep,
      form: newColleagueForm,
    });
  }, [
    addRecordReturnStep,
    editingRecordId,
    flowSelectionKey,
    isFlowSelectionHydrated,
    newColleagueForm,
    setStoredAddRecordDraft,
  ]);

  useEffect(() => {
    if (
      !flowSelectionKey ||
      hydratedFlowSelectionKeyRef.current !== flowSelectionKey ||
      !isFlowSelectionHydrated
    ) {
      return;
    }

    setStoredDraftFields(flowSelectionKey, {
      lastVisitedStep: currentStep,
      selectedEventId,
      exclusionChoice,
      eventDate,
      groupName,
      cameToBudgetFromGroupName,
      selectedBudget,
      customBudget,
      wishlistNotificationChoice,
    });
  }, [
    cameToBudgetFromGroupName,
    currentStep,
    customBudget,
    eventDate,
    exclusionChoice,
    flowSelectionKey,
    groupName,
    isFlowSelectionHydrated,
    selectedBudget,
    selectedEventId,
    setStoredDraftFields,
    wishlistNotificationChoice,
  ]);

  useEffect(() => {
    const drawNameEvent = drawNameEventResponse?.data;

    if (
      !open ||
      !["event", "event-date", "group-name", "budget", "draw-ready"].includes(
        currentStep,
      ) ||
      !drawNameEventId ||
      !drawNameEvent
    ) {
      return;
    }

    const isNewDrawNameEvent =
      hydratedDrawNameEventIdRef.current !== drawNameEventId;
    const nextEventTypeId = drawNameEvent.event.eventTypeId || "";
    const nextEventDate = toDateInputValue(drawNameEvent.event.eventDate);
    const nextGroupName = drawNameEvent.event.title || "";

    const {
      selectedBudget: nextSelectedBudget,
      customBudget: nextCustomBudget,
    } = toBudgetSelection(drawNameEvent.budget || drawNameEvent.maximumSpend);
    const persistedSelectedEventId =
      storedFlowSelection.selectedEventId || nextEventTypeId;
    const persistedEventDate =
      storedFlowSelection.eventDate || nextEventDate;
    const persistedGroupName =
      storedFlowSelection.groupName || nextGroupName;
    const persistedSelectedBudget =
      storedFlowSelection.selectedBudget || nextSelectedBudget;
    const persistedCustomBudget =
      storedFlowSelection.customBudget || nextCustomBudget;

    if (isNewDrawNameEvent) {
      hasTouchedEventTypeRef.current = false;
      hasTouchedEventDateRef.current = false;
      hasTouchedGroupNameRef.current = false;
      setSelectedBudget(persistedSelectedBudget);
      setCustomBudget(persistedCustomBudget);
    }

    if (
      isNewDrawNameEvent ||
      !hasTouchedEventTypeRef.current ||
      !selectedEventId
    ) {
      setSelectedEventId(persistedSelectedEventId);
    }

    if (isNewDrawNameEvent || !hasTouchedEventDateRef.current || !eventDate) {
      setEventDate(persistedEventDate);
    }

    if (
      isNewDrawNameEvent ||
      !hasTouchedGroupNameRef.current ||
      !groupName.trim()
    ) {
      setGroupName(persistedGroupName);
    }

    hydratedDrawNameEventIdRef.current = drawNameEventId;
  }, [
    currentStep,
    drawNameEventId,
    drawNameEventResponse,
    eventDate,
    groupName,
    open,
    storedFlowSelection.customBudget,
    storedFlowSelection.eventDate,
    storedFlowSelection.groupName,
    storedFlowSelection.selectedBudget,
    storedFlowSelection.selectedEventId,
    selectedEventId,
  ]);

  useEffect(() => {
    if (!open || currentStep !== "wishlist-choice") {
      return;
    }

    onReplaceStep("wishlist-gifts");
  }, [currentStep, onReplaceStep, open]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedRecordSearchValue(recordSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [recordSearchValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedInviteSearchValue(inviteSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inviteSearchValue]);

  useEffect(() => {
    if (!fetchedRecordOptions.length) {
      return;
    }

    setPersistedFetchedRecordItemsById((current) => {
      const next = { ...current };

      fetchedRecordOptions.forEach((record) => {
        next[record.id] = record;
      });

      return next;
    });
  }, [fetchedRecordOptions]);

  useEffect(() => {
    if (!fetchedParticipantRecords.length) {
      return;
    }

    setPersistedFetchedRecordItemsById((current) => {
      const next = { ...current };

      fetchedParticipantRecords.forEach((record) => {
        next[record.id] = current[record.id]
          ? {
              ...record,
              createdById: current[record.id].createdById ?? record.createdById,
              isManageable:
                current[record.id].isManageable ?? record.isManageable,
              phoneNumber: current[record.id].phoneNumber || record.phoneNumber,
              gender: current[record.id].gender || record.gender,
            }
          : record;
      });

      return next;
    });
  }, [fetchedParticipantRecords]);

  useEffect(() => {
    if (
      !open ||
      currentStep !== "record" ||
      !authUser ||
      currentUserContactId ||
      myContactIdMutation.isPending
    ) {
      return;
    }

    void myContactIdMutation
      .mutateAsync()
      .then((response) => {
        setCurrentContactId(response.data?.contactId ?? null);
      })
      .catch(() => {});
  }, [
    authUser,
    currentStep,
    currentUserContactId,
    myContactIdMutation,
    open,
    setCurrentContactId,
  ]);

  useEffect(() => {
    if (
      !open ||
      currentStep !== "record" ||
      hasEnsuredMyContact ||
      ensureRequested
    ) {
      return;
    }

    setEnsureRequested(true);

    ensureMyContactMutation
      .mutateAsync()
      .then(() => {
        setHasEnsuredMyContact(true);
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to prepare your contact list right now.",
        );
      });
  }, [
    currentStep,
    ensureMyContactMutation,
    ensureRequested,
    hasEnsuredMyContact,
    open,
  ]);

  useEffect(() => {
    if (!adminRecordId) {
      return;
    }

    setSelectedRecordIds((current) =>
      current.includes(adminRecordId) ? current : [adminRecordId, ...current],
    );
  }, [adminRecordId]);

  useEffect(() => {
    if (currentStep !== "group-name") {
      return;
    }

    const normalizedGroupName = groupName.trim();

    if (
      !hasTouchedGroupNameRef.current ||
      normalizedGroupName === suggestedGroupNameRef.current
    ) {
      setGroupName(suggestedGroupName);
      hasTouchedGroupNameRef.current = false;
    }

    suggestedGroupNameRef.current = suggestedGroupName;
  }, [currentStep, groupName, suggestedGroupName]);

  useEffect(() => {
    const fetchedParticipantContactIds = (
      eventParticipantContactIdsResponse?.data ?? []
    ).filter((contactId) => !deletedRecordIds.includes(contactId));

    if (!fetchedParticipantContactIds.length) {
      return;
    }

    setSelectedRecordIds((current) =>
      Array.from(new Set([...current, ...fetchedParticipantContactIds])),
    );
  }, [deletedRecordIds, eventParticipantContactIdsResponse]);

  useEffect(() => {
    if (currentStep === "record") {
      return;
    }

    const fetchedParticipants = eventParticipantsResponse?.data.data ?? [];

    if (!fetchedParticipants.length) {
      return;
    }

    const fetchedParticipantContactIds = fetchedParticipants
      .map(
        (participant) =>
          participant.eventContact?.id || participant.eventContactId || null,
      )
      .filter(
        (contactId): contactId is string =>
          contactId !== null && !deletedRecordIds.includes(contactId),
      );

    if (!fetchedParticipantContactIds.length) {
      return;
    }

    setSelectedRecordIds((current) =>
      Array.from(new Set([...current, ...fetchedParticipantContactIds])),
    );
  }, [currentStep, deletedRecordIds, eventParticipantsResponse]);

  useEffect(() => {
    if (
      !open ||
      !["exclusion-choice", "exclusion-record"].includes(currentStep)
    ) {
      return;
    }

    if (
      isEventParticipantsLoading ||
      isEventParticipantsFetching ||
      isParticipantExclusionsLoading ||
      isParticipantExclusionsFetching
    ) {
      return;
    }

    if (!eventParticipantsResponse || !participantExclusionsResponse) {
      return;
    }

    const exclusions = participantExclusionsResponse?.data ?? [];

    const nextPairs = exclusions.reduce<Record<string, string[]>>(
      (accumulator, exclusion) => {
        const [participantOneId, participantTwoId] = exclusion.participantIds;
        const participantOneContactId =
          participantContactIdByParticipantId[participantOneId] || null;
        const participantTwoContactId =
          participantContactIdByParticipantId[participantTwoId] || null;

        if (
          participantOneContactId &&
          participantTwoContactId &&
          !deletedRecordIds.includes(participantOneContactId) &&
          !deletedRecordIds.includes(participantTwoContactId)
        ) {
          accumulator[participantOneContactId] = Array.from(
            new Set([
              ...(accumulator[participantOneContactId] ?? []),
              participantTwoContactId,
            ]),
          );
          accumulator[participantTwoContactId] = Array.from(
            new Set([
              ...(accumulator[participantTwoContactId] ?? []),
              participantOneContactId,
            ]),
          );
        }

        return accumulator;
      },
      {},
    );

    setPairedRecordIdsById(nextPairs);
  }, [
    currentStep,
    deletedRecordIds,
    eventParticipantsResponse,
    isEventParticipantsFetching,
    isEventParticipantsLoading,
    isParticipantExclusionsFetching,
    isParticipantExclusionsLoading,
    open,
    participantContactIdByParticipantId,
    participantExclusionsResponse,
  ]);

  useEffect(() => {
    setPairedRecordIdsById((current) => {
      const validIds = new Set(selectedRecordIds);
      let hasChanged = false;
      const nextEntries = Object.entries(current)
        .map(([recordId, pairedIds]) => {
          const nextPairedIds = pairedIds.filter(
            (pairedId) => validIds.has(recordId) && validIds.has(pairedId),
          );

          if (nextPairedIds.length !== pairedIds.length) {
            hasChanged = true;
          }

          return nextPairedIds.length > 0
            ? ([recordId, nextPairedIds] as const)
            : null;
        })
        .filter((entry): entry is readonly [string, string[]] => Boolean(entry));

      return hasChanged ? Object.fromEntries(nextEntries) : current;
    });
  }, [selectedRecordIds]);

  useEffect(() => {
    setIsPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (currentStep === "event") {
      void refetchAvailableEventTypes();

      if (drawNameEventId) {
        void refetchDrawNameEvent();
      }

      return;
    }

    if (currentStep === "record") {
      if (hasEnsuredMyContact) {
        void refetchContacts();
      }

      if (drawNameEventId) {
        void refetchEventParticipantContactIds();
      }

      return;
    }

    if (currentStep === "review-records") {
      if (drawNameEventId) {
        void refetchEventParticipants();
      }

      return;
    }

    if (
      currentStep === "exclusion-choice" ||
      currentStep === "exclusion-record"
    ) {
      if (drawNameEventId) {
        void refetchEventParticipants();
      }

      if (eventId) {
        void refetchParticipantExclusions();
      }

      return;
    }

    if (
      currentStep === "event-date" ||
      currentStep === "group-name" ||
      currentStep === "budget" ||
      currentStep === "draw-ready"
    ) {
      if (drawNameEventId) {
        void refetchDrawNameEvent();
      }

      return;
    }

    if (currentStep === "draw-spin") {
      if (drawNameEventId) {
        void refetchEventParticipants();
      }

      return;
    }

    if (currentStep === "draw-result") {
      if (eventId) {
        void refetchGiftRecipient();
        void refetchEventParticipants();
      }

      return;
    }

    if (currentStep === "draw-invite") {
      if (drawNameEventId) {
        void refetchDrawNameEventInvitations();
      }

      return;
    }

    if (currentStep === "wishlist-gifts" || currentStep === "wishlist-notification") {
      if (eventId) {
        void refetchMyParticipant();
      }
    }
  }, [
    currentStep,
    drawNameEventId,
    eventId,
    hasEnsuredMyContact,
    open,
    refetchAvailableEventTypes,
    refetchContacts,
    refetchDrawNameEvent,
    refetchEventParticipantContactIds,
    refetchEventParticipants,
    refetchDrawNameEventInvitations,
    refetchGiftRecipient,
    refetchMyParticipant,
    refetchParticipantExclusions,
  ]);

  useEffect(() => {
    if (!open || currentStep !== "exclusion-record") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseAndRedirect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentStep, open]);

  const handleCloseAndRedirect = () => {
    setIsForceClosing(true);
    onClose();
  };

  const handleEventNext = async () => {
    if (!selectedEventId) return;

    try {
      let nextDrawNameEventId = drawNameEventId;
      let nextEventId = eventId;

      if (drawNameEventId) {
        await updateDrawNameEventMutation.mutateAsync({
          id: drawNameEventId,
          payload: {
            event: {
              eventTypeId: selectedEventId,
            },
          },
        });
      } else {
        const response = await createDrawNameEventMutation.mutateAsync({
          ...buildCreateDraftPayload(),
          event: {
            ...buildCreateDraftPayload().event,
            title: selectedEventLabel,
            eventTypeId: selectedEventId,
          },
        });

        nextDrawNameEventId = response.data.id;
        nextEventId = response.data.event.id;
      }

      onStepChange("source", nextEventId, nextDrawNameEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your draw name draft right now.",
      );
    }
  };

  const handleCreateEventOption = async (name: string) => {
    const response = await createEventTypeMutation.mutateAsync({ name });

    if (response.data?.id) {
      toast.success(response.message);

      return {
        value: response.data.id,
        label: response.data.name,
        icon: getEventTypeIcon(response.data.key ?? null),
        isManageable: Boolean(
          response.data.user_id ?? response.data.createdById,
        ),
      } satisfies OverlaySelectOption;
    }
  };

  const handleUpdateEventOption = async (
    option: OverlaySelectOption,
    name: string,
  ) => {
    const response = await updateEventTypeMutation.mutateAsync({
      id: option.value,
      payload: { name },
    });

    toast.success(response.message);

    return {
      ...option,
      label: response.data?.name ?? name,
      icon: getEventTypeIcon(response.data?.key ?? null),
      isManageable: option.isManageable,
    } satisfies OverlaySelectOption;
  };

  const handleDeleteEventOption = async (option: OverlaySelectOption) => {
    const response = await deleteEventTypeMutation.mutateAsync(option.value);
    toast.success(response.message);
  };

  const handleSourceNext = () => {
    onStepChange("record");
  };

  const handleRecordNext = () => {
    if (!selectedRecordIds.length) return;
    onStepChange("review-records");
  };

  const handleReviewNext = async () => {
    if (!selectedRecordIds.length) return;

    if (!eventId) {
      handleCloseAndRedirect();
      return;
    }

    const participantContactIds = selectedRecordIds.filter(
      (contactId) => contactId !== adminRecordId,
    );

    if (participantContactIds.length > 0) {
      try {
        await createParticipantsBulkMutation.mutateAsync({
          eventId,
          role: "participant",
          contactIds: participantContactIds,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to add participants right now.",
        );
        return;
      }
    }

    setExclusionChoice((current) => current || "yes");
    onStepChange("exclusion-choice");
  };

  const handleExclusionNext = () => {
    if (!exclusionChoice) return;

    if (exclusionChoice === "yes") {
      if (selectedRecordIds.length < MINIMUM_COLLEAGUES_FOR_UNPAIRING) {
        toast.error(
          "Selected colleagues are less than the required number for unpairing.",
          {
            id: "draw-name-minimum-unpairing",
            position: "top-center",
          },
        );
        return;
      }

      onStepChange("exclusion-record");
      return;
    }

    onStepChange("event-date");
  };

  const handleExclusionRecordNext = () => {
    console.log({
      eventId: selectedEventId,
      participantIds: selectedRecordIds,
      exclusionChoice,
      excludedParticipantIds: excludedRecordIds,
      pairedParticipantIdsById: pairedRecordIdsById,
    });

    onStepChange("event-date");
  };

  const handleOpenAddNewColleague = (
    returnStep: "record" | "review-records" = "record",
  ) => {
    setAddRecordReturnStep(returnStep);
    setEditingRecordId(null);
    setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
    if (flowSelectionKey) {
      setStoredAddRecordDraft(flowSelectionKey, {
        editingRecordId: null,
        returnStep,
        form: EMPTY_NEW_COLLEAGUE_FORM,
      });
    }
    onStepChange("add-record");
  };

  const handleOpenEditColleague = (
    item: SearchableRecordItem,
    returnStep: "record" | "review-records",
  ) => {
    const nextFormValues: AddColleagueFormValues = {
      gender: item.gender || "",
      firstName: item.firstName || item.name.split(" ")[0] || "",
      lastName: item.lastName || item.name.split(" ").slice(1).join(" ") || "",
      phoneNumber: item.phoneNumber || "",
      email: item.email || "",
    };

    setAddRecordReturnStep(returnStep);
    setEditingRecordId(item.id);
    setNewColleagueForm(nextFormValues);
    if (flowSelectionKey) {
      setStoredAddRecordDraft(flowSelectionKey, {
        editingRecordId: item.id,
        returnStep,
        form: nextFormValues,
      });
    }
    onStepChange("add-record");
  };

  const handleRequestDeleteColleague = (item: SearchableRecordItem) => {
    if (item.id === adminRecordId) {
      return;
    }

    setRecordPendingDelete(item);
  };

  const handleNewColleagueChange = <K extends keyof AddColleagueFormValues>(
    field: K,
    value: AddColleagueFormValues[K],
  ) => {
    setNewColleagueForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveNewColleague = async () => {
    const firstNameValue = newColleagueForm.firstName.trim();
    const lastNameValue = newColleagueForm.lastName.trim();
    const genderValue = newColleagueForm.gender;

    if (!genderValue || !firstNameValue || !lastNameValue) return;

    try {
      const payload = {
        gender: genderValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        phoneNumber: newColleagueForm.phoneNumber.trim(),
        email: newColleagueForm.email.trim(),
      };
      const response = editingRecordId
        ? await updateContactMutation.mutateAsync({
            id: editingRecordId,
            payload,
          })
        : await createContactMutation.mutateAsync(payload);

      const createdRecord = mapContactToRecordItem(
        response.data,
        currentUserContactId,
      );

      setCustomRecordOptions((current) =>
        mergeRecordItems(
          current.filter((record) => record.id !== createdRecord.id),
          [createdRecord],
        ),
      );
      setPersistedFetchedRecordItemsById((current) => ({
        ...current,
        [createdRecord.id]: createdRecord,
      }));
      setDeletedRecordIds((current) =>
        current.filter((recordId) => recordId !== createdRecord.id),
      );
      setSelectedRecordIds((current) =>
        current.includes(createdRecord.id)
          ? current
          : [...current, createdRecord.id],
      );
      setRecordSearchValue("");
      setDebouncedRecordSearchValue("");
      setEditingRecordId(null);
      setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
      if (flowSelectionKey) {
        setStoredAddRecordDraft(flowSelectionKey, {
          ...EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
          returnStep: addRecordReturnStep,
        });
      }
      toast.success(response.message);
      onStepChange(addRecordReturnStep);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingRecordId
            ? "Unable to update contact right now."
            : "Unable to create contact right now.",
      );
    }
  };

  const handleDeleteColleague = async () => {
    if (!recordPendingDelete || recordPendingDelete.id === adminRecordId) {
      setRecordPendingDelete(null);
      return;
    }

    const recordId = recordPendingDelete.id;

    try {
      const response = await deleteContactMutation.mutateAsync(recordId);

      setSelectedRecordIds((current) =>
        current.filter((selectedId) => selectedId !== recordId),
      );
      setCustomRecordOptions((current) =>
        current.filter((record) => record.id !== recordId),
      );
      setPersistedFetchedRecordItemsById((current) => {
        const next = { ...current };
        delete next[recordId];
        return next;
      });
      setExcludedRecordIds((current) =>
        current.filter((excludedId) => excludedId !== recordId),
      );
      setDeletedRecordIds((current) =>
        current.includes(recordId) ? current : [...current, recordId],
      );
      setPairedRecordIdsById((current) => {
        if (
          !current[recordId] &&
          !Object.values(current).some((pairedRecordIds) =>
            pairedRecordIds.includes(recordId),
          )
        ) {
          return current;
        }

        const nextEntries = Object.entries(current)
          .map(([key, pairedRecordIds]) => {
            if (key === recordId) {
              return null;
            }

            const nextPairedRecordIds = pairedRecordIds.filter(
              (pairedRecordId) => pairedRecordId !== recordId,
            );

            return nextPairedRecordIds.length > 0
              ? ([key, nextPairedRecordIds] as const)
              : null;
          })
          .filter((entry): entry is readonly [string, string[]] => Boolean(entry));

        return Object.fromEntries(nextEntries);
      });

      if (editingRecordId === recordId) {
        setEditingRecordId(null);
        setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
        if (flowSelectionKey) {
          setStoredAddRecordDraft(flowSelectionKey, {
            ...EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
            returnStep: addRecordReturnStep,
          });
        }
      }

      toast.success(response.message);
      setRecordPendingDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete contact right now.",
      );
    }
  };

  const handleEventDateNext = async () => {
    if (!eventDate) return;

    if (!drawNameEventId) {
      handleCloseAndRedirect();
      return;
    }

    try {
      await updateDrawNameEventMutation.mutateAsync({
        id: drawNameEventId,
        payload: {
          event: {
            eventDate: getIsoDateValue(eventDate),
          },
        },
      });
      setCameToBudgetFromGroupName(false);
      onStepChange("budget");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this event date right now.",
      );
    }
  };

  const handleGroupNameNext = async () => {
    if (!drawNameEventId) {
      handleCloseAndRedirect();
      return;
    }

    try {
      await updateDrawNameEventMutation.mutateAsync({
        id: drawNameEventId,
        payload: {
          event: {
            title: groupName.trim() || suggestedGroupName,
          },
        },
      });
      setCameToBudgetFromGroupName(true);
      onStepChange("budget");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this group name right now.",
      );
    }
  };

  const handleBudgetNext = async () => {
    const resolvedBudgetAmount = getSelectedBudgetAmount();

    if (!drawNameEventId) {
  handleCloseAndRedirect();
      return;
    }

    try {
      await updateDrawNameEventMutation.mutateAsync({
        id: drawNameEventId,
        payload: {
          budget: resolvedBudgetAmount,
        },
      });
      onStepChange("wishlist-gifts");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this budget right now.",
      );
    }
  };

  const handleWishlistGiftProductToggle = (
    product: MarketplaceProduct,
    checked: boolean,
  ) => {
    setSelectedWishlistGiftProductsById((current) => {
      if (checked) {
        const mergedProduct =
          mergeMarketplaceProductSnapshots(current[product._id], product) ??
          product;

        if (
          areMarketplaceProductSnapshotsEqual(
            current[product._id],
            mergedProduct,
          )
        ) {
          return current;
        }

        return {
          ...current,
          [product._id]: mergedProduct,
        };
      }

      if (!(product._id in current)) {
        return current;
      }

      const next = { ...current };
      delete next[product._id];
      return next;
    });
  };

  const handleWishlistGiftsNext = async () => {
    if (!eventId) {
  handleCloseAndRedirect();
      return;
    }

    if (!currentParticipantId) {
      toast.error("Unable to resolve your participant record right now.");
      return;
    }

    const selectedProducts = selectedWishlistGiftIds
      .map((selectedId) => selectedWishlistGiftProductsById[selectedId])
      .filter((product): product is MarketplaceProduct => Boolean(product));

      if (!selectedProducts.length) {
        toast.error("Please select at least one gift before continuing.");
        return;
      }

      const hasBudgetExceededGift =
        typeof resolvedWishlistMaximumSpend === "number" &&
        resolvedWishlistMaximumSpend > 0 &&
        selectedProducts.some(
          (product) => Number(product.amount) > resolvedWishlistMaximumSpend,
        );

      if (hasBudgetExceededGift) {
        toast.error("Budget has been exceeded for this draw name.", {
          id: "draw-name-budget-exceeded",
          position: "top-center",
        });
        return;
      }

      const hasIncompleteGiftDetails = selectedProducts.some(
        (product) =>
          !product.title?.trim() ||
          product.title.trim() === "Selected gift" ||
          !Number.isFinite(product.amount) ||
          product.amount <= 0,
      );

      if (hasIncompleteGiftDetails) {
        toast.error(
          "Some selected gifts are not fully loaded yet. Please reselect them before continuing.",
        );
        return;
      }

      try {
        const response = await createBulkGiftsMutation.mutateAsync({
        eventId,
        recipientParticipantId: currentParticipantId,
        gifts: selectedProducts.map((product) => ({
          participantGiftId: product._id,
          title: product.title,
          description: product.description ?? "",
          amount: product.amount,
          currency: "NGN",
          imageUrl: product.images[0] || undefined,
          categorySlug: product.categorySlug || undefined,
          subCategorySlug: product.subCategorySlug || undefined,
          condition: product.condition || undefined,
          locationState: product.location?.state || undefined,
          locationCity: product.location?.city || undefined,
          sellerId: product.sellerId || undefined,
          productSlug: product.slug || undefined,
        })),
      });

      toast.success(response.message);
      onStepChange("wishlist-notification");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save selected gifts right now.",
      );
    }
  };

  const handleWishlistNotificationYes = async () => {
    if (!eventId) {
  handleCloseAndRedirect();
      return;
    }

    try {
      await updateMyParticipantNotificationMutation.mutateAsync({
        eventId,
        payload: {
          isNotified: true,
        },
      });
      onStepChange("draw-ready");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your notification preference right now.",
      );
    }
  };

  const handleWishlistNotificationNo = () => {
    onStepChange("draw-ready");
  };

  const handleDrawNameReadyNext = async () => {
    if (!drawNameEventId) {
  handleCloseAndRedirect();
      return;
    }

    try {
      await drawNameEventMutation.mutateAsync(drawNameEventId);
      onStepChange("draw-spin");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to draw names right now.",
      );
    }
  };

  const handleRequestCompleteDrawNameEvent = () => {
    setIsCompleteDrawConfirmationOpen(true);
  };

  const handleConfirmCompleteDrawNameEvent = async () => {
    if (!drawNameEventId) {
      handleCloseAndRedirect();
      return;
    }

    try {
      const response =
        await completeDrawNameEventMutation.mutateAsync(drawNameEventId);
      toast.success(response.message);
      setIsCompleteDrawConfirmationOpen(false);

      if (isCreatorForCurrentDrawFlow) {
        onStepChange("draw-invite");
        return;
      }

      handleCloseAndRedirect();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this draw name right now.",
      );
    }
  };

  const handleRequestSendEmailInvites = () => {
    setIsSendEmailConfirmationOpen(true);
  };

  const handleConfirmSendEmailInvites = async () => {
    if (!drawNameEventId) {
      handleCloseAndRedirect();
      return;
    }

    try {
      const response = await sendDrawNameEventInvitationsMutation.mutateAsync({
        drawNameEventId,
        payload: {
          channel: "email",
        },
      });
      toast.success(response.message);
      setIsSendEmailConfirmationOpen(false);
      setIsCopyInvitePanelOpen(true);
      await refetchDrawNameEventInvitations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send invitation emails right now.",
      );
    }
  };

  const handleToggleCopyInvitePanel = () => {
    setIsCopyInvitePanelOpen((current) => {
      const next = !current;

      if (next && drawNameEventId) {
        void refetchDrawNameEventInvitations();
      }

      return next;
    });
  };

  const handleCopyInvitationLink = async (participantId: string) => {
    const inviteUrl = inviteUrlByParticipantId[participantId];

    if (!inviteUrl) {
      toast.error(
        "No invitation link is available for this participant yet. Send email invite first.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invitation link copied.");
    } catch {
      toast.error("Unable to copy this invitation link right now.");
    }
  };

  const recordFooter = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <BackButton
        onClick={() => onStepChange("source")}
        className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
        iconClassName="size-[24px]"
      />

      <ModalButton
        variant="secondary"
        onClick={() =>
          setSelectedRecordIds(
            allRecordsSelected
              ? lockedSelectedRecordIds
              : Array.from(
                  new Set([
                    ...lockedSelectedRecordIds,
                    ...recordOptions.map((record) => record.id),
                  ]),
                ),
          )
        }
      >
        {allRecordsSelected ? "Clear all" : "Select all"}
      </ModalButton>

      <ModalButton
        onClick={handleRecordNext}
        disabled={!selectedRecordIds.length}
      >
        Next
      </ModalButton>
    </div>
  );

  const allExclusionRecordsSelected =
    selectedRecordOptions.length > 0 &&
    excludedRecordIds.length === selectedRecordOptions.length;
  const selectedExclusionPair =
    excludedRecordIds.length === 2
      ? ([excludedRecordIds[0], excludedRecordIds[1]] as const)
      : null;
  const isSelectedExclusionPairPaired = selectedExclusionPair
    ? pairedRecordIdsById[selectedExclusionPair[0]]?.includes(
        selectedExclusionPair[1],
      ) &&
      pairedRecordIdsById[selectedExclusionPair[1]]?.includes(
        selectedExclusionPair[0],
      )
    : false;
  const previewPairedRecordIdsById = useMemo(() => {
    if (!selectedExclusionPair || isSelectedExclusionPairPaired) {
      return {} as Record<string, string[]>;
    }

    const [firstId, secondId] = selectedExclusionPair;

    return {
      [firstId]: [secondId],
      [secondId]: [firstId],
    };
  }, [isSelectedExclusionPairPaired, selectedExclusionPair]);
  const displayPairedRecordIdsById = useMemo(
    () =>
      mergePairedRecordMaps(
        pairedRecordIdsById,
        previewPairedRecordIdsById,
      ),
    [pairedRecordIdsById, previewPairedRecordIdsById],
  );
  const pairedItemsById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(displayPairedRecordIdsById).map(
          ([recordId, pairedIds]) => [
            recordId,
            pairedIds
              .map((pairedId) =>
                selectedRecordOptions.find((record) => record.id === pairedId),
              )
              .filter(
                (record): record is SearchableRecordItem => Boolean(record),
              ),
          ],
        ),
      ) as Record<string, SearchableRecordItem[]>,
    [displayPairedRecordIdsById, selectedRecordOptions],
  );
  const pairedIndicatorIdsById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pairedRecordIdsById).map(([recordId, pairedIds]) => [
          recordId,
          pairedIds,
        ]),
      ),
    [pairedRecordIdsById],
  );
  const isExclusionActionPending =
    createParticipantExclusionsBulkMutation.isPending ||
    deleteParticipantExclusionMutation.isPending;
  const exclusionActionLabel = selectedExclusionPair
    ? isExclusionActionPending
      ? "Saving..."
      : isSelectedExclusionPairPaired
        ? "Pair"
        : "Unpair"
    : undefined;

  const handleToggleExclusionPair = async () => {
    if (!selectedExclusionPair) {
      return;
    }

    const [firstId, secondId] = selectedExclusionPair;
    const firstParticipantId = participantByContactId[firstId]?.id;
    const secondParticipantId = participantByContactId[secondId]?.id;

    console.log(selectedExclusionPair);

    if (!firstParticipantId || !secondParticipantId) {
      toast.error("Unable to resolve those participants right now.");
      return;
    }

    if (isSelectedExclusionPairPaired) {
      const pairKey = [firstId, secondId].sort().join("::");
      const exclusionId = exclusionIdByContactPairKey[pairKey];

      if (!exclusionId) {
        toast.error("Unable to find that exclusion right now.");
        return;
      }

      try {
        const response =
          await deleteParticipantExclusionMutation.mutateAsync(exclusionId);

        setPairedRecordIdsById((current) => {
          const next = { ...current };
          next[firstId] = (next[firstId] ?? []).filter((id) => id !== secondId);
          next[secondId] = (next[secondId] ?? []).filter((id) => id !== firstId);

          if (!next[firstId]?.length) {
            delete next[firstId];
          }

          if (!next[secondId]?.length) {
            delete next[secondId];
          }

          return next;
        });
        setExcludedRecordIds([]);
        toast.success(response.message);
        await refetchParticipantExclusions();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to remove that exclusion right now.",
        );
      }

      return;
    }

    try {
      const response =
        await createParticipantExclusionsBulkMutation.mutateAsync({
          exclusions: [
            {
              participantId: firstParticipantId,
              excludedParticipantId: secondParticipantId,
            },
          ],
        });

      setPairedRecordIdsById((current) => ({
        ...current,
        [firstId]: Array.from(new Set([...(current[firstId] ?? []), secondId])),
        [secondId]: Array.from(
          new Set([...(current[secondId] ?? []), firstId]),
        ),
      }));
      setExcludedRecordIds([]);
      toast.success(response.message);
      await refetchParticipantExclusions();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save exclusions right now.",
      );
    }
  };

  const handleBackFromExclusionRecord = () => {
    setExcludedRecordIds([]);
    onStepChange("exclusion-choice");
  };

  const exclusionRecordFooter = (
    <div className="flex items-center justify-center gap-3 pt-4">
      <BackButton
        onClick={handleBackFromExclusionRecord}
        className="flex items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
        iconClassName="size-[24px]"
      />

      <ModalButton
        className="!h-[38px] max-w-[100px]"
        onClick={handleExclusionRecordNext}
      >
        Next
      </ModalButton>
    </div>
  );

  const exclusionRecordContent =
    open && isPortalReady
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[#191A1F]/45 backdrop-blur-[2px]"
            />

            <div className="relative z-[101] w-full max-w-[494px]">
              <SearchableRecordPicker
                title="Search for colleague"
                items={selectedRecordOptions}
                selectedIds={excludedRecordIds}
                onSelectedIdsChange={setExcludedRecordIds}
                maxSelected={2}
                searchPlaceholder=""
                secondaryActionLabel={exclusionActionLabel}
                onSecondaryAction={handleToggleExclusionPair}
                pairedItemsById={pairedItemsById}
                pairedIndicatorIdsById={pairedIndicatorIdsById}
                footer={exclusionRecordFooter}
                className="max-h-[calc(100vh-2rem)] overflow-hidden"
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  const modalContent =
    currentStep === "event" ? (
      <div className="space-y-7">
        <div>
          <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
            Ok... Let&apos;s get started!
          </p>
          <p className="mt-2 text-[20px] font-normal text-[#434343]">
            What&apos;s the name of your event?
          </p>
        </div>

        {isAvailableEventTypesLoading ? (
          <ModalPanelSkeleton />
        ) : (
          <OverlaySelect
            value={selectedEventId}
            onValueChange={(value) => {
              hasTouchedEventTypeRef.current = true;
              setSelectedEventId(value);
            }}
            options={eventOptions}
            placeholder={eventSelectPlaceholder}
            panelTitle="Select an Event"
            searchPlaceholder=""
            addActionLabel="Add New"
            onCreateOption={handleCreateEventOption}
            onUpdateOption={handleUpdateEventOption}
            onDeleteOption={handleDeleteEventOption}
            triggerClassName="text-[10px]"
          />
        )}

        {isAvailableEventTypesError ? (
          <button
            type="button"
            onClick={() => refetchAvailableEventTypes()}
            className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry loading events
          </button>
        ) : null}

        <ModalButton
          onClick={handleEventNext}
          disabled={!selectedEventId || activeDraftMutation}
        >
          {activeDraftMutation ? "Saving..." : "Next"}
        </ModalButton>
      </div>
    ) : currentStep === "source" ? (
      <div className="space-y-12 pt-2">
        <div className="text-center">
          <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
            Hey {greetingName},
          </p>
          <p className="mt-2 text-[20px] font-normal text-[#434343]">
            Who&apos;d you like to draw names with?
          </p>
        </div>

        <div className="mx-auto max-w-[494px] space-y-4">
          <ModalButton
            variant="secondary"
            onClick={handleSourceNext}
            className="w-full"
          >
            From Record
          </ModalButton>

          <ModalButton
            type="button"
            variant="secondary"
            disabled
            className="w-full cursor-not-allowed border-[#D8D1F3] bg-[#F6F4FD] text-[#A79EDC] hover:bg-[#F6F4FD]"
          >
            From Oneda
          </ModalButton>
        </div>

        <div className="flex justify-center">
          <BackButton
            onClick={() => onStepChange("event")}
            className="flex size-[66px] items-center justify-center rounded-[14px] bg-[#F3EFFB] text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          />
        </div>
      </div>
    ) : currentStep === "record" ? (
      <div className="space-y-8 pt-2">
        <div className="text-center">
          <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
            Hey {greetingName},
          </p>
          <p className="mt-2 text-[20px] font-normal text-[#434343]">
            Who&apos;d you like to draw names with?
          </p>
        </div>

        <div className="mx-auto max-w-[494px]">
          <OverlayRecordPicker
            items={recordOptions}
            selectedIds={selectedRecordIds}
            onSelectedIdsChange={setSelectedRecordIds}
            lockedSelectedIds={lockedSelectedRecordIds}
            placeholder="Search for colleague"
            panelTitle="Search for colleague"
            searchPlaceholder=""
            searchValue={recordSearchValue}
            onSearchValueChange={setRecordSearchValue}
            disableLocalFiltering
            isLoading={
              ensureMyContactMutation.isPending ||
              isContactsLoading ||
              isContactsFetching ||
              isEventParticipantContactIdsLoading ||
              isEventParticipantContactIdsFetching
            }
            emptyStateText={
              isContactsError
                ? "Unable to load contacts."
                : "No colleague found."
            }
            triggerBottomAction={
              <BackButton
                onClick={() => onStepChange("source")}
                className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            }
            addActionLabel="Add New"
            onAddAction={() => handleOpenAddNewColleague("record")}
            onEditItem={(item) => handleOpenEditColleague(item, "record")}
            onDeleteItem={handleRequestDeleteColleague}
            footer={recordFooter}
            suspendDismiss={Boolean(recordPendingDelete)}
            triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
          />
        </div>

        {ensureMyContactMutation.isError ||
        isContactsError ||
        isEventParticipantContactIdsError ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (ensureMyContactMutation.isError) {
                  setHasEnsuredMyContact(false);
                  setEnsureRequested(false);
                }

                if (isContactsError) {
                  void refetchContacts();
                }

                if (isEventParticipantContactIdsError) {
                  void refetchEventParticipantContactIds();
                }
              }}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry loading contacts
            </button>
          </div>
        ) : null}
      </div>
    ) : currentStep === "add-record" ? (
      <AddColleagueForm
        values={newColleagueForm}
        onChange={handleNewColleagueChange}
        onBack={() => {
          setEditingRecordId(null);
          setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
          if (flowSelectionKey) {
            setStoredAddRecordDraft(flowSelectionKey, {
              ...EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
              returnStep: addRecordReturnStep,
            });
          }
          onStepChange(addRecordReturnStep);
        }}
        onSave={handleSaveNewColleague}
        saveDisabled={isSaveNewColleagueDisabled}
        isSaving={activeContactMutation}
        saveLabel={editingRecordId ? "Edit" : "Save"}
        savingLabel={editingRecordId ? "Editing" : "Saving"}
      />
    ) : currentStep === "review-records" ? (
      <>
        <CustomColleagueReview
          greetingName={greetingName}
          items={selectedRecordReviewItems}
          onAddNew={() => handleOpenAddNewColleague("review-records")}
          onBack={() => onStepChange("record")}
          onNext={handleReviewNext}
          onEdit={(id) => {
            const item = allKnownRecordOptions.find(
              (record) => record.id === id,
            );
            if (item) {
              handleOpenEditColleague(item, "review-records");
            }
          }}
          onDelete={(id) => {
            const item = allKnownRecordOptions.find(
              (record) => record.id === id,
            );
            if (item) {
              handleRequestDeleteColleague(item);
            }
          }}
          nextDisabled={
            !selectedRecordReviewItems.some((item) => !item.isAdmin) ||
            createParticipantsBulkMutation.isPending ||
            isEventParticipantsLoading ||
            isEventParticipantsFetching
          }
        />

        {isEventParticipantsError ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => refetchEventParticipants()}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry loading participants
            </button>
          </div>
        ) : null}
      </>
    ) : currentStep === "exclusion-choice" ? (
      <ExclusionChoiceStep
        value={exclusionChoice}
        onChange={(value) => {
          setExclusionChoice(value);
          if (value === "no") {
            onStepChange("event-date");
          }
        }}
        onBack={() => onStepChange("review-records")}
        onNext={handleExclusionNext}
      />
    ) : currentStep === "event-date" ? (
      <EventDateStep
        eventName={selectedEventLabel}
        value={eventDate}
        onChange={(value) => {
          hasTouchedEventDateRef.current = true;
          setEventDate(value);
        }}
        onBack={() => onStepChange("exclusion-choice")}
        onNext={handleEventDateNext}
        onGoToEventName={() => {
          setCameToBudgetFromGroupName(true);
          onStepChange("group-name");
        }}
      />
    ) : currentStep === "group-name" ? (
      <GroupNameStep
        value={groupName}
        onChange={(value) => {
          hasTouchedGroupNameRef.current = true;
          setGroupName(value);
        }}
        onBack={() => onStepChange("event-date")}
        onNext={handleGroupNameNext}
        onGoToEventName={() => onStepChange("event")}
      />
    ) : currentStep === "budget" ? (
      <GiftBudgetStep
        value={selectedBudget}
        customValue={customBudget}
        onChange={(nextValue) => {
          setSelectedBudget(nextValue);
          if (nextValue !== "More") {
            setCustomBudget("");
          }
        }}
        onCustomValueChange={setCustomBudget}
        onBack={() =>
          onStepChange(cameToBudgetFromGroupName ? "group-name" : "event-date")
        }
        onNext={handleBudgetNext}
      />
    ) : isParticipantDrawNameFlowStep(currentStep) ||
      currentStep === "draw-invite" ? (
      <DrawNameExecutionFlowSteps
        currentStep={currentStep}
        selectedWishlistGiftIds={selectedWishlistGiftIds}
        onSelectedWishlistGiftIdsChange={setSelectedWishlistGiftIds}
        onSelectedProductToggle={handleWishlistGiftProductToggle}
        maximumSpend={resolvedWishlistMaximumSpend}
        onWishlistBack={
          isParticipantFlow ? undefined : () => onStepChange("budget")
        }
        onWishlistNext={handleWishlistGiftsNext}
        isInitialSelectionLoading={
          isParticipantGiftSelectionsLoading ||
          isParticipantGiftSelectionsFetching
        }
        isInitialSelectionError={isParticipantGiftSelectionsError}
        onRetryInitialSelection={() => {
          void refetchMyParticipant();
          void refetchParticipantGiftSelections();
        }}
        isWishlistNextPending={createBulkGiftsMutation.isPending}
        wishlistNotificationChoice={wishlistNotificationChoice}
        onWishlistNotificationChoiceChange={setWishlistNotificationChoice}
        onWishlistNotificationYes={handleWishlistNotificationYes}
        onWishlistNotificationNo={handleWishlistNotificationNo}
        onWishlistNotificationBack={() => onStepChange("wishlist-gifts")}
        isWishlistNotificationPending={
          updateMyParticipantNotificationMutation.isPending
        }
        readyEventName={resolvedReadyStepEventName}
        onReadyBack={() => onStepChange("wishlist-notification")}
        onDrawName={handleDrawNameReadyNext}
        isDrawing={drawNameEventMutation.isPending}
        participantNames={selectedRecordReviewItems.map((item) => item.name)}
        onSpinBack={() => onStepChange("draw-ready")}
        onSpinNext={(selectedName) => {
          setDrawResultName(selectedName);
          onStepChange("draw-result");
        }}
        selectedName={resolvedDrawResultName}
        onResultBack={() => onStepChange("draw-spin")}
        onResultPrimaryAction={handleRequestCompleteDrawNameEvent}
        resultPrimaryActionLabel={
          isCreatorForCurrentDrawFlow ? "Invite Members" : "End Draw"
        }
        isResultPrimaryActionPending={completeDrawNameEventMutation.isPending}
        onInviteBack={() => onStepChange("draw-result")}
        inviteParticipants={drawInviteParticipants}
        isCopyListOpen={isCopyInvitePanelOpen}
        onToggleCopyList={handleToggleCopyInvitePanel}
        onSendEmail={handleRequestSendEmailInvites}
        onCopyLink={handleCopyInvitationLink}
        isSendingEmail={sendDrawNameEventInvitationsMutation.isPending}
        isLoadingLinks={
          isDrawNameEventInvitationsLoading ||
          isDrawNameEventInvitationsFetching
        }
        isLinksError={isDrawNameEventInvitationsError}
        onRetryLinks={() => {
          void refetchDrawNameEventInvitations();
        }}
        inviteSearchValue={inviteSearchValue}
        onInviteSearchValueChange={setInviteSearchValue}
      />
    ) : null;

  const isLargeGiftStep = currentStep === "wishlist-gifts";
  const isDrawResultStep = currentStep === "draw-result";
  const isDrawInviteStep = currentStep === "draw-invite";

  if (isForceClosing) {
    return null;
  }

  if (currentStep === "exclusion-record") {
    return exclusionRecordContent;
  }

  return (
    <>
      <ContentModal
        open={open}
        onClose={handleCloseAndRedirect}
        title="Start draw name"
        bodyScrollable={!isLargeGiftStep && !isDrawInviteStep}
        showHeader={false}
        showCloseButton={true}
        closeOnOverlayClick={false}
        dialogClassName={
          isLargeGiftStep
            ? "max-w-[1148px] max-h-[calc(100vh-1.5rem)] rounded-[18px] bg-white sm:rounded-[20px]"
            : "max-w-[536px] rounded-[18px] bg-white sm:rounded-[20px]"
        }
        bodyClassName={
          isDrawResultStep
            ? "overflow-hidden p-0"
            : isLargeGiftStep
              ? "!max-h-[calc(100vh-1.5rem)] h-[calc(100vh-1.5rem)] px-4 py-4 sm:px-8 sm:py-8 lg:px-10"
              : "px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
        }
      >
        {modalContent}
      </ContentModal>

      <ConfirmationModal
        open={Boolean(recordPendingDelete)}
        onClose={() => setRecordPendingDelete(null)}
        onConfirm={handleDeleteColleague}
        action="delete"
        title="Delete Contact"
        description={
          recordPendingDelete
            ? `Are you sure you want to delete ${recordPendingDelete.name}?`
            : "Are you sure you want to delete this contact?"
        }
        confirmText="Delete"
        isLoading={deleteContactMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isCompleteDrawConfirmationOpen}
        onClose={() => setIsCompleteDrawConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteDrawNameEvent}
        action="save"
        title={isCreatorForCurrentDrawFlow ? "Complete Draw Name" : "End Draw"}
        description={
          isCreatorForCurrentDrawFlow
            ? "Are you sure you want to end this draft and continue to invite members?"
            : "Are you sure you want to end this draw now?"
        }
        confirmText={isCreatorForCurrentDrawFlow ? "Yes, Continue" : "Yes, End Draw"}
        isLoading={completeDrawNameEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isSendEmailConfirmationOpen}
        onClose={() => setIsSendEmailConfirmationOpen(false)}
        onConfirm={handleConfirmSendEmailInvites}
        action="save"
        title="Send Invitation Emails"
        description="Are you sure you want to send invitation emails to all pending participants?"
        confirmText="Send Emails"
        isLoading={sendDrawNameEventInvitationsMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </>
  );
}
