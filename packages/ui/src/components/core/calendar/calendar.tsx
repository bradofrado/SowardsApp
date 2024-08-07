/* eslint-disable jsx-a11y/anchor-is-valid -- this is all fine*/
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  arrayOfAll,
  classNames,
  datesEqual,
  displayTime,
  displayWeekDay,
  displayWeekDayShort,
  isDateInBetween,
} from "model/src/utils";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "../icons";
import { Button } from "../../catalyst/button";
import type { DropdownItem } from "../dropdown";
import { Dropdown } from "../dropdown";
import { Timezone, useTimezoneContext } from "./timezone";

interface Day {
  date: Date;
  isCurrentMonth?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
}

type GetDays = (date: Date) => Day[];

const getDaysForMonth: GetDays = (_date) => {
  const year = _date.getFullYear();
  const monthIndex = _date.getMonth();
  const lastDay = new Date(year, monthIndex + 1, 0);
  const firstDay = new Date(year, monthIndex, 1);

  const today = new Date();
  const daysInMonth = lastDay.getDate();

  const isToday = (date: Date): boolean =>
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate();
  const getDay = (date: Date): number => date.getDay() || 7;

  const getBeforeDays = (): Day[] =>
    [...Array<number>(firstDay.getDay() || 7)].map((_, i) => {
      const dateIndex = firstDay.getDate();
      const date = new Date(year, monthIndex, dateIndex - getDay(firstDay) + i);
      return {
        date,
        isToday: isToday(date),
      };
    });
  const getAfterDays = (): Day[] =>
    [...Array<number>(6 - lastDay.getDay())].map((_, i) => {
      const dateIndex = lastDay.getDate();
      const date = new Date(year, monthIndex, dateIndex + i + 1);
      return {
        date,
        isToday: isToday(date),
      };
    });
  const getCurrentDays = (): Day[] =>
    [...Array<number>(daysInMonth)].map((_, i) => ({
      date: new Date(year, monthIndex, i + 1),
      isCurrentMonth: true,
      isToday: isToday(new Date(year, monthIndex, i + 1)),
    }));

  return [...getBeforeDays(), ...getCurrentDays(), ...getAfterDays()];
};

const getDaysForWeek: GetDays = (_date) => {
  return [...Array<number>(7)].map((_, i) => {
    const dateIndex = _date.getDate();
    const day = _date.getDay();
    const date = new Date(
      _date.getFullYear(),
      _date.getMonth(),
      dateIndex + i - day,
    );
    return {
      date,
      isToday: datesEqual(new Date(), date),
    };
  });
};

const getDaysForYear: GetDays = (_date) => {
  return [...Array<number>(12)].map((_, i) => {
    const date = new Date(_date.getFullYear(), i, 1);
    return {
      date,
      isToday: false,
    };
  });
};

interface DateStepper {
  increment: () => void;
  decrement: () => void;
  days: Day[];
  date: Date;
  setDate: (date: Date) => void;
}
type DateStepperType = "month" | "week" | "day" | "year";
const getDaysFromType: Record<DateStepperType, GetDays> = {
  month: getDaysForMonth,
  week: getDaysForWeek,
  day: getDaysForWeek,
  year: getDaysForYear,
};
const useDateStepper = (
  type: DateStepperType,
  initialDate = new Date(),
): DateStepper => {
  const [currDate, setCurrDate] = useState<Date>(initialDate);

  const days = getDaysFromType[type](currDate);

  const decrement = (): void => {
    const copy = new Date(currDate);
    switch (type) {
      case "month": {
        copy.setMonth(copy.getMonth() - 1);
        break;
      }
      case "week": {
        copy.setDate(copy.getDate() - 7);
        break;
      }
      case "day": {
        copy.setDate(copy.getDate() - 1);
        break;
      }
      case "year": {
        copy.setFullYear(copy.getFullYear() - 1);
        break;
      }
    }

    setCurrDate(copy);
  };

  const increment = (): void => {
    const copy = new Date(currDate);
    switch (type) {
      case "month": {
        copy.setMonth(copy.getMonth() + 1);
        break;
      }
      case "week": {
        copy.setDate(copy.getDate() + 7);
        break;
      }
      case "day": {
        copy.setDate(copy.getDate() + 1);
        break;
      }
      case "year": {
        copy.setFullYear(copy.getFullYear() + 1);
        break;
      }
    }

    setCurrDate(copy);
  };

  return {
    increment,
    decrement,
    days,
    date: currDate,
    setDate: setCurrDate,
  };
};

