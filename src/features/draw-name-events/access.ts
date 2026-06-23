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
  currentUserEmail?: string | null;
};

function normalizeValue(value?: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function normalizeEmail(value?: string | null) {
  const normalizedValue = value?.trim().toLowerCase();
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
  currentUserEmail: string | null,
) {
  const participantIdentifiers = [
    normalizeValue(participant.userId),
    normalizeValue(participant.eventContactId),
  ].filter((value): value is string => Boolean(value));
  const participantEmails = [
    normalizeEmail(participant.user?.email),
    normalizeEmail(participant.eventContact?.email),
  ].filter((value): value is string => Boolean(value));

  return (
    participantIdentifiers.some(
      (participantIdentifier) =>
        participantIdentifier === currentUserId ||
        participantIdentifier === currentContactId,
    ) ||
    participantEmails.some(
      (participantEmail) => participantEmail === currentUserEmail,
    )
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
  const currentUserEmail = normalizeEmail(options.currentUserEmail);

  if (!currentUserId && !currentContactId && !currentUserEmail) {
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
  const ownerEmails = [
    normalizeEmail(drawNameEvent.event?.createdBy?.email),
    normalizeEmail(creatorParticipant?.user?.email),
    normalizeEmail(creatorParticipant?.eventContact?.email),
  ].filter((value): value is string => Boolean(value));

  return (
    ownerIdentifiers.some(
      (ownerIdentifier) =>
        ownerIdentifier === currentUserId ||
        ownerIdentifier === currentContactId,
    ) ||
    ownerEmails.some((ownerEmail) => ownerEmail === currentUserEmail)
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
  const currentUserEmail = normalizeEmail(options.currentUserEmail);

  if (!currentUserId && !currentContactId && !currentUserEmail) {
    return false;
  }

  return (
    drawNameEvent.event?.participants?.some((participant) =>
      matchesCurrentIdentity(
        participant,
        currentUserId,
        currentContactId,
        currentUserEmail,
      ),
    ) ?? false
  );
}
