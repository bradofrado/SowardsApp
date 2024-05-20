'use client';
import { Header } from "ui/src/components/core/header";
import {Label} from 'ui/src/components/core/label';
import { BaseModal } from "ui/src/components/core/modal";
import {Input, InputBlur} from 'ui/src/components/core/input';
import { useMemo, useState } from "react";
import {useChangeProperty} from 'ui/src/hooks/change-property';
import {Button} from 'ui/src/components/core/button';
import type { CalendarEvent } from "ui/src/components/core/calendar/calendar";
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import type { VacationEvent } from "model/src/vacation";

type EventAmountType = 'all' | 'adult' | 'child'
interface EventAmount {
    amount: number;
    type: EventAmountType;
}
export interface Event extends CalendarEvent, VacationEvent {

}

interface EventFormProps {
    event: Event;
    onSave: (event: Event) => void;
    onRemove: (event: Event) => void;
    edit: boolean
}
interface EventFormModalProps extends EventFormProps {
    show: boolean;
    onClose: () => void;
}
export const EventFormModal: React.FunctionComponent<EventFormModalProps> = ({show, onClose, onSave, onRemove, ...rest}) => {
    return <BaseModal onClose={onClose} show={show}>
        <EventForm onRemove={(event) => {
            onRemove(event);
            onClose();
        }} onSave={(event) => {
            onSave(event);
            onClose();
        }} {...rest}/>
    </BaseModal>
}
export const EventForm: React.FunctionComponent<EventFormProps> = ({event: eventProp, onSave, onRemove, edit}) => {
    const [event, setEvent] = useState<Event>(eventProp);
    const changeProperty = useChangeProperty<Event>(setEvent);
    return <div>
        <Header>{edit ? 'Edit Event' : 'Add Event'}</Header>
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
            <AmountFields amounts={event.amounts} onChange={changeProperty.formFunc('amounts', event)}/>
        </Label>
        <Label label="Notes">
            <Input onChange={changeProperty.formFunc('notes', event)} type='textarea' value={event.notes}/>
        </Label>
        <Button onClick={() => {onSave(event)}}>
            Save
        </Button>
        {edit ? <Button onClick={() => {onRemove(event)}}>Remove</Button> : null}
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

const AmountFields: React.FunctionComponent<{amounts: EventAmount[], onChange: (value: EventAmount[]) => void}> = ({amounts, onChange}) => {
    const onAmountChange = (value: EventAmount, index: number): void => {
        if (index < 0 || index >= amounts.length) return;

        const copy = amounts.slice();
        copy[index] = value;
        onChange(copy);
    }   

    const onAmountRemove = (index: number): void => {
        if (index < 0 || index >= amounts.length) return;

        const copy = amounts.slice();
        copy.splice(index, 1)
        onChange(copy);
    }   

    const onAmountAdd= (): void => {
        const copy = amounts.slice();
        copy.push({amount: 5, type: 'all'});
        onChange(copy);
    }   
    
    return (
        <div>
            {amounts.map((amount, i) => <AmountField key={amount.type} onChange={(value) => {onAmountChange(value, i)}} onRemove={() => {onAmountRemove(i)}} value={amount}/>)}
            <Button onClick={onAmountAdd}>Add</Button>
        </div>
    )
}

interface AmountFieldProps {
    value: EventAmount;
    onChange: (value: EventAmount) => void;
    onRemove: () => void;
}
const AmountField: React.FunctionComponent<AmountFieldProps> = ({value, onChange, onRemove}) => {
    const changeProperty = useChangeProperty<EventAmount>(onChange);
    return (
        <div>
            <Input onChange={(val) => changeProperty(value, 'amount', Number(val))} value={value.amount}/>
            <Input onChange={(type) => changeProperty(value, 'type', type as EventAmountType)} value={value.type}/>
            <Button onClick={onRemove}>Remove</Button>
        </div>
    )
}