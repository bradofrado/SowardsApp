"use client";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "ui/src/components/feature/reporting/rechart/chart";
// import { CartesianGrid, Line, LineChart as LineChartPrimitize, XAxis } from "ui/src/components/feature/reporting/rechart/rechart";
import { LineChart } from "ui/src/components/feature/reporting/graphs/line-chart";
import { useAccounts } from "../../../utils/components/providers/account-provider";
import { useCallback, useMemo } from "react";
import { months } from "../../../utils/components/totals/types";
import { datesEqual, day, displayDate } from "model/src/utils";
import { useTransactions } from "../../../utils/components/providers/transaction-provider";
import { GraphValue } from "ui/src/components/feature/reporting/graphs/types";

export type TotalGraphValue = GraphValue & { date: Date };
interface AccountLineChartProps {
  onValueChange: (value: TotalGraphValue, index: number | undefined) => void;
  chartData: TotalGraphValue[];
}
export const AccountLineChart: React.FunctionComponent<
  AccountLineChartProps
> = ({ onValueChange, chartData }) => {
  const breakpoint = useMediaQuery();
  const width = useMemo(() => {
    if (["", "sm"].includes(breakpoint)) {
      return 300;
    }

    return 450;
  }, [breakpoint]);

  const spacing = useMemo(() => width / chartData.length, [width, chartData]);
  const axisLabels = useMemo(() => {
    const min = Math.min(...chartData.map((point) => point.value));
    const max = Math.max(...chartData.map((point) => point.value));
    const minFloor = Math.floor(min / 1000) * 1000;
    const maxCeil = Math.ceil(max / 1000) * 1000;
    const mid = (maxCeil - minFloor) / 2 + minFloor;

    return [minFloor, mid, maxCeil];
  }, [chartData]);
  return (
    <LineChart
      values={chartData}
      axisLabels={axisLabels}
      width={width}
      height={300}
      spacing={spacing}
      onValueChange={onValueChange}
    >
      {(point) => `${displayDate(point.date)}`}
    </LineChart>
  );
};

import { useEffect, useState } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl" | "";

const useMediaQuery = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("");

  const calculateMediaQuery = useCallback(() => {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 640 && windowWidth < 768) {
      setBreakpoint("sm");
    } else if (windowWidth >= 768 && windowWidth < 1024) {
      setBreakpoint("md");
    } else if (windowWidth >= 1024 && windowWidth < 1280) {
      setBreakpoint("lg");
    } else if (windowWidth >= 1280 && windowWidth < 1536) {
      setBreakpoint("xl");
    } else if (windowWidth >= 1536) {
      setBreakpoint("2xl");
    } else {
      setBreakpoint("");
    }
  }, []);

  useEffect(() => {
    calculateMediaQuery();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      calculateMediaQuery();
    };

    handleResize(); // Initial check

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return breakpoint;
};
