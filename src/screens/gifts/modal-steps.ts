export const VALID_GIFT_MODAL_STEPS = [
  "recipient-choice",
  "source",
  "event",
  "budget",
  "event-date",
  "event-name",
  "record",
  "review-records",
  "add-record",
  "gift-selection",
  "invite",
] as const;

export type GiftModalStep = (typeof VALID_GIFT_MODAL_STEPS)[number];

export function isGiftModalStep(
  value: string | null | undefined,
): value is GiftModalStep {
  return VALID_GIFT_MODAL_STEPS.includes(value as GiftModalStep);
}
