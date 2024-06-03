import { prisma } from 'db/lib/prisma';
import { getVacationEvents } from 'api/src/repositories/event';
import { getGroups } from 'api/src/repositories/group';
import { redirect } from 'next/navigation';
import { requireUserVacation } from '../../utils/protected-routes-hoc';
import { StatsView } from './components/stats-view';
import { CalendarView} from './components/calendar-view';

const PlanPage = async (): Promise<JSX.Element> => {
	const result = await requireUserVacation()();
	if (result.redirect) {
		redirect(result.redirect);
	}

	const events = await getVacationEvents({db: prisma});
	const groups = await getGroups({db: prisma});
	const session = result.session
	return (
		<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
			<CalendarView events={events} user={session?.auth.userVacation}/>
			<StatsView events={events} groups={groups} session={session}/>
		</div>
	)
}

export default PlanPage;