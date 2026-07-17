export const scheduleMessageFlowSteps = [
  "event",
  "event-date",
  "source",
  "oneda-business",
  "oneda-contact",
  "record",
  "add-record",
  "review-records",
  "compose",
  "gift-selection",
  "success",
] as const;

export type ScheduleMessageFlowStep =
  (typeof scheduleMessageFlowSteps)[number];

export function isScheduleMessageFlowStep(
  step: string,
): step is ScheduleMessageFlowStep {
  return scheduleMessageFlowSteps.includes(step as ScheduleMessageFlowStep);
}
