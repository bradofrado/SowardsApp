import { getVacationEvents } from 'api/src/routers/vacation/event';
import { prisma } from 'db/lib/prisma';
import { CalendarView} from './components/calendar-view';


const PlanPage = async (): Promise<JSX.Element> => {
	const events = await getVacationEvents({db: prisma})
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarView events={events}/>
		</div>
	)
}

export default PlanPage;