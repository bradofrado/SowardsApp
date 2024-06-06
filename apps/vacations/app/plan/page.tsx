import { prisma } from 'db/lib/prisma';
import { getVacationEvents } from 'api/src/repositories/event';
import { getGroups } from 'api/src/repositories/group';
import { redirect } from 'next/navigation';
import { getUsers } from 'api/src/auth';
import { requireUserVacation } from '../../utils/protected-routes-hoc';
import { StatsView } from './components/stats-view';
import { CalendarView} from './components/calendar-view';
import { UserProvider } from './components/user-provider';
import { UserToggle } from './components/user-toggle';
import { getUser } from './actions';

const PlanPage = async (): Promise<JSX.Element> => {
	const result = await requireUserVacation()();
	if (result.redirect) {
		redirect(result.redirect);
	}

	const events = await getVacationEvents({db: prisma});
	const groups = await getGroups({db: prisma});
	const users = await getUsers();

	const session = result.session
	return (
		<UserProvider user={session?.auth.userVacation} getUser={getUser}>
			<div className="mx-auto max-w-lg px-6 py-8 lg:max-w-4xl xl:max-w-6xl h-0 min-h-[768px]">
				<div className="md:grid md:grid-cols-3 md:divide-x md:divide-gray-200">
					<div className="md:pr-14 md:col-span-1 flex flex-col gap-2">
						<StatsView events={events} groups={groups}/>
						<UserToggle getUser={getUser} users={users}/>
					</div>
					<div className="mt-12 md:mt-0 md:pl-14 md:col-span-2">
						<CalendarView events={events} role={session?.auth.userVacation.role || 'user'}/>
					</div>
				</div>
			</div>
		</UserProvider>
	)
}

export default PlanPage;