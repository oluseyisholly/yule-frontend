export const VALID_GIFT_MODAL_STEPS = [
  "recipient-choice",
  "source",
  "event",
  "budget",
  "source",
  "oneda-business",
  "oneda-contact",
  "record",
  "review-records",
  "contact-details",
  "gender",
  "age-range",
  "relationship",
  "add-record",
  "gift-selection",
  "review-gifts",
  "invite",
] as const;

export type GiftModalStep = (typeof VALID_GIFT_MODAL_STEPS)[number];

export function isGiftModalStep(
  value: string | null | undefined,
): value is GiftModalStep {
  return VALID_GIFT_MODAL_STEPS.includes(value as GiftModalStep);
}
