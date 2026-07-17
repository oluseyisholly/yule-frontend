"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import EmailInviteComposeModal from "@/components/EmailInviteComposeModal";
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
import { useExternalBusinessesQuery } from "@/features/auth/hooks/useExternalBusinessesQuery";
import { useOnedaProfilesQuery } from "@/features/auth/hooks/useOnedaProfilesQuery";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useCreateBulkContactsMutation } from "@/features/contacts/hooks/useCreateBulkContactsMutation";
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
import { useContactGiftCartParticipantGiftIdsQuery } from "@/features/gifts/hooks/useContactGiftCartParticipantGiftIdsQuery";
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
import type { ExternalBusinessRecord } from "@/features/auth/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import { useSendEmailMutation } from "@/features/email/hooks/useSendEmailMutation";
import { useAuthStore } from "@/stores/auth-store";
import { YULE_SIGN_IN_URL } from "@/lib/external-links";
import {
  buildDrawNameFlowSelectionKey,
  EMPTY_DRAW_NAME_ADD_RECORD_DRAFT,
  EMPTY_DRAW_NAME_FLOW_SELECTION,
  useDrawNameFlowStore,
} from "@/stores/draw-name-flow-store";
import {
  isBackendRequiredDrawNameStep,
  isParticipantDrawNameFlowStep,
  type DrawNameModalStep,
} from "@/screens/draw-names/modal-steps";
import { shareInvite } from "@/lib/utils";

type DrawNameStartModalProps = {
  open: boolean;
  currentStep: DrawNameModalStep;
  eventId: string | null;
  drawNameEventId: string | null;
  flowActor: "creator" | "participant";
  renderInline?: boolean;
  transitionDirection?: 1 | -1;
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

const drawNameStepTransition = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

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
    profileUrl: contact.profileUrl?.trim() || null,
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
    profileUrl: contact.profileUrl?.trim() || null,
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mapExternalBusinessToRecordItem(
  business: ExternalBusinessRecord,
): SearchableRecordItem | null {
  const businessId = getExternalBusinessRootId(business);
  const businessName = business.businessName?.trim() || "";

  if (!businessId || !businessName) {
    return null;
  }

  const subtitleParts = [
    business.businessLocation?.trim(),
    business.state?.trim(),
    business.country?.trim(),
    business.industry?.trim(),
  ].filter(Boolean);
  const subtitle = subtitleParts.join(" • ") || "Business";
  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const { avatarBg, avatarColor } = getContactAvatarStyle(businessId);

  return {
    id: businessId,
    name: businessName,
    subtitle,
    createdById: null,
    isManageable: false,
    firstName: businessName,
    lastName: "",
    phoneNumber: "",
    gender: "",
    initials: initials || "ON",
    avatarBg,
    avatarColor,
  };
}

function getExternalBusinessRootId(business: ExternalBusinessRecord) {
  return business.id?.trim() || business._id?.trim() || "";
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
      .map(
        ([recordId, pairedIds]) => [recordId, Array.from(pairedIds)] as const,
      )
      .filter(([, pairedIds]) => pairedIds.length > 0),
  ) as Record<string, string[]>;
}

