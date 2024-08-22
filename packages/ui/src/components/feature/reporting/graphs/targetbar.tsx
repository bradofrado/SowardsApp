import { classNames, formatDollarAmount } from "model/src/utils";
import { type GraphComponent, type GraphComponentProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../core/tooltip";

export type TargetBarProps = GraphComponentProps & {
  target: number;
  className?: string;
  totalLabel?: string;
};
export const TargetBar: React.FunctionComponent<TargetBarProps> = ({
  values,
  total,
  target,
  className,
  totalLabel,
}: TargetBarProps) => {
  const sortedValues = values; //.sort((a, b) => a.value - b.value);
  let lastValue = 0;

  const totalLine =
    total > 0 ? (
      <div
        className="border-l-2 h-full w-full border-l-gray-500 rounded-none"
        style={{
          transform: `translate(${(target / total) * 100}%, 0)`,
        }}
      />
    ) : null;
  return (
    <div
      className={classNames(
        "h-6 rounded-lg overflow-hidden bg-slate-200 relative",
        className,
      )}
    >
      {sortedValues.map(({ value: absoluteValue, fill, label }, i) => {
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

        if (label) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>{ret}</TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        }
        return ret;
      })}
      {totalLabel ? (
        <Tooltip>
          <TooltipTrigger asChild>{totalLine}</TooltipTrigger>
          <TooltipContent>{totalLabel}</TooltipContent>
        </Tooltip>
      ) : (
        totalLine
      )}
    </div>
  );
};
