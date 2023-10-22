'use client';

import {CalendarExample, CalendarView as Real} from 'ui/src/components/core/calendar/calendar';

export const CalendarView = () => {
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarExample/>
		</div>
	)
}