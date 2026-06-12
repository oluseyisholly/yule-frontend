export const DRAW_NAME_SETUP_STEPS = [
  "event",
  "source",
  "record",
  "add-record",
  "review-records",
  "exclusion-choice",
  "exclusion-record",
  "event-date",
  "group-name",
  "budget",
] as const;

export const LEGACY_DRAW_NAME_MODAL_STEPS = [
  "wishlist-choice",
] as const;

export const PARTICIPANT_DRAW_FLOW_STEPS = [
  "wishlist-gifts",
  "wishlist-notification",
  "draw-ready",
  "draw-spin",
  "draw-result",
] as const;

export const VALID_DRAW_NAME_MODAL_STEPS = [
  ...DRAW_NAME_SETUP_STEPS,
  ...LEGACY_DRAW_NAME_MODAL_STEPS,
  ...PARTICIPANT_DRAW_FLOW_STEPS,
  "draw-invite",
] as const;

export type DrawNameModalStep = (typeof VALID_DRAW_NAME_MODAL_STEPS)[number];

export function isParticipantDrawNameFlowStep(
  value: string | null | undefined,
): value is (typeof PARTICIPANT_DRAW_FLOW_STEPS)[number] {
  return PARTICIPANT_DRAW_FLOW_STEPS.includes(
    value as (typeof PARTICIPANT_DRAW_FLOW_STEPS)[number],
  );
}

export function isDrawNameModalStep(
  value: string | null | undefined,
): value is DrawNameModalStep {
  return VALID_DRAW_NAME_MODAL_STEPS.includes(
    value as DrawNameModalStep,
  );
}
