import _dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
_dayjs.extend(utc);

const dayjs = (date: Date, utc: boolean) => {
  return utc ? _dayjs(date).utc() : _dayjs(date);
};

export const displayDate = (date: Date, utc = true) => {
  return dayjs(date, utc).format("MM/DD/YY");
};

export const displayDateAndTime = (date: Date, utc = true) => {
  return dayjs(date, utc).format("MMM, DD h:mm A");
};

export const displayTime = (date: Date, utc = true) => {
  return dayjs(date, utc).format("h:mm A");
};

export const displayDateLong = (date: Date, utc = true) => {
  return dayjs(date, utc).format("MMM, DD YYYY");
};

export const displayWeekDayShort = (date: Date, utc = true) => {
  return dayjs(date, utc).format("dd");
};

export const displayWeekDay = (date: Date, utc = true) => {
  return dayjs(date, utc).format("ddd");
};

export const datesEqual = (d1: Date, d2: Date): boolean =>
  displayDate(d1) === displayDate(d2);

export const formatDollarAmount = (amount: number): string => {
  const str = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (str === "-$0") return "$0";

  return str;
};

export const second = 1000;
export const minute = 60000;
export const hour = 3600000;
export const day = 86400000;
export const week = 604800000;
export const calculateDateDifference = (
  milisecondsSinceToday: number,
): Date => {
  const today = new Date();
  today.setTime(today.getTime() - milisecondsSinceToday);

  return today;
};

export const displayElapsedTime = (time: Date): string => {
  const currTime = new Date();
  const elapsedTime = currTime.getTime() - time.getTime();

  if (elapsedTime < minute) {
    return `${round(elapsedTime / second)}s ago`;
  }

  if (elapsedTime < hour) {
    return `${round(elapsedTime / minute)}m ago`;
  }

  if (elapsedTime < day) {
    return `${round(elapsedTime / hour)}h ago`;
  }

  if (elapsedTime < week) {
    return `${round(elapsedTime / day)}d ago`;
  }

  return displayDate(time);
};

export const displayRelativeDate = (date: Date): string => {
  const elapsedTime = new Date().getTime() - date.getTime();
  if (elapsedTime < day) {
    return "Today";
  }

  if (elapsedTime < day * 2) {
    return "Yesterday";
  }

  return displayDate(date);
};

export const trimText = (text: string, length = 40): string => {
  if (text.length <= length) {
    return text;
  }

  return text.slice(0, length - 3) + "...";
};

export const round = (value: number, digits = 0): number => {
  const places = Math.pow(10, digits);
  return Math.round(value * places) / places;
};

export const displayStorageSpace = (value: number): string => {
  if (value < 1000) {
    return `${value} B`;
  }

  if (value < 1000000) {
    return `${Math.round(value / 100) / 10} KB`;
  }

  if (value < 1000000000) {
    return `${Math.round(value / 100000) / 10} MB`;
  }

  return `${Math.round(value / 100000000) / 10} GB`;
};

export const compare = (f1: string | number, f2: string | number): number => {
  if (typeof f1 === "string" && typeof f2 === "string") {
    return f1.localeCompare(f2);
  }

  if (typeof f1 === "number" && typeof f2 === "number") {
    return f1 - f2;
  }

  return 0;
};

export const classNames = (...strings: (string | undefined | boolean)[]) => {
  return strings.filter(Boolean).join(" ");
};

export const groupBy = function <T extends Pick<T, K>, K extends keyof T>(
  arr: T[],
  key: K,
) {
  return arr.reduce<Record<T[K], T[]>>((prev, curr) => {
    let a: T[] = [];
    const val = prev[curr[key]];
    if (val) {
      a = val;
    }
    a?.push(curr);
    prev[curr[key]] = a;

    return prev;
  }, {});
};

export const groupByDistinct = function <
  T extends Pick<T, K>,
  K extends keyof T,
>(arr: T[], key: K) {
  return arr.reduce<Record<T[K], T>>((prev, curr) => {
    if (prev[curr[key]]) {
      throw new Error("Each key value in the list must be unique");
    }

    prev[curr[key]] = curr;

    return prev;
  }, {});
};

export const groupTogether = function <T extends Pick<T, K>, K extends keyof T>(
  arr: T[],
  key: K,
) {
  const groups = groupBy(arr, key);

  return Object.keys(groups);
};

export const groupTogetherDistinct = function <
  T extends Pick<T, K>,
  K extends keyof T,
>(arr: T[], key: K): string[] {
  const groups = groupByDistinct(arr, key);

  return Object.keys(groups);
};

export function isDateInBetween(
  test: Date | undefined,
  start: Date | undefined,
  end: Date | undefined,
  checkOnlyDate?: boolean,
): boolean {
  if (test === undefined) {
    return true;
  }
  const _end =
    checkOnlyDate && end
      ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
      : end;
  return (
    (start !== undefined ? start <= test : true) &&
    (_end !== undefined ? test <= _end : true)
  );
}

export function getStartOfMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function getEndOfMonthDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, -1);
}

export const toUTC = (date: Date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
};

export const arrayOfAll =
  <T>() =>
  <U extends T[]>(
    array: U & ([T] extends [U[number]] ? unknown : Exclude<T, U[number]>),
  ) =>
    array;

export const stringUnionSchema = <T extends readonly string[]>(array: T) =>
  z.custom<T[number]>(
    (data) => typeof data === "string" && array.includes(data),
  );

export function capitalizeFirstLetter(str: string): string {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
