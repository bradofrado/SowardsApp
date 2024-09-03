import { GraphComponent } from "./types";

export const ChartLegend: GraphComponent = ({
  values: valuesProps,
  noSort,
}) => {
  const values = noSort
    ? valuesProps
    : valuesProps.sort((a, b) => a.value - b.value);
  return (
    <div className="flex gap-4 justify-center items-center mt-2">
      {values.map((value) => (
        <div key={value.value} className="flex gap-2 items-center">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: value.fill }}
          />
          <div>{value.label}</div>
        </div>
      ))}
    </div>
  );
};
