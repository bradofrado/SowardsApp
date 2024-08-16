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

interface CategoryNegativeChartProps {
  data: {
    category: CategoryBudget;
    actual: number;
    budgeted: number;
  }[];
}
export const CategoryNegativeChart: React.FunctionComponent<
  CategoryNegativeChartProps
> = ({ data }) => {
  const chartData = data.map(({ category, actual, budgeted }) => ({
    category: category.name,
    amount: actual - budgeted,
    fill: actual > budgeted ? chartConfig.over.color : chartConfig.under.color,
  }));
  return (
    <ChartContainer
      config={chartConfig}
      //className="h-[1000px]"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{
          left: 0,
        }}
        // width={800}
        // height={1000}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="category"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={150}
          //   tickFormatter={(value) =>
          //     chartConfig[value as keyof typeof chartConfig]?.label
          //   }
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
