import { UserVacation } from "db/lib/generated/client";
import { Session } from "model/src/auth";
import { VacationEvent, VacationGroup } from "model/src/vacation"
import { Stat, Stats } from "ui/src/components/core/stats"

interface StatsViewProps {
    events: VacationEvent[],
    groups: VacationGroup[],
    session: Session | undefined
}
export const StatsView: React.FunctionComponent<StatsViewProps> = ({events, groups, session}) => {
    const stats = useCalculateStats({events, groups, currUser: session?.auth.user});
    return (
        <div className="flex flex-col gap-4">
            {stats.groups.map(statGroup => <Stats key={statGroup.label} {...statGroup}/>)}
            <Stats {...stats.total}/>
        </div>
    )
}

interface StatGroup {
    items: Stat[];
    label: string;
}

interface CalculateStatsResults {
    groups: StatGroup[],
    total: StatGroup
}
interface CalculateStatsProps {
    events: VacationEvent[],
    groups: VacationGroup[],
    currUser: UserVacation | undefined;
}
const useCalculateStats = ({events, groups, currUser}: CalculateStatsProps): CalculateStatsResults => {
    const getAmountsForGroup = (groupId?: string): Stat[] => {
        const amounts = events.reduce((prev, curr) => {
            if (groupId && !curr.groupIds.includes(groupId)) return prev;

            curr.amounts.forEach(({amount, type}) => {
                prev[type] += amount;
            });
    
            return prev;
        }, {all: 0, adult: 0, child: 0, me: 0});

        return [
            ...(currUser ? [{name: 'Me', stat: amounts.me, type: 'number'}] as const : []),
            {name: 'All', stat: amounts.all, type: 'number'},
            {name: 'Adult', stat: amounts.adult, type: 'number'},
            {name: 'Child', stat: amounts.child, type: 'number'},
        ]
    }

    const amountsGroups = groups.reduce<StatGroup[]>((prev, curr) => {
        const statGroup = {
            label: curr.name,
            items: getAmountsForGroup(curr.id)
        }
        prev.push(statGroup);
        return prev;
    }, [])

    const amountsTotal = {
        label: 'Total',
        items: getAmountsForGroup()
    }

    return {
        groups: amountsGroups,
        total: amountsTotal
    }
}