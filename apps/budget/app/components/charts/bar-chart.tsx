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

const chartConfig = {
  amount: {
    label: "$",
  },
  budget: {
    color: "#41b8d5",
  },
  actual: {
    color: "#8c52ff",
  },
} satisfies ChartConfig;

interface TransactionBarChartProps {
  data: {
    month: Month;
    actual: number;
    budget: number;
  }[];
}
export const TransactionBarChart: React.FunctionComponent<
  TransactionBarChartProps
> = ({ data }) => {
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
