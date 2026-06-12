import * as React from 'react';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'dropdown',
  buttonVariant = 'ghost',
  formatters,
  components,
  onSelect,
  mode,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  const handleSelect = React.useCallback(
    (date, selectedDay, activeModifiers, e) => {
      if (onSelect) {
        onSelect(date, selectedDay, activeModifiers, e);
      }
    },
    [onSelect]
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar overflow-hidden rounded-[20px] border border-[#ECE8F7] bg-white p-3 [--cell-size:36px] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      mode={mode}
      onSelect={handleSelect}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-full', defaultClassNames.root),
        months: cn(
          'relative flex flex-col',
          defaultClassNames.months
        ),
        month: cn('flex w-full flex-col', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-9 rounded-full p-0 text-[#1E1E1E] shadow-none select-none hover:bg-[#F4F1FD] hover:text-[#1E1E1E] focus-visible:ring-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-9 rounded-full p-0 text-[#1E1E1E] shadow-none select-none hover:bg-[#F4F1FD] hover:text-[#1E1E1E] focus-visible:ring-0 aria-disabled:opacity-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'relative flex min-h-[40px] w-full items-center justify-center px-10',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'relative flex min-h-[40px] w-full items-center justify-center gap-2 overflow-visible text-[15px] font-medium text-[#1E1E1E]',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative border-none p-0 shadow-none',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'bg-popover absolute inset-0 opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'font-medium select-none',
          captionLayout === 'label'
            ? 'text-base'
            : 'flex h-11 items-center gap-1 rounded-[14px] pr-1 pl-2 text-base [&>svg]:size-4',
          defaultClassNames.caption_label
        ),
        table: 'mt-3 w-full border-collapse',
        weekdays: cn('mb-2 flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-md text-center text-sm font-normal text-[#7D7D7D] select-none',
          defaultClassNames.weekday
        ),
        week: cn('mt-0.5 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-muted-foreground text-[0.8rem] select-none',
          defaultClassNames.week_number
        ),
        day: cn(
          'group/day relative flex-1 p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day
        ),
        range_start: cn(
          'bg-accent rounded-l-md',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
        today: cn(
          'text-[#1E1E1E]',
          defaultClassNames.today
        ),
        outside: cn(
          'text-[#D1D3DA] aria-selected:text-[#D1D3DA]',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-[#D1D3DA] opacity-100',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        Dropdown: (props) => {
          const createEvt = (value) => {
            return {
              target: {
                value: value,
              },
            };
          };

          return (
            <Select
              value={props.value}
              onValueChange={(val) => {
                const evt = createEvt(val);
                props.onChange(evt);
              }}
            >
              <SelectTrigger className="h-10 min-w-[96px] rounded-[14px] border border-[#E7E4F2] bg-white px-4 text-[15px] font-medium text-[#1E1E1E] shadow-none focus-visible:border-[#D6CCF5] focus-visible:ring-0 [&_svg]:text-[#5F8D2C]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={12}
                className="z-[140] rounded-[16px] border border-[#ECE8F7] bg-white p-1 shadow-[0_16px_40px_rgba(26,19,61,0.12)]"
              >
                {props.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    disabled={option.disabled}
                    value={option.value}
                    className="rounded-[12px] px-3 py-2 text-sm text-[#434343] focus:bg-[#F4F1FD] focus:text-[#1E1E1E]"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex h-[36px] w-full min-w-0 rounded-[12px] text-[14px] leading-none font-normal text-[#6D7280] shadow-none hover:bg-[#F6F3FE] hover:text-[#1E1E1E] focus-visible:ring-0 data-[selected-single=true]:bg-[#F4F1FD] data-[selected-single=true]:text-[#1E1E1E] data-[range-middle=true]:bg-[#F4F1FD] data-[range-middle=true]:text-[#1E1E1E] data-[range-start=true]:bg-[#F4F1FD] data-[range-start=true]:text-[#1E1E1E] data-[range-end=true]:bg-[#F4F1FD] data-[range-end=true]:text-[#1E1E1E] group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-0 data-[range-end=true]:rounded-[12px] data-[range-end=true]:rounded-r-[12px] data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-[12px] data-[range-start=true]:rounded-l-[12px] [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
