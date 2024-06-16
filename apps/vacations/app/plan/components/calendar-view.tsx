'use client';
import { useMemo, useState } from 'react';
import type {CalendarEvent} from 'ui/src/components/core/calendar/calendar';
import { CalendarView as CalendarViewRaw} from 'ui/src/components/core/calendar/calendar';
import type { VacationEvent } from 'model/src/vacation';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import type { Event } from './event-form';
import { EventFormModal } from './event-form';
import { useUser } from './user-provider';

export const CalendarView: React.FunctionComponent<{events: VacationEvent[], role: string}> = ({events: eventsProps, role}) => {
	const {user} = useUser();
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
			groupIds: updatedEvent.groupIds,
			links: updatedEvent.links
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
		joinEvent({id: event.id, userId: user?.id}, {
			onSuccess() {
				router.refresh();
			}
		});
	}
	const onLeave = (event: Event): void => {
		leaveEvent({id: event.id, userId: user?.id}, {
			onSuccess() {
				router.refresh();
			}
		});
	}

	const onAddEvent = (): void => {
		setCurrEvent(events.length)
	}

	const onEditEvent = (event: CalendarEvent): void => {
		setCurrEvent(events.indexOf(event as Event))
	}

	const events: Event[] = useMemo(() => eventsProps.map(e => ({...e, color: user && e.userIds.includes(user.id) ? 'blue' : 'gray' as const, href: ''})), [eventsProps, user]);
	const edit = currEvent >= 0 && currEvent < events.length;
	const joined = Boolean(user && edit && user.events.findIndex(ev => ev.id === events[currEvent].id) > -1);
	const inGroup = Boolean(user && edit && user.groupIds.findIndex(group => events[currEvent].groupIds.includes(group)) > -1);
	return (<>
		<CalendarViewRaw events={events} initialDate={new Date('08/03/2024')} onAddEvent={role === 'admin' ? onAddEvent : undefined} onEventClick={role === 'admin' ? onEditEvent : undefined}/>
		<EventFormModal edit={edit} event={currEvent < events.length ? events[currEvent] : {id: '', name: '', date: new Date(), durationMinutes: 60, color: 'blue', href: '', location: '', notes: '', amounts: [], isPublic: true, userIds: [], createdById: '', groupIds: [], links: []}} inGroup={inGroup} joined={joined} onClose={() => {setCurrEvent(-1)}} onJoin={onJoin} onLeave={onLeave} onRemove={onRemove} onSave={onSave} show={currEvent > -1}/>
	</>)
}