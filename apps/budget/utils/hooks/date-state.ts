import { useQueryState } from "ui/src/hooks/query-state";
import { Month, months } from "../components/totals/types";
import { useMemo } from "react";

export const useDateState = () => {
  const [currentMonth, setCurrentMonth] = useQueryState<Month>({
    defaultValue: months[new Date().getMonth()],
    key: "month",
  });
  const [currentYear, setCurrentYear] = useQueryState<number>({
    defaultValue: new Date().getFullYear(),
    key: "year",
  });
  const currentDate = useMemo(() => {
    const date = new Date();
    date.setMonth(months.indexOf(currentMonth));
    date.setFullYear(currentYear);
    return date;
  }, [currentMonth, currentYear]);

  return {
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    currentDate,
  };
};
