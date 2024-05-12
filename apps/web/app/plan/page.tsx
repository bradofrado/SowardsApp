import type { NextPage } from 'next';
import { CalendarView} from './components/calendar-view';


const PlanPage: NextPage = () => {
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarView/>
		</div>
	)
}

export default PlanPage;