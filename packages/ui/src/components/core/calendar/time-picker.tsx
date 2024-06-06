import { useMemo, useRef } from "react";
import { useLocale } from "@react-aria/i18n";
import { useTimeFieldState } from "@react-stately/datepicker";
import type { DateFieldState, TimeFieldStateOptions, DateSegment  } from "@react-stately/datepicker";
import { useTimeField , useDateSegment } from "@react-aria/datepicker";
import { useChangeProperty } from "../../../hooks/change-property";
import { Time, CalendarDateTime } from "@internationalized/date";
import { InputBlur } from "../input";

function dateToTime(date: Date): Time {
  return new Time(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

export interface TimeRangeValue {
  date: Date;
  durationMinutes: number;
}
interface TimeRangeInputProps {
  value: TimeRangeValue
  onChange: (vale: TimeRangeValue) => void;
}
export const TimeRangeInput: React.FunctionComponent<TimeRangeInputProps> = ({value, onChange}) => {
  const changeProperty = useChangeProperty(onChange);

  const onTimeChange = (newValue: Time): void => {
    changeProperty(value, 'date', new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate(), newValue.hour, newValue.minute, newValue.second, newValue.millisecond));
  }

  const onDurationChange = (newDurationTime: Time): void => {
    const durationDate = new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate(), newDurationTime.hour, newDurationTime.minute, newDurationTime.second, newDurationTime.millisecond);
    const diff = durationDate.getTime() - value.date.getTime();
    //if (diff < 0) return;

    changeProperty(value, 'durationMinutes', diff / (60000));
  }

  const timeValue = useMemo(() => dateToTime(value.date), [value]);
  const timeDuration = useMemo(() => dateToTime(new Date(value.date.getTime() + value.durationMinutes * 60000)), [value]);
  return (<div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <TimePicker onChange={onTimeChange} value={timeValue}/>
        <TimePicker onChange={onDurationChange} value={timeDuration}/>
      </div>
      {value.durationMinutes >= 0 || value.durationMinutes >= 24 * 60 ? <div><InputBlur value={value.durationMinutes} onChange={changeProperty.formFuncNumber('durationMinutes', value)}/> minutes</div> : <div className="text-red-400">Invalid end time</div>}
    </div>
  )
}

type TimePickerProps = Omit<TimeFieldStateOptions<Time>, 'locale'>
function TimePicker(props: TimePickerProps): JSX.Element {
  const { locale } = useLocale();
  const state = useTimeFieldState({
    ...props,
    locale
  });

  const ref = useRef<HTMLDivElement>(null);
  const { labelProps, fieldProps } = useTimeField(props, state, ref);

  return (
    <div className="flex flex-col items-start">
      <span {...labelProps} className="text-sm text-gray-800">
        {props.label}
      </span>
      <div
        {...fieldProps}
        className="flex bg-white border border-gray-300 hover:border-gray-400 transition-colors rounded-md pr-8 focus-within:border-primary focus-within:hover:border-primary p-1"
        ref={ref}
      >
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
}

interface DateSegmentProps {
  segment: DateSegment,
  state: DateFieldState
}
export function DateSegment({ segment, state }: DateSegmentProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      className={`px-0.5 box-content tabular-nums text-right outline-none rounded-sm focus:bg-primary focus:text-white group ${
        !segment.isEditable ? "text-gray-500" : "text-gray-800"
      }`}
      ref={ref}
      style={{
        ...segmentProps.style,
        minWidth:
          segment.maxValue !== undefined ? `${String(segment.maxValue).length}ch` : undefined
      }}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      <span
        aria-hidden="true"
        className="block w-full text-center italic text-gray-500 group-focus:text-white"
        style={{
          visibility: segment.isPlaceholder ? undefined : "hidden",
          height: segment.isPlaceholder ? "" : 0,
          pointerEvents: "none"
        }}
      >
        {segment.placeholder}
      </span>
      {segment.isPlaceholder ? "" : segment.text}
    </div>
  );
}
