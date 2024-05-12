import { Header } from "ui/src/components/core/header";
import {Label} from 'ui/src/components/core/label';
import { BaseModal } from "ui/src/components/core/modal";
import {Input, InputBlur} from 'ui/src/components/core/input';
import { useMemo, useState } from "react";
import {useChangeProperty} from 'ui/src/hooks/change-property';
import {Button} from 'ui/src/components/core/button';
import type { CalendarEvent } from "ui/src/components/core/calendar/calendar";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";

type EventAmountType = 'all' | 'adult' | 'child'
interface EventAmount {
    amount: number;
    type: EventAmountType;
}
export interface Event extends CalendarEvent {
    location: string;
    amounts: EventAmount[];
    notes: string;
}

interface EventFormProps {
    event: Event;
    onSave: (event: Event) => void;
}
interface EventFormModalProps extends EventFormProps {
    show: boolean;
    onClose: () => void;
}
export const EventFormModal: React.FunctionComponent<EventFormModalProps> = ({show, onClose, onSave, ...rest}) => {
    return <BaseModal onClose={onClose} show={show}>
        <EventForm onSave={(event) => {
            onSave(event);
            onClose();
        }} {...rest}/>
    </BaseModal>
}
export const EventForm: React.FunctionComponent<EventFormProps> = ({event: eventProp, onSave}) => {
    const [event, setEvent] = useState<Event>(eventProp);
    const changeProperty = useChangeProperty<Event>(setEvent);
    return <div>
        <Header>Add New Event</Header>
        <Label label="Name">
            <Input onChange={changeProperty.formFunc('name', event)} value={event.name}/>
        </Label>
        <Label label="Date">
            <DatePicker date={event.date} onChange={changeProperty.formFunc('date', event)}/>
        </Label>
        <Label label="Time">
            <TimeRangeInput onChange={setEvent as (value: TimeRangeValue) => void} value={event}/>
        </Label>
        <Label label="Location">
            <Input onChange={changeProperty.formFunc('location', event)} value={event.location}/>
        </Label>
        <Label label="Amount">
            <AmountField onChange={(amount) => changeProperty(event, 'amounts', [amount])} value={event.amounts[0] || {value: 0, type: 'all'}}/>
        </Label>
        <Label label="Notes">
            <Input onChange={changeProperty.formFunc('notes', event)} type='textarea' value={event.notes}/>
        </Label>
        <Button onClick={() => {onSave(event)}}>
            Save
        </Button>
    </div>
}

interface TimeRangeValue {
    date: Date;
    durationMinutes: number;
}
interface TimeRangeInputProps {
    value: TimeRangeValue
    onChange: (vale: TimeRangeValue) => void;
}
const TimeRangeInput: React.FunctionComponent<TimeRangeInputProps> = ({value, onChange}) => {
    const changeProperty = useChangeProperty(onChange);
    const time = useMemo(() => {
        return value.date.getHours() + (value.date.getMinutes() / 60);
    }, [value.date]);

    const onTimeChange = (timeValue: string): void => {
        const date = new Date(value.date);
        const hours = Math.floor(Number(timeValue));
        date.setHours(hours);
        date.setMinutes((Number(timeValue) - hours) * 60)
        changeProperty(value, 'date', date);
    }
    
    return (
        <div className="flex gap-2">
            <InputBlur onChange={onTimeChange} value={time}/>
            <span> - </span>
            <Input onChange={changeProperty.formFuncNumber('durationMinutes', value)} value={value.durationMinutes}/>
        </div>
    )
}

interface AmountFieldProps {
    value: EventAmount;
    onChange: (vale: EventAmount) => void;
}
const AmountField: React.FunctionComponent<AmountFieldProps> = ({value, onChange}) => {
    const changeProperty = useChangeProperty<EventAmount>(onChange);
    return (
        <div>
            <Input onChange={(val) => changeProperty(value, 'amount', Number(val))} value={value.amount}/>
            <Input onChange={(type) => changeProperty(value, 'type', type as EventAmountType)} value={value.type}/>
        </div>
    )
}