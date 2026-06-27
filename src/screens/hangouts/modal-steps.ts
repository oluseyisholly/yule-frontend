export const VALID_HANGOUT_MODAL_STEPS = [
  "event",
  "event-date",
  "event-name",
  "check-in-date",
  "check-out-date",
  "guest-count",
  "record",
  "hangout-selection",
  "invite",
  "add-record",
] as const;

export type HangoutModalStep = (typeof VALID_HANGOUT_MODAL_STEPS)[number];

export function isHangoutModalStep(
  value: string | null | undefined,
): value is HangoutModalStep {
  return VALID_HANGOUT_MODAL_STEPS.includes(value as HangoutModalStep);
}
