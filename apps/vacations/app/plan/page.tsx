import type { NextPage } from 'next';
import { CalendarView} from './components/calendar-view';
import { getVacationEvents } from 'api/src/routers/vacation';
import { prisma } from 'db/lib/prisma';


const PlanPage = async () => {
	const events = await getVacationEvents({db: prisma})
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarView events={events}/>
		</div>
	)
}

export default PlanPage;