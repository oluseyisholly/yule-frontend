import type {
  DrawNameEventListItem,
  DrawNameEventListParticipant,
  DrawNameEventRecord,
} from "@/features/draw-name-events/types";

type DrawNameEventCreatorSubject =
  | DrawNameEventListItem
  | DrawNameEventRecord
  | null
  | undefined;

type DrawNameEventCreatorAccessOptions = {
  currentUserId?: string | null;
  currentContactId?: string | null;
};

function normalizeValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function getCreatorParticipant(
  participants?: DrawNameEventListParticipant[] | null,
) {
  return (
    participants?.find(
      (participant) => participant.role?.trim().toLowerCase() === "creator",
    ) ?? null
  );
}

function matchesCurrentIdentity(
  participant: DrawNameEventListParticipant,
  currentUserId: string | null,
  currentContactId: string | null,
) {
  const participantIdentifiers = [
    normalizeValue(participant.userId),
    normalizeValue(participant.eventContactId),
  ].filter((value): value is string => Boolean(value));

  return participantIdentifiers.some(
    (participantIdentifier) =>
      participantIdentifier === currentUserId ||
      participantIdentifier === currentContactId,
  );
}

export function canManageDrawNameEvent(
  drawNameEvent: DrawNameEventCreatorSubject,
  options: DrawNameEventCreatorAccessOptions,
) {
  if (!drawNameEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  const creatorParticipant = getCreatorParticipant(
    drawNameEvent.event?.participants,
  );
  const ownerIdentifiers = [
    normalizeValue(drawNameEvent.createdById),
    normalizeValue(drawNameEvent.event?.createdBy?.id),
    normalizeValue(creatorParticipant?.userId),
    normalizeValue(creatorParticipant?.eventContactId),
  ].filter((value): value is string => Boolean(value));

  return ownerIdentifiers.some(
    (ownerIdentifier) =>
      ownerIdentifier === currentUserId || ownerIdentifier === currentContactId,
  );
}

export function isDrawNameEventParticipant(
  drawNameEvent: DrawNameEventCreatorSubject,
  options: DrawNameEventCreatorAccessOptions,
) {
  if (!drawNameEvent) {
    return false;
  }

  const currentUserId = normalizeValue(options.currentUserId);
  const currentContactId = normalizeValue(options.currentContactId);

  if (!currentUserId && !currentContactId) {
    return false;
  }

  return (
    drawNameEvent.event?.participants?.some((participant) =>
      matchesCurrentIdentity(participant, currentUserId, currentContactId),
    ) ?? false
  );
}
