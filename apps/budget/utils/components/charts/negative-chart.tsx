"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "ui/src/components/feature/reporting/rechart/rechart";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "ui/src/components/feature/reporting/rechart/chart";
import { CategoryBudget } from "model/src/budget";
import { useMemo } from "react";

const chartConfig = {
  amount: {
    label: "$",
  },
  over: {
    color: "#fe502d",
  },
  under: {
    color: "#7ed957",
  },
} satisfies ChartConfig;

interface CategoryChartData {
  category: CategoryBudget;
  actual: number;
  budgeted: number;
}
interface ChartData {
  category: string;
  amount: number;
  fill: string;
}
interface CategoryNegativeChartProps {
  data: CategoryChartData[];
  uncategorizedData: Omit<CategoryChartData, "category"> | undefined;
}
export const CategoryNegativeChart: React.FunctionComponent<
  CategoryNegativeChartProps
> = ({ data, uncategorizedData }) => {
  const chartData: ChartData[] = useMemo(() => {
    const allData: ChartData[] = [];
    if (uncategorizedData) {
      allData.push({
        category: "Uncategorized",
        amount: uncategorizedData.actual - uncategorizedData.budgeted,
        fill:
          uncategorizedData.actual > uncategorizedData.budgeted
            ? chartConfig.over.color
            : chartConfig.under.color,
      });
    }
    allData.push(
      ...data.map(({ category, actual, budgeted }) => ({
        category: category.name,
        amount: actual - budgeted,
        fill:
          actual > budgeted ? chartConfig.over.color : chartConfig.under.color,
      })),
    );

    return allData;
  }, [data, uncategorizedData]);
  return (
    <ChartContainer config={chartConfig} aspectSquare>
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={200}
        />
        <XAxis dataKey="amount" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="amount" layout="vertical" radius={5} />
      </BarChart>
    </ChartContainer>
  );
};
