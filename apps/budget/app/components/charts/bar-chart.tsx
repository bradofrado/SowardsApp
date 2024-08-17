"use client";
import {
  ChartConfig,
  ChartContainer,
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
  transactions: SpendingRecord[];
  budgetItems: BudgetItem[];
  actualFill?: string;
  budgetFill?: string;
}
export const TransactionBarChart: React.FunctionComponent<
  TransactionBarChartProps
> = ({ transactions, budgetItems, budgetFill, actualFill }) => {
  const data = months.map<{
    month: Month;
    actual: number;
    budget: number;
  }>((month) => {
    const date = new Date();
    date.setMonth(months.indexOf(month));
    return {
      month,
      actual: transactions.reduce<number>((prev, curr) => {
        return (
          prev +
          (curr.date.getMonth() === months.indexOf(month) && curr.amount > 0
            ? curr.amount
            : 0)
        );
      }, 0),
      budget: budgetItems.reduce<number>((prev, currItem) => {
        return (
          prev +
          (isDateInBetween(date, currItem.startDate, currItem.endDate)
            ? currItem.amount
            : 0)
        );
      }, 0),
    };
  });

  const chartConfig = {
    amount: {
      label: "$",
    },
    budget: {
      color: budgetFill ?? "#41b8d5",
    },
    actual: {
      color: actualFill ?? "#8c52ff",
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
        <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};
