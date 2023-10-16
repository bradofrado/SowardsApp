import { type GraphComponent, type GraphComponentProps } from "./types";

export type ProgressBarMultiValueProps = GraphComponentProps;
export const ProgressBarMultiValue: GraphComponent = ({
  values,
  total,
}: ProgressBarMultiValueProps) => {
  const sortedValues = values.sort((a, b) => a.value - b.value);
  let lastValue = 0;
  return (
    <div className="h-3 rounded-lg overflow-hidden bg-slate-200 relative">
      {sortedValues.map(({ value: absoluteValue, fill }, i) => {
        const value = absoluteValue / total;
        const ret = (
          <div
            className="bg-primary h-full w-full absolute transition-transform duration-1000 origin-left"
            key={i}
            style={{
              transform: `scaleX(${value}) translate(${
                (lastValue * 100) / (value || 1)
              }%, 0)`,
              backgroundColor: fill,
            }}
          />
        );
        lastValue = value;
        return ret;
      })}
    </div>
  );
};