function getGiftRecipientDisplayName(result: GiftRecipientResult) {
  if (!result) {
    return "";
  }

  const firstName = result.eventContact?.firstName?.trim() || "";
  const lastName = result.eventContact?.lastName?.trim() || "";

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

function toMarketplaceCondition(
  value?: string,
): MarketplaceCondition | undefined {
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

function hasRichMarketplaceProductSnapshot(
  product?: MarketplaceProduct | null,
) {
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
  renderInline = false,
  transitionDirection = 1,
  onStepChange,
  onReplaceStep,
  onClose,
}: DrawNameStartModalProps) {
  const shouldReduceModalMotion = useReducedMotion();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const currentUserContactId = useAuthStore((state) => state.currentContactId);
  const setCurrentContactId = useAuthStore(
    (state) => state.setCurrentContactId,
  );
  const firstName = authUser?.firstName;
  const onedaAccountId =
    authUser?.profile?.accountId?._id?.trim() ||
    authUser?.hostAccountId?.trim() ||
    null;
  const flowSelectionKey = buildDrawNameFlowSelectionKey(
    flowActor,
    drawNameEventId,
    eventId,
  );
  const isParticipantFlow = flowActor === "participant";
  const modalStepDirection = transitionDirection;
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
  const [isInviteEmailModalOpen, setIsInviteEmailModalOpen] = useState(false);
  const [selectedOnedaBusinessIds, setSelectedOnedaBusinessIds] = useState<
    string[]
  >([]);
  const [selectedOnedaContactIds, setSelectedOnedaContactIds] = useState<
    string[]
  >([]);
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
  const [
    selectedWishlistGiftProductsById,
    setSelectedWishlistGiftProductsById,
  ] = useState<Record<string, MarketplaceProduct>>({});
  const [wishlistNotificationChoice, setWishlistNotificationChoice] = useState<
    "yes" | "no"
  >("yes");
  const [drawResultName, setDrawResultName] = useState("");
  const [isPortalReady, setIsPortalReady] = useState(false);
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [debouncedRecordSearchValue, setDebouncedRecordSearchValue] =
    useState("");
  const [eventTypeSearchValue, setEventTypeSearchValue] = useState("");
  const [debouncedEventTypeSearchValue, setDebouncedEventTypeSearchValue] =
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
  const createBulkContactsMutation = useCreateBulkContactsMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const myContactIdMutation = useMyContactIdMutation();
  const completeDrawNameEventMutation = useCompleteDrawNameEventMutation();
  const createDrawNameEventMutation = useCreateDrawNameEventMutation();
  const drawNameEventMutation = useDrawNameEventMutation();
  const updateDrawNameEventMutation = useUpdateDrawNameEventMutation();
  const sendEmailMutation = useSendEmailMutation();
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
          "draw-invite",
        ].includes(currentStep),
    });
  const isCreatorForCurrentDrawFlow = useMemo(
    () =>
      canManageDrawNameEvent(drawNameEventResponse?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentUserContactId?.trim() || null,
      }),
    [authUser?.id, currentUserContactId, drawNameEventResponse?.data],
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
      searchQuery: debouncedEventTypeSearchValue,
    },
    {
      enabled: open && currentStep === "event",
    },
  );
  const {
    data: onedaBusinesses = [],
    isLoading: isOnedaBusinessesLoading,
    isFetching: isOnedaBusinessesFetching,
    isError: isOnedaBusinessesError,
    refetch: refetchOnedaBusinesses,
  } = useExternalBusinessesQuery(onedaAccountId, authToken, {
    enabled:
      open &&
      currentStep === "oneda-business" &&
      Boolean(onedaAccountId) &&
      Boolean(authToken),
  });
  const selectedOnedaBusinessId = useMemo(() => {
    const candidateId = selectedOnedaBusinessIds.at(-1)?.trim() ?? "";

    if (!candidateId) {
      return null;
    }

    if (!onedaBusinesses.length) {
      return candidateId;
    }

    const selectedBusiness = onedaBusinesses.find(
      (business) => getExternalBusinessRootId(business) === candidateId,
    );

    return selectedBusiness
      ? getExternalBusinessRootId(selectedBusiness)
      : null;
  }, [onedaBusinesses, selectedOnedaBusinessIds]);
  const {
    data: onedaProfiles = [],
    isLoading: isOnedaProfilesLoading,
    isFetching: isOnedaProfilesFetching,
    isError: isOnedaProfilesError,
    refetch: refetchOnedaProfiles,
  } = useOnedaProfilesQuery(
    selectedOnedaBusinessId,
    authToken,
    debouncedRecordSearchValue,
    {
      enabled:
        open &&
        currentStep === "oneda-contact" &&
        Boolean(selectedOnedaBusinessId),
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
          "draw-invite",
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
  const { data: giftRecipientResponse, refetch: refetchGiftRecipient } =
    useGiftRecipientQuery(eventId, {
      enabled: open && ["draw-result"].includes(currentStep),
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
  const onedaBusinessOptions = useMemo<SearchableRecordItem[]>(
    () =>
      onedaBusinesses
        .map((business) => mapExternalBusinessToRecordItem(business))
        .filter((business): business is SearchableRecordItem =>
          Boolean(business),
        ),
    [onedaBusinesses],
  );
  const onedaBusinessOptionIds = useMemo(
    () => new Set(onedaBusinessOptions.map((business) => business.id)),
    [onedaBusinessOptions],
  );
  const onedaProfileOptions = useMemo<SearchableRecordItem[]>(
    () =>
      onedaProfiles.map((profile) => ({
        id: profile._id,
        name: `${profile.accountId.firstName} ${profile.accountId.lastName}`,
        email: profile.accountId.email,
        subtitle: profile.accountId.email,
        profileUrl: profile.profilePhotoUrl?.trim() || null,
        isSelectable: true,
      })),
    [onedaProfiles],
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
  const drawNameEventViewPath = drawNameEventId
    ? `/dashboard/draw-names/${drawNameEventId}`
    : "/dashboard/draw-names";
  const drawNameEventViewUrl =
    typeof window === "undefined"
      ? drawNameEventViewPath
      : `${window.location.origin}${drawNameEventViewPath}`;
  const drawNameSignInInviteUrl = `${YULE_SIGN_IN_URL}&redirectUrl=${encodeURIComponent(
    drawNameEventViewUrl,
  )}`;
  const participantGiftSelections = useMemo(
    () =>
      normalizeParticipantGiftSelections(
        participantGiftSelectionsResponse?.data ?? null,
      ),
    [participantGiftSelectionsResponse],
  );
  const {
    data: caughtMyEyeParticipantGiftIdsResponse,
    isLoading: isCaughtMyEyeParticipantGiftIdsLoading,
    isFetching: isCaughtMyEyeParticipantGiftIdsFetching,
  } = useContactGiftCartParticipantGiftIdsQuery({
    enabled: open && currentStep === "wishlist-gifts",
  });
  const caughtMyEyeParticipantGiftIds = useMemo(
    () =>
      Array.from(
        new Set(
          (
            caughtMyEyeParticipantGiftIdsResponse?.data.participantGiftIds ?? []
          ).filter(Boolean),
        ),
      ),
    [caughtMyEyeParticipantGiftIdsResponse],
  );
  const participantSelectedWishlistGiftIds = useMemo(
    () =>
      participantGiftSelections
        .map((selection) =>
          selection.participantGiftId?.trim() || selection.id?.trim() || "",
        )
        .filter(Boolean),
    [participantGiftSelections],
  );
  const prioritizedWishlistGiftIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...participantSelectedWishlistGiftIds,
          ...selectedWishlistGiftIds,
          ...caughtMyEyeParticipantGiftIds,
        ]),
      ),
    [
      caughtMyEyeParticipantGiftIds,
      participantSelectedWishlistGiftIds,
      selectedWishlistGiftIds,
    ],
  );
  const drawInviteParticipants = useMemo<DrawNameInviteParticipant[]>(
    () =>
      (eventParticipantsResponse?.data.data ?? []).map((participant) => {
        const actor = participant.eventContact ?? participant.user ?? null;
        const fullName =
          `${actor?.firstName ?? ""} ${actor?.lastName ?? ""}`.trim() ||
          actor?.email ||
          "Participant";
        const firstInitial = actor?.firstName?.trim().charAt(0) ?? "";
        const lastInitial = actor?.lastName?.trim().charAt(0) ?? "";
        const initials =
          `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
          fullName.slice(0, 2).toUpperCase();
        const { avatarBg, avatarColor } = getContactAvatarStyle(
          actor?.id || participant.id || fullName,
        );

        return {
          id: actor?.id || participant.id,
          participantId: participant.id,
          name: fullName,
          role:
            participant.role.toLowerCase() === "creator"
              ? "Creator"
              : actor?.email || "Participant",
          initials,
          avatarBg,
          avatarColor,
          email: actor?.email?.trim() || null,
          profileUrl: actor?.profileUrl?.trim() || null,
          inviteUrl: drawNameSignInInviteUrl,
        };
      }),
    [drawNameSignInInviteUrl, eventParticipantsResponse],
  );
  const lockedInviteEmails = useMemo(() => {
    const signedInEmailAddress = authUser?.email?.trim().toLowerCase() || "";
    const seen = new Set<string>();

    return drawInviteParticipants
      .filter((participant) => participant.role.toLowerCase() !== "creator")
      .map((participant) => participant.email?.trim() ?? "")
      .filter(Boolean)
      .filter((email) => {
        const normalizedEmail = email.toLowerCase();

        if (
          normalizedEmail === signedInEmailAddress ||
          seen.has(normalizedEmail)
        ) {
          return false;
        }

        seen.add(normalizedEmail);
        return true;
      });
  }, [authUser?.email, drawInviteParticipants]);
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
  const selectedRecordReviewDisplayItems = useMemo(
    () => selectedRecordReviewItems.filter((item) => !item.isAdmin),
    [selectedRecordReviewItems],
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
  const resolvedInviteEmailTitle =
    drawNameEventResponse?.data.event?.title?.trim() ||
    groupName.trim() ||
    selectedEventLabel ||
    "Draw Name Invitation";
  const defaultInviteEmailBody = `Hi,

You have been invited to join ${resolvedInviteEmailTitle} on Festa.

Please sign in with the link below to view the event and participate:
${drawNameSignInInviteUrl}

Thank you.`;
  const drawNameInviteShareMessage = `You have been invited to join ${resolvedInviteEmailTitle} on Festa.\n\nSign in with the link below to view the event and participate:\n${drawNameSignInInviteUrl}`;
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
    createContactMutation.isPending ||
    createBulkContactsMutation.isPending ||
    updateContactMutation.isPending;

  useEffect(() => {
    if (
      currentStep !== "wishlist-gifts" ||
      !participantGiftSelectionsResponse
    ) {
      return;
    }

    const selectedProducts = participantGiftSelections
      .map((selection) =>
        mapParticipantGiftSelectionToMarketplaceProduct(selection),
      )
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
        current.every(
          (giftId, index) => giftId === nextSelectedWishlistGiftIds[index],
        )
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
        if (
          current[product._id] ||
          selectedWishlistGiftIds.includes(product._id)
        ) {
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

  useEffect(() => {
    if (currentStep !== "wishlist-gifts" || !caughtMyEyeParticipantGiftIds.length) {
      return;
    }

    setSelectedWishlistGiftIds((current) => {
      const next = Array.from(
        new Set([...current, ...caughtMyEyeParticipantGiftIds]),
      );

      return next.length === current.length &&
        next.every((giftId, index) => giftId === current[index])
        ? current
        : next;
    });
  }, [caughtMyEyeParticipantGiftIds, currentStep]);

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
    setIsInviteEmailModalOpen(false);
    setDrawResultName("");
    setRecordSearchValue("");
    setDebouncedRecordSearchValue("");
    setEventTypeSearchValue("");
    setDebouncedEventTypeSearchValue("");
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
    setSelectedOnedaBusinessIds(storedFlowSelection.selectedOnedaBusinessIds);
    setSelectedOnedaContactIds(storedFlowSelection.selectedOnedaContactIds);
    setSelectedRecordIds(storedFlowSelection.selectedRecordIds);
    setExclusionChoice(storedFlowSelection.exclusionChoice);
    setEventDate(storedFlowSelection.eventDate);
    setGroupName(storedFlowSelection.groupName);
    setCameToBudgetFromGroupName(storedFlowSelection.cameToBudgetFromGroupName);
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
    if (!selectedOnedaBusinessIds.length || !onedaBusinessOptions.length) {
      return;
    }

    const hasInvalidBusinessSelection = selectedOnedaBusinessIds.some(
      (businessId) => !onedaBusinessOptionIds.has(businessId),
    );

    if (!hasInvalidBusinessSelection) {
      return;
    }

    setSelectedOnedaBusinessIds([]);
    setSelectedOnedaContactIds([]);
  }, [
    onedaBusinessOptionIds,
    onedaBusinessOptions.length,
    selectedOnedaBusinessIds,
  ]);

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
      selectedOnedaBusinessIds,
      selectedOnedaContactIds,
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
    selectedOnedaBusinessIds,
    selectedOnedaContactIds,
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
    const persistedEventDate = storedFlowSelection.eventDate || nextEventDate;
    const persistedGroupName = storedFlowSelection.groupName || nextGroupName;
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
      setDebouncedEventTypeSearchValue(eventTypeSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [eventTypeSearchValue]);

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
        .filter((entry): entry is readonly [string, string[]] =>
          Boolean(entry),
        );

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

    if (
      isBackendRequiredDrawNameStep(currentStep) &&
      (!eventId || !drawNameEventId)
    ) {
      toast.error("Please save this draw name draft before continuing.");
      onReplaceStep("event");
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
        void refetchEventParticipants();
      }

      return;
    }

    if (
      currentStep === "wishlist-gifts" ||
      currentStep === "wishlist-notification"
    ) {
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
    refetchGiftRecipient,
    refetchMyParticipant,
    refetchParticipantExclusions,
    onReplaceStep,
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

  const ensureDrawNameDraft = async () => {
    if (!selectedEventId) {
      throw new Error("Please select an event to continue.");
    }

    if (drawNameEventId) {
      await updateDrawNameEventMutation.mutateAsync({
        id: drawNameEventId,
        payload: {
          event: {
            eventTypeId: selectedEventId,
          },
        },
      });

      return {
        nextDrawNameEventId: drawNameEventId,
        nextEventId: eventId,
      };
    }

    const createDraftPayload = buildCreateDraftPayload();
    const response = await createDrawNameEventMutation.mutateAsync({
      ...createDraftPayload,
      event: {
        ...createDraftPayload.event,
        title: selectedEventLabel,
        eventTypeId: selectedEventId,
      },
    });

    return {
      nextDrawNameEventId: response.data.id,
      nextEventId: response.data.event.id,
    };
  };

  const handleEventNext = () => {
    if (!selectedEventId) return;
    onStepChange("source");
  };

  const handleEventSaveAndContinue = async () => {
    try {
      const { nextEventId, nextDrawNameEventId } = await ensureDrawNameDraft();

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

  const handleOpenOnedaBusinessStep = () => {
    if (!authToken || !onedaAccountId) {
      toast.error("Your Oneda business details are not available right now.");
      return;
    }

    onStepChange("oneda-business");
  };

  const handleSelectedOnedaBusinessIdsChange = (ids: string[]) => {
    const selectedId = ids.at(-1)?.trim() ?? "";
    const selectedBusiness = onedaBusinessOptions.find(
      (business) => business.id === selectedId,
    );

    setSelectedOnedaBusinessIds(selectedBusiness ? [selectedBusiness.id] : []);
    setSelectedOnedaContactIds([]);
  };

  const handleSourceNext = () => {
    onStepChange("record");
  };

  const handleOnedaBusinessNext = () => {
    if (!selectedOnedaBusinessId) return;
    onStepChange("oneda-contact");
  };

  const handleOnedaContactNext = () => {
    if (!selectedOnedaContactIds.length) return;

    const selectedProfiles = onedaProfiles.filter((profile) =>
      selectedOnedaContactIds.includes(profile._id),
    );

    if (!selectedProfiles.length) {
      toast.error("Please select at least one contact to continue.");
      return;
    }

    void (async () => {
      try {
        const response = await createBulkContactsMutation.mutateAsync({
          contacts: selectedProfiles.map((profile) => ({
            gender: "male",
            firstName: profile.accountId.firstName?.trim() || "Unknown",
            lastName: profile.accountId.lastName?.trim() || "Contact",
            phoneNumber: profile.accountId.phoneNumber?.trim() || "",
            email: profile.accountId.email?.trim() || "",
          })),
        });

        const importedRecords = response.data.map((contact) =>
          mapContactToRecordItem(contact, currentUserContactId),
        );
        const importedRecordIds = importedRecords.map((record) => record.id);

        setCustomRecordOptions((current) =>
          mergeRecordItems(current, importedRecords),
        );
        setPersistedFetchedRecordItemsById((current) => ({
          ...current,
          ...Object.fromEntries(
            importedRecords.map((record) => [record.id, record]),
          ),
        }));
        setSelectedRecordIds((current) =>
          Array.from(new Set([...current, ...importedRecordIds])),
        );

        toast.success(response.message);
        onStepChange("record");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to import business contacts right now.",
        );
      }
    })();
  };

  const handleRecordNext = () => {
    if (!selectedRecordIds.length) return;
    onStepChange("review-records");
  };

  const handleReviewNext = async () => {
    if (!selectedRecordIds.length) return;

    let nextEventId = eventId;
    let nextDrawNameEventId = drawNameEventId;

    if (!nextEventId || !nextDrawNameEventId) {
      try {
        const draft = await ensureDrawNameDraft();
        nextEventId = draft.nextEventId;
        nextDrawNameEventId = draft.nextDrawNameEventId;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to save this draw name draft right now.",
        );
        return;
      }
    }

    if (!nextEventId || !nextDrawNameEventId) {
      toast.error("Unable to resolve this draw name draft right now.");
      return;
    }

    const participantContactIds = selectedRecordIds.filter(
      (contactId) => contactId !== adminRecordId,
    );

    if (participantContactIds.length > 0) {
      try {
        await createParticipantsBulkMutation.mutateAsync({
          eventId: nextEventId,
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
    onStepChange("exclusion-choice", nextEventId, nextDrawNameEventId);
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
          .filter((entry): entry is readonly [string, string[]] =>
            Boolean(entry),
          );

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

  const handleEventDateNext = () => {
    if (!eventDate) return;
    setCameToBudgetFromGroupName(false);
    onStepChange("budget");
  };

  const handleEventDateSaveAndContinue = async () => {
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
    setIsInviteEmailModalOpen(true);
  };

  const handleSendInviteEmail = async ({
    title,
    body,
    emails,
  }: {
    title: string;
    body: string;
    emails: string[];
  }) => {
    const resolvedEventId =
      eventId?.trim() ||
      drawNameEventResponse?.data.eventId?.trim() ||
      drawNameEventResponse?.data.event?.id?.trim() ||
      "";
    const resolvedDrawNameEventId = drawNameEventId?.trim() || "";

    if (!resolvedEventId || !resolvedDrawNameEventId) {
      toast.error("Unable to resolve this draw name event right now.");
      return;
    }

    try {
      const response = await sendEmailMutation.mutateAsync({
        eventId: resolvedEventId,
        title,
        body,
        redirectUrl: drawNameSignInInviteUrl,
        emails,
        drawNameId: resolvedDrawNameEventId,
      });

      toast.success(response.message || "Invitation email sent successfully.");
      setIsInviteEmailModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send this invitation email right now.",
      );
    }
  };

  const handleCopyInvitationLink = async () => {
    const inviteUrl = drawNameSignInInviteUrl;

    if (!inviteUrl) {
      toast.error("Unable to resolve this invitation link right now.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invitation sign in link copied.");
    } catch {
      toast.error("Unable to copy this invitation link right now.");
    }
  };

  // const handleShareDrawNameInvite = (platform: "facebook" | "whatsapp") => {
  //   const inviteUrl = drawNameSignInInviteUrl;

  //   if (!inviteUrl) {
  //     toast.error("Unable to resolve this invitation link right now.");
  //     return;
  //   }

  //   const shareUrl =
  //     platform === "whatsapp"
  //       ? `https://wa.me/?text=${encodeURIComponent(drawNameInviteShareMessage)}`
  //       : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(drawNameInviteShareMessage)}`;

  //   const shareWindow = window.open(shareUrl, "_blank", "noopener,noreferrer");

  //   if (!shareWindow) {
  //     toast.error(
  //       `Unable to open ${platform === "whatsapp" ? "WhatsApp" : "Facebook"} right now.`,
  //     );
  //     return;
  //   }

  //   toast.success(
  //     `${platform === "whatsapp" ? "WhatsApp" : "Facebook"} share opened.`,
  //   );
  // };

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
      mergePairedRecordMaps(pairedRecordIdsById, previewPairedRecordIdsById),
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
              .filter((record): record is SearchableRecordItem =>
                Boolean(record),
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
          next[secondId] = (next[secondId] ?? []).filter(
            (id) => id !== firstId,
          );

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
        className="!h-[38px] max-w-[170px]"
        onClick={handleExclusionRecordNext}
      >
        Save & Continue
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
            searchValue={eventTypeSearchValue}
            onSearchValueChange={setEventTypeSearchValue}
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

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ModalButton
            variant="secondary"
            onClick={handleEventNext}
            disabled={!selectedEventId || activeDraftMutation}
            className="max-w-[140px]"
          >
            Next
          </ModalButton>

          <ModalButton
            onClick={handleEventSaveAndContinue}
            disabled={!selectedEventId || activeDraftMutation}
            className="max-w-[210px]"
          >
            {activeDraftMutation ? "Saving..." : "Save & Continue"}
          </ModalButton>
        </div>
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
          <ModalButton onClick={handleOpenOnedaBusinessStep} className="w-full">
            Import from Oneda
          </ModalButton>
        </div>

        <div className="flex justify-center">
          <BackButton
            onClick={() => onStepChange("event")}
            className="flex size-[66px] items-center justify-center rounded-[14px] bg-[#F3EFFB] text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          />
        </div>
      </div>
    ) : currentStep === "oneda-business" ? (
      <div className="space-y-8 pt-2">
        <div className="text-center">
          <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
            Hey {greetingName},
          </p>
          <p className="mt-2 text-[20px] font-normal text-[#434343]">
            Which business are you selecting from?
          </p>
        </div>

        <div className="mx-auto max-w-[494px]">
          <OverlayRecordPicker
            items={onedaBusinessOptions}
            selectedIds={selectedOnedaBusinessIds}
            onSelectedIdsChange={handleSelectedOnedaBusinessIdsChange}
            placeholder="Search for business"
            panelTitle="Search for business"
            searchPlaceholder=""
            isLoading={isOnedaBusinessesLoading || isOnedaBusinessesFetching}
            emptyStateText={
              isOnedaBusinessesError
                ? "Unable to load businesses."
                : "No business found."
            }
            triggerBottomAction={
              <BackButton
                onClick={() => onStepChange("source")}
                className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            }
            footer={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <BackButton
                  onClick={() => onStepChange("source")}
                  className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                  iconClassName="size-[24px]"
                />

                <ModalButton
                  onClick={handleOnedaBusinessNext}
                  disabled={!selectedOnedaBusinessId}
                >
                  Next
                </ModalButton>
              </div>
            }
            triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
          />
        </div>

        {isOnedaBusinessesError ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => void refetchOnedaBusinesses()}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry loading businesses
            </button>
          </div>
        ) : null}
      </div>
    ) : currentStep === "oneda-contact" ? (
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
            items={onedaProfileOptions}
            selectedIds={selectedOnedaContactIds}
            onSelectedIdsChange={setSelectedOnedaContactIds}
            placeholder="Search for colleague"
            panelTitle="Search for colleague"
            searchPlaceholder=""
            searchValue={recordSearchValue}
            onSearchValueChange={setRecordSearchValue}
            disableLocalFiltering
            isLoading={isOnedaProfilesLoading || isOnedaProfilesFetching}
            emptyStateText={
              isOnedaProfilesError
                ? "Unable to load contacts."
                : "No colleague found."
            }
            triggerBottomAction={
              <BackButton
                onClick={() => onStepChange("oneda-business")}
                className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            }
            footer={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <BackButton
                  onClick={() => onStepChange("oneda-business")}
                  className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                  iconClassName="size-[24px]"
                />

                <ModalButton
                  onClick={handleOnedaContactNext}
                  disabled={
                    !selectedOnedaContactIds.length ||
                    createBulkContactsMutation.isPending
                  }
                >
                  {createBulkContactsMutation.isPending
                    ? "Importing..."
                    : "Next"}
                </ModalButton>
              </div>
            }
            triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
          />
        </div>

        {isOnedaProfilesError ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => void refetchOnedaProfiles()}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry loading contacts
            </button>
          </div>
        ) : null}
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
          items={selectedRecordReviewDisplayItems}
          onAddNew={() => handleOpenAddNewColleague("review-records")}
          onBack={() => onStepChange("source")}
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
            selectedRecordReviewDisplayItems.length === 0 ||
            activeDraftMutation ||
            createParticipantsBulkMutation.isPending ||
            isEventParticipantsLoading ||
            isEventParticipantsFetching
          }
          nextLabel={
            activeDraftMutation || createParticipantsBulkMutation.isPending
              ? "Saving..."
              : "Save & Continue"
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
        onSaveAndContinue={handleEventDateSaveAndContinue}
        isSaveAndContinuePending={updateDrawNameEventMutation.isPending}
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
        nextLabel="Save & Continue"
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
        nextLabel="Save & Continue"
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
          isParticipantGiftSelectionsFetching ||
          isCaughtMyEyeParticipantGiftIdsLoading ||
          isCaughtMyEyeParticipantGiftIdsFetching
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
        caughtMyEyeProductIds={caughtMyEyeParticipantGiftIds}
        prioritizedWishlistGiftIds={prioritizedWishlistGiftIds}
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
        onSendEmail={handleRequestSendEmailInvites}
        onShareFacebook={() =>
          shareInvite({
            platform: "facebook",
            inviteUrl: drawNameSignInInviteUrl,
            message: drawNameInviteShareMessage,
          })
        }
        onShareWhatsApp={() =>
          shareInvite({
            platform: "whatsapp",
            inviteUrl: drawNameSignInInviteUrl,
            message: drawNameInviteShareMessage,
          })
        }
        onCopyLink={handleCopyInvitationLink}
        isSendingEmail={sendEmailMutation.isPending}
      />
    ) : null;

  const isLargeGiftStep = currentStep === "wishlist-gifts";
  const isDrawResultStep = currentStep === "draw-result";
  const isDrawInviteStep = currentStep === "draw-invite";
  const animatedModalContent = shouldReduceModalMotion ? (
    modalContent
  ) : (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: modalStepDirection * 42 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: modalStepDirection * -42 }}
        transition={drawNameStepTransition}
        className={isLargeGiftStep ? "h-full w-full" : "w-full"}
      >
        {modalContent}
      </motion.div>
    </AnimatePresence>
  );

  if (isForceClosing) {
    return null;
  }

  if (currentStep === "exclusion-record") {
    return exclusionRecordContent;
  }

  const confirmationModals = (
    <>
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
        confirmText={
          isCreatorForCurrentDrawFlow ? "Yes, Continue" : "Yes, End Draw"
        }
        isLoading={completeDrawNameEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <EmailInviteComposeModal
        open={isInviteEmailModalOpen}
        onClose={() => setIsInviteEmailModalOpen(false)}
        initialTitle={resolvedInviteEmailTitle}
        initialBody={defaultInviteEmailBody}
        lockedEmails={lockedInviteEmails}
        onSubmit={handleSendInviteEmail}
        isSubmitting={sendEmailMutation.isPending}
      />
    </>
  );

  if (renderInline && currentStep === "wishlist-gifts") {
    return (
      <>
        <div className="mx-auto min-h-[760px] w-full max-w-[1448px] rounded-[24px] border border-[#F1EDF9] bg-white px-4 py-4 shadow-[0_12px_40px_rgba(29,18,68,0.06)] sm:px-6 sm:py-6 lg:h-[calc(100dvh-12rem)] lg:min-h-0 lg:px-8">
          <div className="h-full min-h-0">{modalContent}</div>
        </div>

        {confirmationModals}
      </>
    );
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
              ? "!max-h-[calc(100vh-1rem)] h-[calc(100vh-1rem)] px-4 py-4 sm:px-8 sm:py-8 lg:px-10"
              : "px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
        }
      >
        <div className={isLargeGiftStep ? "h-full overflow-hidden" : "overflow-hidden"}>
          {animatedModalContent}
        </div>
      </ContentModal>
      {confirmationModals}
    </>
  );
}
