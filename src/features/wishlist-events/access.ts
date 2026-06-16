import type { WishlistEventParticipant, WishlistEventRecord } from "@/features/wishlist-events/types";

type WishlistEventCreatorAccessOptions = {
  currentUserId?: string | null;
  currentContactId?: string | null;
};

function normalizeValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function getCreatorParticipant(
  participants?: WishlistEventParticipant[] | null,
) {
  return (
    participants?.find(
      (participant) => participant.role?.trim().toLowerCase() === "creator",
    ) ?? null
  );
}

export function canManageWishlistEvent(
  wishlistEvent: WishlistEventRecord | null | undefined,
  options: WishlistEventCreatorAccessOptions,
) {
  if (!wishlistEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  const creatorParticipant = getCreatorParticipant(
    wishlistEvent.event?.participants,
  );
  const ownerIdentifiers = [
    normalizeValue(wishlistEvent.createdById),
    normalizeValue(wishlistEvent.event?.createdBy?.id),
    normalizeValue(creatorParticipant?.userId),
    normalizeValue(creatorParticipant?.eventContactId),
  ].filter((value): value is string => Boolean(value));

  return ownerIdentifiers.some(
    (ownerIdentifier) =>
      ownerIdentifier === currentUserId || ownerIdentifier === currentContactId,
  );
}

export function isWishlistEventParticipant(
  wishlistEvent: WishlistEventRecord | null | undefined,
  options: WishlistEventCreatorAccessOptions,
) {
  if (!wishlistEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  const participantIdentifiers =
    wishlistEvent.event?.participants?.flatMap((participant) => {
      const identifiers = [
        normalizeValue(participant.userId),
        normalizeValue(participant.eventContactId),
      ].filter((value): value is string => Boolean(value));

      return identifiers;
    }) ?? [];

  return participantIdentifiers.some(
    (participantIdentifier) =>
      participantIdentifier === currentUserId ||
      participantIdentifier === currentContactId,
  );
}
