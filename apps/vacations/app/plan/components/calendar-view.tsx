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
	const {mutate: createEvent} = api.vacation.createVacationEvent.useMutation();
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
			userIds: []
		}
		createEvent(vacationEvent, {
			onSuccess() {
				router.refresh();
			}
		})
	}

	const events: Event[] = useMemo(() => eventsProps.map(e => ({...e, color: 'blue', href: ''})), [eventsProps]);

	return (<>
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarViewRaw events={events} onAddEvent={() => {setCurrEvent(events.length)}} onEventClick={(event) => {setCurrEvent(events.indexOf(event))}}/>
		</div>
		<EventFormModal event={currEvent < events.length ? events[currEvent] : {id: '', name: '', date: new Date('2024-05-05T10:00'), durationMinutes: 60, color: 'blue', href: '', location: '', notes: '', amounts: [{amount: 0, type: 'all'}], isPublic: true, userIds: []}} onClose={() => {setCurrEvent(-1)}} onSave={onSave} show={currEvent > -1}/>
	</>)
}