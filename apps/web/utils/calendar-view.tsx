'use client';

import {CalendarExample, CalendarView as Real} from 'ui/src/components/core/calendar/calendar';
import {FeedExample} from 'ui/src/components/core/feed';
import {StatsExample} from 'ui/src/components/core/stats';
import {LineChartExample} from 'ui/src/components/feature/reporting/graphs/line-chart';

export const CalendarView = () => {
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarExample/>
		</div>
	)
}

export const FeedView = () => {
	return (
		<FeedExample/>
	)
}

export const StatsView = () => {
	return (
		<StatsExample/>
	)
}

export const ReportingView = () => {
	return (
		<LineChartExample/>
	)
}