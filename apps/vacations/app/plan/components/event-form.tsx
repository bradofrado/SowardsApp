'use client';
import { Header } from "ui/src/components/core/header";
import {Label} from 'ui/src/components/core/label';
import { BaseModal } from "ui/src/components/core/modal";
import {Input} from 'ui/src/components/core/input';
import { useMemo, useState } from "react";
import {useChangeProperty} from 'ui/src/hooks/change-property';
import {Button} from 'ui/src/components/core/button';
import type { CalendarEvent } from "ui/src/components/core/calendar/calendar";
import type { TimeRangeValue} from 'ui/src/components/core/calendar/time-picker';
import {TimeRangeInput} from 'ui/src/components/core/calendar/time-picker';
import { DatePicker } from "ui/src/components/core/calendar/date-picker";
import type { AmountType, VacationEvent } from "model/src/vacation";
import type { DropdownItem } from "ui/src/components/core/dropdown";
import { Dropdown } from "ui/src/components/core/dropdown";
import { useUser } from "./user-provider";
import { isUserAmount } from "./stats-view";

type EventAmount = Event['amounts'][number]
type EventAmountType = AmountType
export interface Event extends CalendarEvent, VacationEvent {

}

interface EventFormProps {
    event: Event;
    onSave: (event: Event) => void;
    onRemove: (event: Event) => void;
    onJoin: (event: Event) => void;
    onLeave: (event: Event) => void;
    edit: boolean
    joined: boolean
    inGroup: boolean
}
interface EventFormModalProps extends EventFormProps {
    show: boolean;
    onClose: () => void;
}
export const EventFormModal: React.FunctionComponent<EventFormModalProps> = ({show, onClose, onSave, onJoin, onLeave, onRemove, ...rest}) => {
    const closeIt = <Props, Ret>(func: (props: Props) => Ret) => (prop: Props): Ret => {
        const ret = func(prop);
        onClose();
        return ret;
    }
    return <BaseModal onClose={onClose} show={show}>
        <EventForm onJoin={closeIt(onJoin)} onLeave={closeIt(onLeave)} onRemove={closeIt(onRemove)} onSave={closeIt(onSave)} {...rest}/>
    </BaseModal>
}
export const EventForm: React.FunctionComponent<EventFormProps> = ({event: eventProp, onSave, onRemove, onJoin, onLeave, edit, joined, inGroup}) => {
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
        {/* <Label label="Group">
            <VacationGroupDropdown onChange={changeProperty.formFunc('groupIds', event)} value={event.groupIds}/>
        </Label> */}
        <Button onClick={() => {onSave(event)}}>
            Save
        </Button>
        {edit ? <>
            <Button onClick={() => {onRemove(event)}}>Delete</Button>
            {!inGroup ? <>{!joined ? <Button onClick={() => {onJoin(event)}}>Join</Button> : <Button onClick={() => {onLeave(event)}}>Leave</Button>}</>: null}
        </> : null}
    </div>
}

const AmountFields: React.FunctionComponent<{amounts: EventAmount[], onChange: (value: EventAmount[]) => void}> = ({amounts, onChange}) => {
    const {user} = useUser();
    const filteredAmounts = useMemo(() => amounts.filter(amount => isUserAmount(amount, user?.id)), [amounts, user]);
    
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
        copy.push({amount: 5, type: 'custom', createdById: user?.id || ''});
        onChange(copy);
    }   


    
    return (
        <div>
            {filteredAmounts.map((amount, i) => <AmountField key={amount.type} onChange={(value) => {onAmountChange(value, i)}} onRemove={() => {onAmountRemove(i)}} value={amount}/>)}
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
    const items: DropdownItem<EventAmountType>[] = [
        {
            id: 'adult',
            name: 'Adult'
        },
        {
            id: 'child',
            name: 'Child'
        },
        {
            id: 'custom',
            name: "Custom"
        }
    ]
    return (
        <div>
            <div className="flex gap-2">
                <Input onChange={(val) => changeProperty(value, 'amount', Number(val))} value={value.amount}/>
                <Dropdown initialValue={value.type} items={items} onChange={(item) => changeProperty(value, 'type', item.id)}>Select Type</Dropdown>
            </div>
            <Button onClick={onRemove}>Remove</Button>
        </div>
    )
}