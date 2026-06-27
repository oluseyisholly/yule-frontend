import type {
  HangoutEventParticipant,
  HangoutEventRecord,
} from "@/features/hangout-events/types";

type HangoutEventCreatorAccessOptions = {
  currentUserId?: string | null;
  currentContactId?: string | null;
};

function normalizeValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function getCreatorParticipant(
  participants?: HangoutEventParticipant[] | null,
) {
  return (
    participants?.find(
      (participant) => participant.role?.trim().toLowerCase() === "creator",
    ) ?? null
  );
}

export function canManageHangoutEvent(
  hangoutEvent: HangoutEventRecord | null | undefined,
  options: HangoutEventCreatorAccessOptions,
) {
  if (!hangoutEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  const creatorParticipant = getCreatorParticipant(
    hangoutEvent.event?.participants,
  );

  const ownerIdentifiers = [
    normalizeValue(hangoutEvent.event?.createdBy?.id),
    normalizeValue(creatorParticipant?.eventContactId),
  ].filter((value): value is string => Boolean(value));

  return ownerIdentifiers.some(
    (ownerIdentifier) =>
      ownerIdentifier === currentUserId || ownerIdentifier === currentContactId,
  );
}
