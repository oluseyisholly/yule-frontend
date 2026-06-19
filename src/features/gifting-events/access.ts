import type {
  GiftingEventParticipant,
  GiftingEventRecord,
} from "@/features/gifting-events/types";

type GiftingEventCreatorAccessOptions = {
  currentUserId?: string | null;
  currentContactId?: string | null;
};

function normalizeValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function getCreatorParticipant(
  participants?: GiftingEventParticipant[] | null,
) {
  return (
    participants?.find(
      (participant) => participant.role?.trim().toLowerCase() === "creator",
    ) ?? null
  );
}

export function canManageGiftingEvent(
  giftingEvent: GiftingEventRecord | null | undefined,
  options: GiftingEventCreatorAccessOptions,
) {
  if (!giftingEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  const creatorParticipant = getCreatorParticipant(
    giftingEvent.event?.participants,
  );

  const ownerIdentifiers = [
    normalizeValue(giftingEvent.event?.createdBy?.id),
    normalizeValue(creatorParticipant?.eventContactId),
  ].filter((value): value is string => Boolean(value));

  return ownerIdentifiers.some(
    (ownerIdentifier) =>
      ownerIdentifier === currentUserId || ownerIdentifier === currentContactId,
  );
}
