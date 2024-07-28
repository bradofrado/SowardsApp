"use client";
import React, { createContext, useCallback, useContext, useState } from "react";

export type Timezone = "local" | "Pacific/Honolulu";
interface TimezoneContextType {
  timezone: Timezone;
  setTimezone: (timezone: Timezone) => void;
  formatDate: (date?: Date) => Date;
  normalizeFormattedDate: (date: Date) => Date;
}
const TimezoneContext = createContext<TimezoneContextType>({
  timezone: "local",
  setTimezone: () => undefined,
  formatDate: () => new Date(),
  normalizeFormattedDate: () => new Date(),
});

interface TimezoneProviderProps {
  children: React.ReactNode;
  initialTimezone?: Timezone;
}
export const TimezoneProvider: React.FunctionComponent<
  TimezoneProviderProps
> = ({ children, initialTimezone }) => {
  const [timezone, setTimezone] = useState<Timezone>(
    initialTimezone || "local",
  );

  const formatDate = useCallback(
    (date?: Date) => {
      if (timezone === "local") {
        return date || new Date();
      }
      return new Date(
        (date || new Date()).toLocaleString("en-US", { timeZone: timezone }),
      );
    },
    [timezone],
  );

  const normalizeFormattedDate = useCallback(
    (date: Date) => {
      const base = new Date();
      const timezoneOffset = base.getTime() - formatDate(base).getTime();
      return new Date(date.getTime() + timezoneOffset);
    },
    [formatDate],
  );
  return (
    <TimezoneContext.Provider
      value={{ timezone, setTimezone, formatDate, normalizeFormattedDate }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezoneContext = (): TimezoneContextType => {
  const timezoneContext = useContext(TimezoneContext);

  return timezoneContext;
};
