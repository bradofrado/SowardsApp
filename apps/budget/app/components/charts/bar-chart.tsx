"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "ui/src/components/feature/reporting/rechart/chart";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
} from "ui/src/components/feature/reporting/rechart/rechart";
import { Month, months } from "../types";
import { Button } from "ui/src/components/catalyst/button";
import { BudgetItem, SpendingRecord } from "model/src/budget";
import { isDateInBetween } from "model/src/utils";

interface TransactionBarChartProps {
  bar1: SpendingRecord[];
  bar2: SpendingRecord[];
  //budgetItems: BudgetItem[];
  bar1Fill?: string;
  bar2Fill?: string;
}
export const TransactionBarChart: React.FunctionComponent<
  TransactionBarChartProps
> = ({ bar1, bar2, bar1Fill, bar2Fill }) => {
  const data = months.map<{
    month: Month;
    bar1: number;
    bar2: number;
  }>((month) => {
    const date = new Date();
    date.setMonth(months.indexOf(month));
    return {
      month,
      bar1: bar1.reduce<number>((prev, curr) => {
        return (
          prev +
          (curr.date.getMonth() === months.indexOf(month) && curr.amount > 0
            ? curr.amount
            : 0)
        );
      }, 0),
      // budget: budgetItems.reduce<number>((prev, currItem) => {
      //   return (
      //     prev +
      //     (isDateInBetween(date, currItem.startDate, currItem.endDate)
      //       ? currItem.amount
      //       : 0)
      //   );
      // }, 0),
      bar2: bar2.reduce<number>((prev, curr) => {
        return (
          prev +
          (curr.date.getMonth() === months.indexOf(month) && curr.amount > 0
            ? curr.amount
            : 0)
        );
      }, 0),
    };
  });

  const chartConfig = {
    amount: {
      label: "$",
    },
    bar2: {
      label: "Expenses",
      color: bar2Fill ?? "#41b8d5",
    },
    bar1: {
      label: "Income",
      color: bar1Fill ?? "#8c52ff",
    },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="bar1" fill="var(--color-bar1)" radius={4} />
        <Bar dataKey="bar2" fill="var(--color-bar2)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};
