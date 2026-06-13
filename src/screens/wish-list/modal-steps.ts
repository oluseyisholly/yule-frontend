export const VALID_WISHLIST_MODAL_STEPS = [
  "event",
  "event-date",
  "gift-deadline",
  "event-name",
  "celebration-type",
  "gift-selection",
  "invite",
] as const;

export type WishListModalStep = (typeof VALID_WISHLIST_MODAL_STEPS)[number];

export function isWishListModalStep(
  value: string | null | undefined,
): value is WishListModalStep {
  return VALID_WISHLIST_MODAL_STEPS.includes(
    value as WishListModalStep,
  );
}
