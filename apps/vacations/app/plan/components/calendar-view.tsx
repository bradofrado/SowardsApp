'use client';
import { useMemo, useState } from 'react';
import {CalendarView as CalendarViewRaw} from 'ui/src/components/core/calendar/calendar';
import type { VacationEvent } from 'model/src/vacation';
import { useRouter } from 'next/navigation';
import { api } from '../../../utils/api';
import type { Event } from './event-form';
import { EventFormModal } from './event-form';

export const CalendarView: React.FunctionComponent<{events: VacationEvent[]}> = ({events: eventsProps}) => {
	const [currEvent, setCurrEvent] = useState<number>(-1);
	const {mutate: createEvent} = api.vacationEvent.createVacationEvent.useMutation();
	const {mutate: updateEvent} = api.vacationEvent.updateVacationEvent.useMutation();
	const {mutate: removeEvent} = api.vacationEvent.deleteVacationEvent.useMutation();

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

	const events: Event[] = useMemo(() => eventsProps.map(e => ({...e, color: 'blue', href: ''})), [eventsProps]);
	const edit = currEvent < events.length;

	return (<>
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarViewRaw events={events} onAddEvent={() => {setCurrEvent(events.length)}} onEventClick={(event) => {setCurrEvent(events.indexOf(event as Event))}}/>
		</div>
		<EventFormModal edit={edit} event={currEvent < events.length ? events[currEvent] : {id: '', name: '', date: new Date('2024-05-05T10:00'), durationMinutes: 60, color: 'blue', href: '', location: '', notes: '', amounts: [], isPublic: true, userIds: [], createdById: '', groupIds: []}} onClose={() => {setCurrEvent(-1)}} onRemove={onRemove} onSave={onSave} show={currEvent > -1}/>
	</>)
}