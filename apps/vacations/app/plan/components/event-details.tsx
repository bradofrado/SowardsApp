'use client';
import { Header } from "ui/src/components/core/header";
import {Label} from 'ui/src/components/core/label';
import { BaseModal } from "ui/src/components/core/modal";
import {Button} from 'ui/src/components/core/button';
import type { VacationEvent } from "model/src/vacation";
import { displayDate, displayTime, formatDollarAmount } from "model/src/utils";

interface EventDetailsProps {
    onJoin: (event: VacationEvent) => void;
    onLeave: (event: VacationEvent) => void;
    event: VacationEvent;
    joined: boolean
    inGroup: boolean
}
interface EventDetailsModalProps extends EventDetailsProps {
    show: boolean;
    onClose: () => void;
}
export const EventDetailsModal: React.FunctionComponent<EventDetailsModalProps> = ({show, onClose, onJoin, onLeave, ...rest}) => {
    const closeIt = <Props, Ret>(func: (props: Props) => Ret) => (prop: Props): Ret => {
        const ret = func(prop);
        onClose();
        return ret;
    }
    return <BaseModal onClose={onClose} show={show}>
        <EventDetails onJoin={closeIt(onJoin)} onLeave={closeIt(onLeave)} {...rest}/>
    </BaseModal>
}
export const EventDetails: React.FunctionComponent<EventDetailsProps> = ({event, joined, onLeave, onJoin, inGroup}) => {
    return <div>
        <Header>{event.name}</Header>
        <Label label="Date">
            {displayDate(event.date)}
        </Label>
        <Label label="Time">
            {displayTime(event.date)}
        </Label>
        <Label label="Location">
            {event.location}
        </Label>
        <Label label="Links">
            <div className="flex flex-col gap-2">
                {event.links.map(link => <a key={link} href={link}>{link}</a>)}
            </div>
        </Label>
        <Label label="Amount">
            <div className="flex flex-col gap-2">
                {event.amounts.map(amount => <div key={`${amount.amount}-${amount.type}`} className="flex gap-2">
                    <div>{formatDollarAmount(amount.amount)}</div>
                    <span>-</span>
                    <div>{amount.type}</div>
                </div>)}
            </div>
        </Label>
        <Label label="Notes">
            <div>{event.notes}</div>
        </Label>
        {!inGroup ? <>{!joined ? <Button onClick={() => {onJoin(event)}}>Join</Button> : <Button onClick={() => {onLeave(event)}}>Leave</Button>}</>: null}
    </div>
}