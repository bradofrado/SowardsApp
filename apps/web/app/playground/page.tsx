import type { NextPage } from 'next';
import { CalendarView, FeedView, ReportingView, StatsView } from '../../utils/calendar-view';


const PlaygroundPage: NextPage = () => {
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<ReportingView/>
		</div>
	)
}

export default PlaygroundPage;