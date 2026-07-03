export const VALID_GIFT_MODAL_STEPS = [
  "event",
  "event-date",
  "event-name",
  "source",
  "oneda-business",
  "oneda-contact",
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
