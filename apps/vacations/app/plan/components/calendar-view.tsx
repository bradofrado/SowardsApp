'use client';
import { useMemo, useState } from 'react';
import {CalendarView as CalendarViewRaw} from 'ui/src/components/core/calendar/calendar';
import type { UserVacation, VacationEvent } from 'model/src/vacation';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import type { Event } from './event-form';
import { EventFormModal } from './event-form';

export const CalendarView: React.FunctionComponent<{events: VacationEvent[], user: UserVacation | undefined}> = ({events: eventsProps, user}) => {
	const [currEvent, setCurrEvent] = useState<number>(-1);
	const {mutate: createEvent} = api.vacationEvent.createVacationEvent.useMutation();
	const {mutate: updateEvent} = api.vacationEvent.updateVacationEvent.useMutation();
	const {mutate: removeEvent} = api.vacationEvent.deleteVacationEvent.useMutation();
	const {mutate: joinEvent} = api.vacationEvent.joinVacationEvent.useMutation();
	const {mutate: leaveEvent} = api.vacationEvent.leaveVacationEvent.useMutation();

	const router = useRouter();
	
	const onSave = (updatedEvent: Event): void => {
		const vacationEvent: VacationEvent = {
			id: updatedEvent.id,
			name: updatedEvent.name,
			location: updatedEvent.location,
			notes: updatedEvent.notes,
			amounts: updatedEvent.amounts,
			date: updatedEvent.date,
			durationMinutes: updatedEvent.durationMinutes,
			isPublic: updatedEvent.isPublic,
			userIds: [],
			createdById: '',
			groupIds: updatedEvent.groupIds
		}
		if (edit) {
			updateEvent(vacationEvent, {
				onSuccess() {
					router.refresh();
				}
			})
		} else {
			createEvent(vacationEvent, {
				onSuccess() {
					router.refresh();
				}
			})
		}
	}

	const onRemove = (event: Event): void => {
		removeEvent(event.id, {
			onSuccess() {
				router.refresh();
			}
		});
	}

	const onJoin = (event: Event): void => {
		joinEvent(event.id, {
			onSuccess() {
				router.refresh();
			}
		});
	}
	const onLeave = (event: Event): void => {
		leaveEvent(event.id, {
			onSuccess() {
				router.refresh();
			}
		});
	}

	const events: Event[] = useMemo(() => eventsProps.map(e => ({...e, color: user && e.userIds.includes(user.id) ? 'blue' : 'gray' as const, href: ''})), [eventsProps, user]);
	const edit = currEvent >= 0 && currEvent < events.length;
	const joined = Boolean(user && edit && user.events.findIndex(ev => ev.id === events[currEvent].id) > -1);
	const inGroup = Boolean(user && edit && user.groupIds.findIndex(group => events[currEvent].groupIds.includes(group)) > -1);
	return (<>
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarViewRaw events={events} onAddEvent={() => {setCurrEvent(events.length)}} onEventClick={(event) => {setCurrEvent(events.indexOf(event as Event))}} intitialDate={new Date('08/03/2024')}/>
		</div>
		<EventFormModal edit={edit} event={currEvent < events.length ? events[currEvent] : {id: '', name: '', date: new Date(), durationMinutes: 60, color: 'blue', href: '', location: '', notes: '', amounts: [], isPublic: true, userIds: [], createdById: '', groupIds: []}} inGroup={inGroup} joined={joined} onClose={() => {setCurrEvent(-1)}} onJoin={onJoin} onLeave={onLeave} onRemove={onRemove} onSave={onSave} show={currEvent > -1}/>
	</>)
}