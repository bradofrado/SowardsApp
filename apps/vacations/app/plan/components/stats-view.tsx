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
    const stats = useCalculateStats({events, groups, currUser: session?.auth.userVacation});
    return (
        <div className="flex flex-col gap-4">
            <Stats {...stats.total}/>
            {stats.groups.map(statGroup => <Stats key={statGroup.label} {...statGroup}/>)}
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
    const getAmountsForGroup = (group?: VacationGroup): Stat[] => {
        const groupId = group?.id;
        const amounts = events.reduce((prev, curr) => {
            if (curr.groupIds.length && groupId && !curr.groupIds.includes(groupId)) return prev;

            curr.amounts.forEach(({amount, type}) => {
                prev[type] += amount;
            });
    
            return prev;
        }, {all: 0, adult: 0, child: 0, me: 0});

        const numPeopleInGroup = group?.users.reduce((prev, curr) => {
            if (curr.amountType === 'adult') {
                prev.adult += 1;
            } else if (curr.amountType === 'child') {
                prev.child += 1;
            }

            return prev;
        }, {adult: 0, child: 0});
        const numAdults = numPeopleInGroup?.adult ?? (currUser?.amountType === 'adult' ? 1 : 0);
        const numChilds = numPeopleInGroup?.child ?? (currUser?.amountType === 'child' ? 1 : 0);

        return [
            {name: 'Total', stat: amounts.adult * numAdults + amounts.child * numChilds, type: 'number'},
            //{name: 'All', stat: amounts.all, type: 'number'},
            {name: 'Adult', stat: amounts.adult * numAdults, type: 'number'},
            {name: 'Child', stat: amounts.child * numChilds, type: 'number'},
        ]
    }

    const amountsGroups = groups.reduce<StatGroup[]>((prev, curr) => {
        const statGroup = {
            label: curr.name,
            items: getAmountsForGroup(curr)
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