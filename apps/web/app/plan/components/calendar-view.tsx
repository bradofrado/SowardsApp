'use client';

import { useState } from 'react';
import {CalendarView as CalendarViewRaw} from 'ui/src/components/core/calendar/calendar';
import type { Event } from './event-form';
import { EventFormModal } from './event-form';

export const CalendarView: React.FunctionComponent = () => {
	const [currEvent, setCurrEvent] = useState<number>(-1);
	const [events, setEvents] = useState<Event[]>([]);
	
	const onSave = (updatedEvent: Event): void => {
		const copy = events.slice();

		if (currEvent > -1) {
			copy[currEvent] = updatedEvent;
		} else {
			copy.push(updatedEvent);
		}
		setEvents(copy);
	}
	return (<>
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarViewRaw events={events} onAddEvent={() => {setCurrEvent(events.length)}} onEventClick={(event) => {setCurrEvent(events.indexOf(event))}}/>
		</div>
		<EventFormModal event={events[currEvent] || {id: 0, name: '', date: new Date('2024-05-05T10:00'), durationMinutes: 60, color: 'blue', href: '', location: '', notes: '', amounts: [{amount: 0, type: 'all'}]}} onClose={() => {setCurrEvent(-1)}} onSave={onSave} show={currEvent > -1}/>
	</>)
}