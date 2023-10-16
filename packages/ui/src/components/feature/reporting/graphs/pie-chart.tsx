import { type GraphComponent, type GraphComponentProps } from "./types";

export type PieChartProps = {
  width?: number;
  height?: number;
} & GraphComponentProps;
export const PieChart: GraphComponent = ({
  values,
  total,
  width = 100,
  height = 100,
}: PieChartProps) => {
  let currValue = 0;
  const sortedValues = values
    .sort((a, b) => a.value - b.value)
    .map((value, i) =>
      i > 0 ? { ...value, value: value.value + values[i - 1].value } : value,
    )
    .sort((a, b) => b.value - a.value);
  return (
    <svg
      className="rounded-full bg-slate-200 -rotate-90"
      height={height}
      viewBox="0 0 32 32"
      width={width}
    >
      <circle className="fill-slate-200" cx="16" cy="16" r="16" />
      {sortedValues.map(({ value: absoluteValue, fill }, i) => {
        const value = absoluteValue / total;
        currValue = value;
        return (
          <circle
            className="fill-transparent transition duration-1000"
            cx="16"
            cy="16"
            key={i}
            r="16"
            strokeDasharray={`${currValue * 100} 100`}
            strokeWidth="32"
            style={{ transitionProperty: "stroke-dasharray", stroke: fill }}
          />
        );
      })}
    </svg>
  );
};
