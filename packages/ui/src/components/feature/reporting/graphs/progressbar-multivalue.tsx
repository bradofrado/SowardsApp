import { useMemo } from 'react';
import { classNames } from 'model/src/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../core/tooltip';
import { type GraphComponent, type GraphComponentProps } from './types';

export type ProgressBarMultiValueProps = GraphComponentProps;
export const ProgressBarMultiValue: GraphComponent = ({
  values,
  total,
  noSort,
  totalLabel,
  className,
}: ProgressBarMultiValueProps) => {
  const sortedValues = useMemo(() => {
    const temp = noSort
      ? values.slice()
      : values.sort((a, b) => a.value - b.value);
    return temp;
  }, [noSort, values]);

  let lastValue = 0;
  const ret = (
    <div
      className={classNames(
        'h-3 rounded-lg overflow-hidden bg-slate-200 relative',
        className
      )}
    >
      {sortedValues.map(({ value: absoluteValue, fill, label }, i) => {
        const value = absoluteValue / total;
        const _ret = (
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
        lastValue += value;

        if (label) {
          return (
            <Tooltip key={value}>
              <TooltipTrigger asChild>{_ret}</TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          );
        }

        return _ret;
      })}
    </div>
  );

  if (totalLabel) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{ret}</TooltipTrigger>
        <TooltipContent>{totalLabel}</TooltipContent>
      </Tooltip>
    );
  }

  return ret;
};