export interface CalendarProps {
  className?: string;
  initialDate?: Date;
  value: Date[];
  onChange?: (value: Date[]) => void;
  children?: React.ReactNode;
  stepper?: boolean;
  displayYear?: boolean;
}
export const Calendar: React.FunctionComponent<CalendarProps> = ({
  className,
  initialDate,
  value,
  onChange,
  children,
  stepper = true,
  displayYear = true,
}) => {
  const { increment, decrement, days, date } = useDateStepper(
    "month",
    initialDate,
  );

  const dateDisplay = `${date.toLocaleDateString("default", {
    month: "long",
  })}${displayYear ? ` ${date.getFullYear()}` : ""}`;

  const onDateClick = (day: Day): void => {
    onChange && onChange([day.date]);
  };

  days.forEach((day) => {
    day.isSelected = value.some((val) => datesEqual(day.date, val));
  });

  return (
    <div className={classNames("text-center", className)}>
      <div className="flex items-center text-gray-900">
        {stepper ? (
          <button
            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            onClick={decrement}
            type="button"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
        <div className="flex-auto text-sm font-semibold">{dateDisplay}</div>
        {stepper ? (
          <button
            className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            onClick={increment}
            type="button"
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-md bg-gray-200 text-sm shadow ring-1 ring-gray-200">
        {days.map((day, dayIdx) => (
          <button
            className={classNames(
              "py-1.5 hover:bg-gray-100 focus:z-10",
              day.isCurrentMonth ? "bg-white" : "bg-gray-50",
              day.isSelected || day.isToday ? "font-semibold" : undefined,
              day.isSelected ? "text-white" : undefined,
              !day.isSelected && day.isCurrentMonth && !day.isToday
                ? "text-gray-900"
                : undefined,
              !day.isSelected && !day.isCurrentMonth && !day.isToday
                ? "text-gray-400"
                : undefined,
              day.isToday && !day.isSelected ? "text-primary" : undefined,
              dayIdx === 0 ? "rounded-tl-md" : undefined,
              dayIdx === 6 ? "rounded-tr-md" : undefined,
              dayIdx === days.length - 7 ? "rounded-bl-md" : undefined,
              dayIdx === days.length - 1 ? "rounded-br-md" : undefined,
            )}
            key={day.date.toDateString()}
            onClick={() => {
              onDateClick(day);
            }}
            type="button"
          >
            <time
              className={classNames(
                "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                day.isSelected && day.isToday ? "bg-primary" : undefined,
                day.isSelected && !day.isToday ? "bg-gray-900" : undefined,
              )}
              dateTime={day.date.toDateString()}
            >
              {day.date.getDate()}
            </time>
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};

export const CalendarForm: React.FunctionComponent<CalendarProps> = ({
  onChange,
  value,
  ...rest
}) => {
  const [selected, setSelected] = useState<Date | undefined>();

  const onAdd = (): void => {
    selected && onChange && onChange([...value, selected]);
  };

  const onSelect = (values: Date[]): void => {
    setSelected(values[0]);
  };
  return (
    <Calendar
      value={selected ? [...value, selected] : value}
      {...rest}
      onChange={onSelect}
    >
      <Button className="mt-8 w-full py-2" onClick={onAdd}>
        Add Event
      </Button>
    </Calendar>
  );
};

type CalendarColorType = "blue" | "pink" | "gray";
interface CalendarColor<T extends CalendarColorType> {
  background: `bg-${T}-50`;
  backgroundHover: `hover:bg-${T}-100`;
  text: `text-${T}-700`;
  textLight: `text-${T}-500`;
  groupHoverText: `group-hover:text-${T}-700`;
}

const getColorClasses = (
  color: CalendarColorType,
): CalendarColor<typeof color> => {
  switch (color) {
    case "blue":
      return {
        background: "bg-blue-50",
        backgroundHover: "hover:bg-blue-100",
        text: "text-blue-700",
        textLight: "text-blue-500",
        groupHoverText: "group-hover:text-blue-700",
      };
    case "pink":
      return {
        background: "bg-pink-50",
        backgroundHover: "hover:bg-pink-100",
        text: "text-pink-700",
        textLight: "text-pink-500",
        groupHoverText: "group-hover:text-pink-700",
      };
    case "gray":
      return {
        background: "bg-gray-50",
        backgroundHover: "hover:bg-gray-100",
        text: "text-gray-700",
        textLight: "text-gray-500",
        groupHoverText: "group-hover:text-gray-700",
      };
  }
};

export interface CalendarEvent {
  id: string;
  name: string;
  date: Date;
  durationMinutes: number;
  href: string;
  color: CalendarColorType;
}

type CalendarView = React.FunctionComponent<{
  days: Day[];
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  initialDate: Date;
}>;

export const CalendarMonthView: CalendarView = ({ days: pureDays, events }) => {
  const days: (Day & { events: CalendarEvent[] })[] = pureDays.map((day) => ({
    ...day,
    events: events.filter((event) => datesEqual(event.date, day.date)),
  }));
  const selectedDay = days.find((day) => day.isSelected);
  return (
    <>
      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">un</span>
          </div>
          <div className="bg-white py-2">
            M<span className="sr-only sm:not-sr-only">on</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">ue</span>
          </div>
          <div className="bg-white py-2">
            W<span className="sr-only sm:not-sr-only">ed</span>
          </div>
          <div className="bg-white py-2">
            T<span className="sr-only sm:not-sr-only">hu</span>
          </div>
          <div className="bg-white py-2">
            F<span className="sr-only sm:not-sr-only">ri</span>
          </div>
          <div className="bg-white py-2">
            S<span className="sr-only sm:not-sr-only">at</span>
          </div>
        </div>
        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
            {days.map((day) => (
              <div
                className={classNames(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-500",
                  "relative px-3 py-2",
                )}
                key={day.date.toLocaleDateString()}
              >
                <time
                  className={
                    day.isToday
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-white"
                      : undefined
                  }
                  dateTime={day.date.toLocaleDateString()}
                >
                  {day.date.getDate()}
                </time>
                {day.events.length > 0 && (
                  <ol className="mt-2">
                    {day.events.slice(0, 2).map((event) => (
                      <li key={event.id}>
                        <a className="group flex" href={event.href}>
                          <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-primary">
                            {event.name}
                          </p>
                          <time
                            className="ml-3 hidden flex-none text-gray-500 group-hover:text-primary xl:block"
                            dateTime={event.date.toLocaleDateString()}
                          >
                            {displayTime(event.date)}
                          </time>
                        </a>
                      </li>
                    ))}
                    {day.events.length > 2 && (
                      <li className="text-gray-500">
                        + {day.events.length - 2} more
                      </li>
                    )}
                  </ol>
                )}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
            {days.map((day) => (
              <button
                className={classNames(
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                  (day.isSelected || day.isToday) && "font-semibold",
                  day.isSelected && "text-white",
                  !day.isSelected && day.isToday && "text-primary",
                  !day.isSelected &&
                    day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-900",
                  !day.isSelected &&
                    !day.isCurrentMonth &&
                    !day.isToday &&
                    "text-gray-500",
                  "flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10",
                )}
                key={day.date.toLocaleDateString()}
                type="button"
              >
                <time
                  className={classNames(
                    day.isSelected &&
                      "flex h-6 w-6 items-center justify-center rounded-full",
                    day.isSelected && day.isToday && "bg-primary",
                    day.isSelected && !day.isToday && "bg-gray-900",
                    "ml-auto",
                  )}
                  dateTime={day.date.toLocaleDateString()}
                >
                  {day.date.getDate()}
                </time>
                <span className="sr-only">{day.events.length} events</span>
                {day.events.length > 0 ? (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                    {day.events.map((event) => (
                      <span
                        className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                        key={event.id}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedDay && selectedDay.events.length > 0 ? (
        <div className="px-4 py-10 sm:px-6 lg:hidden">
          <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
            {selectedDay.events.map((event) => (
              <li
                className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
                key={event.id}
              >
                <div className="flex-auto">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <time
                    className="mt-2 flex items-center text-gray-700"
                    dateTime={event.date.toLocaleDateString()}
                  >
                    <ClockIcon
                      aria-hidden="true"
                      className="mr-2 h-5 w-5 text-gray-400"
                    />
                    {displayTime(event.date)}
                  </time>
                </div>
                <a
                  className="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400 focus:opacity-100 group-hover:opacity-100"
                  href={event.href}
                >
                  Edit<span className="sr-only">, {event.name}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </>
  );
};

export const CalendarEvent: React.FunctionComponent<{
  event: CalendarEvent;
  hidden: boolean;
  onClick: () => void;
  className?: string;
  hourOffset?: number;
  index: number;
}> = ({ event, hidden, onClick, className, index, hourOffset = 0 }) => {
  const ref = useRef<HTMLLIElement>(null);
  const color = getColorClasses(event.color);
  const hours = event.date.getHours() - hourOffset;
  const gridRow = hours * 12 + (event.date.getMinutes() / 60) * 12 + 2;
  const gridSpan = (event.durationMinutes / 60) * 12;
  const colStart = event.date.getDay() + 1;
  useEffect(() => {
    if (ref.current) {
      ref.current.style.setProperty("--col-start", `${colStart}`);
    }
  }, [ref, colStart]);
  return (
    <li
      className={`relative mt-px sm:flex sm:col-start-[var(--col-start)] col-start-1 ${
        hidden ? "hidden" : ""
      } ${className}`}
      key={event.id}
      ref={ref}
      style={{ gridRow: `${gridRow} / span ${gridSpan}`, zIndex: index }}
    >
      <button
        type="button"
        onClick={onClick}
        className={`group absolute inset-1 flex flex-col overflow-y-auto rounded-lg ${color.background} p-2 text-xs leading-5 ${color.backgroundHover}`}
      >
        <p className={`font-semibold ${color.text}`}>{event.name}</p>
        <p className={`${color.textLight} ${color.groupHoverText}`}>
          <time dateTime={event.date.toLocaleDateString()}>
            {displayTime(event.date)} <span>{displayWeekDay(event.date)}</span>
          </time>
        </p>
      </button>
    </li>
  );
};

const useCalendarHours = (
  interval: "hour" | "half-hour",
): { hours: Hour[]; hoursStartIndex: number; intervalPerHour: number } => {
  const hoursStartIndex = totalHours.indexOf(hoursStart);
  const hours = totalHours.slice(hoursStartIndex);
  const intervalPerHour = interval === "hour" ? 2 : 1;

  return { hours, hoursStartIndex, intervalPerHour };
};
const CalendarHours: React.FunctionComponent<{
  hours: Hour[];
  interval: "hour" | "half-hour";
}> = ({ hours, interval }) => {
  return (
    <>
      {hours.map((hour) => (
        <>
          <div>
            <div className="sticky left-0 z-20 -ml-14 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
              {hour}
            </div>
          </div>
          {interval === "hour" ? <div /> : null}
        </>
      ))}
    </>
  );
};

const totalHours = [
  "12AM",
  "1AM",
  "2AM",
  "3AM",
  "4AM",
  "5AM",
  "6AM",
  "7AM",
  "8AM",
  "9AM",
  "10AM",
  "11AM",
  "12PM",
  "1PM",
  "2PM",
  "3PM",
  "4PM",
  "5PM",
  "6PM",
  "7PM",
  "8PM",
  "9PM",
  "10PM",
  "11PM",
] as const;
type Hour = (typeof totalHours)[number];
const hoursStart: Hour = "4AM";
const interval: "hour" | "half-hour" = "half-hour";
export const CalendarWeekView: CalendarView = ({
  days: pureDays,
  events,
  onEventClick,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate,
  );
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const { formatDate } = useTimezoneContext();

  const days: (Day & { events: CalendarEvent[] })[] = pureDays.map((day) => ({
    ...day,
    events: events.filter((event) => datesEqual(event.date, day.date)),
  }));

  useEffect(() => {
    // Set the container scroll position based on the current time.
    const currentMinute = formatDate().getHours() * 60;
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  const { hoursStartIndex, hours, intervalPerHour } =
    useCalendarHours(interval);

  // useEffect(() => {
  // 	setSelectedDate(pureDays[0].date);
  // }, [pureDays])

  return (
    <div
      className="isolate flex flex-auto flex-col overflow-auto bg-white"
      ref={container}
    >
      <div
        className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full"
        style={{ width: "165%" }}
      >
        <div
          className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
          ref={containerNav}
        >
          <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
            {days.map((day) => (
              <button
                className={`flex flex-col items-center pb-3 pt-2 ${
                  datesEqual(day.date, selectedDate || formatDate())
                    ? "bg-primary-light"
                    : ""
                }`}
                key={day.date.toLocaleDateString()}
                onClick={() => {
                  setSelectedDate(day.date);
                }}
                type="button"
              >
                {day.isToday ? (
                  <>
                    {displayWeekDayShort(day.date)}{" "}
                    <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-white">
                      {day.date.getDate()}
                    </span>
                  </>
                ) : (
                  <>
                    {displayWeekDayShort(day.date)}{" "}
                    <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                      {day.date.getDate()}
                    </span>
                  </>
                )}
                {day.events.length > 0 ? (
                  <span className="-mx-0.5 mt-auto flex flex-wrap-reverse px-1">
                    {day.events.map((event) => (
                      <span
                        className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                        key={event.id}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
            <div className="col-end-1 w-14" />
            {days.map((day) => (
              <div
                className="flex items-center justify-center py-3"
                key={day.date.toLocaleDateString()}
              >
                {day.isToday ? (
                  <span className="flex items-baseline">
                    {displayWeekDay(day.date)}{" "}
                    <span className="ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-white">
                      {day.date.getDate()}
                    </span>
                  </span>
                ) : (
                  <span>
                    {displayWeekDay(day.date)}{" "}
                    <span className="items-center justify-center font-semibold text-gray-900">
                      {day.date.getDate()}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-auto">
          <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
          <div className="grid flex-auto grid-cols-1 grid-rows-1">
            {/* Horizontal lines */}
            <div
              className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
              style={{
                gridTemplateRows: `repeat(${
                  hours.length * intervalPerHour
                }, minmax(3.5rem, 1fr))`,
              }}
            >
              <div className="row-end-1 h-7" ref={containerOffset} />
              <CalendarHours hours={hours} interval={interval} />
            </div>

            {/* Vertical lines */}
            <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
              <div className="col-start-1 row-span-full" />
              <div className="col-start-2 row-span-full" />
              <div className="col-start-3 row-span-full" />
              <div className="col-start-4 row-span-full" />
              <div className="col-start-5 row-span-full" />
              <div className="col-start-6 row-span-full" />
              <div className="col-start-7 row-span-full" />
              <div className="col-start-8 row-span-full w-8" />
            </div>

            {/* Events */}
            <ol
              className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
              style={{
                gridTemplateRows: `1.75rem repeat(${
                  hours.length * 12
                }, minmax(0, 1fr)) auto`,
              }}
            >
              {events.map((event, i) =>
                isDateInBetween(
                  event.date,
                  days[0].date,
                  days[days.length - 1].date,
                  true,
                ) ? (
                  <CalendarEvent
                    event={event}
                    hidden={
                      !selectedDate || !datesEqual(event.date, selectedDate)
                    }
                    key={event.id}
                    index={i + 1}
                    onClick={() => {
                      onEventClick && onEventClick(event);
                    }}
                    hourOffset={hoursStartIndex}
                  />
                ) : null,
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CalendarDayView: CalendarView = ({
  days: pureDays,
  events,
  onEventClick,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const { formatDate } = useTimezoneContext();

  const days: (Day & { events: CalendarEvent[] })[] = pureDays.map((day) => ({
    ...day,
    events: events.filter((event) => datesEqual(event.date, day.date)),
  }));

  useEffect(() => {
    // Set the container scroll position based on the current time.
    const currentMinute = formatDate().getHours() * 60;
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  // useEffect(() => {
  // 	setSelectedDate(pureDays[0].date);
  // }, [pureDays])

  const { hours, intervalPerHour, hoursStartIndex } =
    useCalendarHours(interval);

  return (
    <div className="isolate flex flex-auto overflow-hidden bg-white">
      <div className="flex flex-auto flex-col overflow-auto" ref={container}>
        <div
          className="sticky top-0 z-10 grid flex-none grid-cols-7 bg-white text-xs text-gray-500 shadow ring-1 ring-black ring-opacity-5 md:hidden"
          ref={containerNav}
        >
          {days.map((day) => (
            <button
              className={`flex flex-col items-center pb-1.5 pt-3 ${
                datesEqual(day.date, selectedDate) ? "bg-primary-light" : ""
              }`}
              key={day.date.toLocaleDateString()}
              onClick={() => {
                setSelectedDate(day.date);
              }}
              type="button"
            >
              {day.isToday ? (
                <>
                  {displayWeekDayShort(day.date)}{" "}
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-semibold text-white">
                    {day.date.getDate()}
                  </span>
                </>
              ) : (
                <>
                  {displayWeekDayShort(day.date)}{" "}
                  <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                    {day.date.getDate()}
                  </span>
                </>
              )}
              {day.events.length > 0 ? (
                <span className="-mx-0.5 mt-auto flex flex-wrap-reverse px-1">
                  {day.events.map((event) => (
                    <span
                      className="mx-0.5 mb-1 h-1.5 w-1.5 rounded-full bg-gray-400"
                      key={event.id}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-auto">
          <div className="w-14 flex-none bg-white ring-1 ring-gray-100" />
          <div className="grid flex-auto grid-cols-1 grid-rows-1">
            {/* Horizontal lines */}
            <div
              className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
              style={{
                gridTemplateRows: `repeat(${
                  hours.length * intervalPerHour
                }, minmax(3.5rem, 1fr))`,
              }}
            >
              <div className="row-end-1 h-7" ref={containerOffset} />
              <CalendarHours hours={hours} interval={interval} />
            </div>

            {/* Events */}
            <ol
              className="col-start-1 col-end-2 row-start-1 grid grid-cols-1"
              style={{
                gridTemplateRows: `1.75rem repeat(${
                  hours.length * 12
                }, minmax(0, 1fr)) auto`,
              }}
            >
              {events.map((event, i) =>
                datesEqual(selectedDate, event.date) ? (
                  <CalendarEvent
                    className="!col-start-1"
                    event={event}
                    hidden={!datesEqual(event.date, selectedDate)}
                    key={event.id}
                    index={i + 1}
                    onClick={() => {
                      onEventClick && onEventClick(event);
                    }}
                    hourOffset={hoursStartIndex}
                  />
                ) : null,
              )}
            </ol>
          </div>
        </div>
      </div>
      <Calendar
        className="hidden w-1/2 max-w-md flex-none border-l border-gray-100 px-8 py-10 md:block"
        onChange={([value]) => {
          setSelectedDate(value);
        }}
        value={[selectedDate]}
        initialDate={selectedDate}
      />
    </div>
  );
};

const CalendarYearView: CalendarView = ({ days }) => {
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-16 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4">
        {days.map((day) => (
          <Calendar
            displayYear={false}
            initialDate={day.date}
            key={day.date.toLocaleDateString()}
            stepper={false}
            value={[]}
          />
        ))}
      </div>
    </div>
  );
};

const views: Record<DateStepperType, CalendarView> = {
  week: CalendarWeekView,
  month: CalendarMonthView,
  day: CalendarDayView,
  year: CalendarYearView,
};

type DateStepperDropdownItem = {
  [P in DateStepperType]: { id: P; name: string };
}[DateStepperType];

interface CalendarViewProps {
  onAddEvent?: () => void;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  initialDate?: Date;
}
export const CalendarView: React.FunctionComponent<CalendarViewProps> = ({
  onAddEvent,
  onEventClick,
  events,
  initialDate,
}) => {
  const [view, setView] = useState<DateStepperType>("week");
  const { increment, decrement, days, date, setDate } = useDateStepper(
    view,
    initialDate,
  );
  const {
    timezone,
    timezoneItems,
    onChange: onTimeZoneChange,
    events: formattedEvents,
    formatDate,
  } = useTimezone(events);

  const dateDisplay = `${
    view !== "year"
      ? `${date.toLocaleDateString("default", { month: "long" })} `
      : ""
  }${date.getFullYear()}`;

  const onTodayClick = (): void => {
    setDate(formatDate());
  };

  const viewItems: DropdownItem<DateStepperType>[] =
    arrayOfAll<DateStepperDropdownItem>()([
      {
        id: "day",
        name: "Day View",
      },
      {
        id: "week",
        name: "Week View",
      },
      {
        id: "month",
        name: "Month View",
      },
      {
        id: "year",
        name: "Year View",
      },
    ]);

  const CurrView = views[view];
  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime="2022-01">{dateDisplay}</time>
        </h1>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
              onClick={decrement}
              type="button"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              onClick={onTodayClick}
              type="button"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
              onClick={increment}
              type="button"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <div className="md:ml-4 flex items-center">
            <Dropdown
              className="hidden md:block mr-2"
              initialValue={timezone}
              items={timezoneItems}
              onChange={(item) => {
                onTimeZoneChange(item.id);
              }}
            />
            <Dropdown
              className="hidden md:block"
              initialValue={view}
              items={viewItems}
              onChange={(item) => {
                setView(item.id);
              }}
            />
            {onAddEvent ? (
              <>
                <div className="ml-6 h-6 w-px bg-gray-300" />
                <Button className="ml-6" onClick={onAddEvent}>
                  Add Event
                </Button>
              </>
            ) : null}
          </div>
          {/* <Dropdown className="ml-6 md:hidden" initialValue={view} items={viewItems} onChange={(item) => {setView(item.id)}}/> */}
        </div>
      </header>
      <CurrView
        days={days}
        events={formattedEvents}
        onEventClick={onEventClick}
        initialDate={date}
      />
    </div>
  );
};

const useTimezone = (events: CalendarEvent[]) => {
  const { timezone, setTimezone, ...rest } = useTimezoneContext();

  const formatDate = rest.formatDate;

  // Sort and set event timezone
  const formattedEvents = useMemo(
    () =>
      events
        .slice()
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((event) => ({
          ...event,
          date: formatDate(event.date),
        })),
    [events, formatDate],
  );

  const timezoneItems: DropdownItem<Timezone>[] = [
    {
      id: "local",
      name: "Local Time",
    },
    {
      id: "Pacific/Honolulu",
      name: "Hawaii Time",
    },
  ];

  return {
    timezone,
    timezoneItems,
    onChange: setTimezone,
    events: formattedEvents,
    ...rest,
  };
};
