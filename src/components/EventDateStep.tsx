"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react";
import BackButton from "@/components/BackButton";
import ModalButton from "@/components/ModalButtons";
import { Calendar } from "@/components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CustomCalendarIcon from "./icons/CustomCalendarIcon";

const CalendarComponent = Calendar as React.ComponentType<
  Record<string, unknown>
>;

type EventDateStepProps = {
  eventName: string;
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onGoToEventName?: () => void;
  heading?: string;
  headingAlign?: "center" | "left";
  showGoToEventNameLink?: boolean;
};

function formatDate(value: string) {
  if (!value) {
    return "Pick a date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Pick a date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function EventDateStep({
  eventName,
  value,
  onChange,
  onBack,
  onNext,
  onGoToEventName,
  heading,
  headingAlign = "center",
  showGoToEventNameLink = true,
}: EventDateStepProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const displayValue = useMemo(() => formatDate(value), [value]);
  const selectedDate = useMemo(() => {
    if (!value) {
      return undefined;
    }

    const parsedDate = new Date(`${value}T00:00:00`);
    parsedDate.setHours(0, 0, 0, 0);
    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }, [value]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(selectedDate ?? today);

  useEffect(() => {
    setCalendarMonth(selectedDate ?? today);
  }, [selectedDate, today]);

  const handleDateSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    onChange(`${year}-${month}-${day}`);
    setIsCalendarOpen(false);
  };

  const resolvedHeading =
    heading ??
    `Tell us the date of your ${eventName} event.`;
  const isHeadingLeftAligned = headingAlign === "left";

  return (
    <div className="space-y-8 pt-1 sm:space-y-10">
      <div
        className={isHeadingLeftAligned ? "space-y-5 text-left" : "space-y-6 text-center sm:space-y-8"}
      >
        <p
          className={
            isHeadingLeftAligned
              ? "text-[18px] font-medium leading-tight text-[#434343] sm:text-[20px]"
              : "mx-auto max-w-[680px] text-[18px] font-semibold leading-[1.35] text-[#434343] sm:text-[21px] lg:text-[24px]"
          }
        >
          {heading ? (
            resolvedHeading
          ) : (
            <>
              Tell us the date of your <span className="italic">{eventName}</span>{" "}
              event.
            </>
          )}
        </p>

        <div className="space-y-4">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-[46px] w-full items-center justify-between rounded-[8px] border border-[#ECE8F7] bg-white px-4 text-left text-[15px] font-normal text-[#434343] sm:h-[42px] sm:px-5 sm:text-[16px]"
                aria-expanded={isCalendarOpen}
                aria-haspopup="dialog"
              >
                <span className={value ? "text-[#434343]" : "text-[#666666]"}>
                  {displayValue}
                </span>
                <CustomCalendarIcon className="size-6 text-[#54545C]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              collisionPadding={16}
              className="z-[130] w-auto overflow-visible rounded-[20px] border-none bg-white p-0 shadow-[0_20px_48px_rgba(26,19,61,0.12)]"
            >
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                onSelect={handleDateSelect}
                disabled={(date: Date) => date < today}
                initialFocus
                className="shadow-none"
              />
            </PopoverContent>
          </Popover>

          {showGoToEventNameLink && onGoToEventName ? (
            <div className="flex flex-col items-center justify-center gap-3 text-[#3300C9] sm:flex-row">
              <button
                type="button"
                onClick={onGoToEventName}
                className="text-[15px] font-medium transition-colors hover:text-[#2D00B4]"
              >
                Last minute changes of mind on name of event?
              </button>
              <button
                type="button"
                onClick={onGoToEventName}
                className="inline-flex h-7 w-8 items-center justify-center rounded-full bg-[#3300C9] text-white transition-colors hover:bg-[#2D00B4]"
                aria-label="Go back to event name"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 sm:flex-nowrap">
        <BackButton
          onClick={onBack}
          className="flex min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />

        <ModalButton
          type="button"
          onClick={onNext}
          disabled={!value}
          className="!h-[38px] max-w-[100px] rounded-[18px]"
        >
          Next
        </ModalButton>
      </div>
    </div>
  );
}
