'use client'
import type { AmountType, UserVacation , VacationEvent, VacationGroup } from "model/src/vacation";
import type { Stat} from "ui/src/components/core/stats";
import { Stats } from "ui/src/components/core/stats"
import { useUser } from "./user-provider";

interface StatsViewProps {
    events: VacationEvent[],
    groups: VacationGroup[],
}
export const StatsView: React.FunctionComponent<StatsViewProps> = ({events, groups}) => {
    const {user: currUser} = useUser();
    const stats = useCalculateStats({events, groups, currUser});
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
const useCalculateStats = ({events, currUser}: CalculateStatsProps): CalculateStatsResults => {
    const getAmountOfPeople = <T extends {amountType: AmountType}>(userLike: T[], callback?: (item: T) => {child: number, adult: number}): {child: number, adult: number} => {
        return userLike.reduce((prev, curr) => {
            if (curr.amountType === 'adult') {
                prev.adult += 1;
            } else if (curr.amountType === 'child') {
                prev.child += 1;
            }

            if (callback) {
                const res = callback(curr);
                prev.adult += res.adult;
                prev.child += res.child;
            }

            return prev;
        }, {adult: 0, child: 0})
    }
    const getAmountsForGroup = (group?: VacationGroup): Stat[] => {
        const _events = currUser?.events ?? events;
        const groupId = group?.id;
        if (groupId) {
            _events.push(...events.filter(event => event.groupIds.includes(groupId)));
        }
        const amounts = _events.reduce((prev, curr) => {
            curr.amounts.forEach(({amount, type}) => {
                prev[type] += amount;
            });
    
            return prev;
        }, {all: 0, adult: 0, child: 0, me: 0});

        const numPeopleInGroup = //group?.users ? getAmountOfPeople(group.users, (item) => getAmountOfPeople(item.dependents)) : 
        (function UserAmounts() {
            if (!currUser?.dependents) return {adult: 0, child: 0};

            const amount = getAmountOfPeople(currUser.dependents);
            if (currUser.amountType === 'adult') {
                amount.adult += 1;
            } else if (currUser.amountType === 'child') {
                amount.child += 1;
            }

            return amount;
        })()
        const numAdults = numPeopleInGroup.adult
        const numChilds = numPeopleInGroup.child

        return [
            {name: 'Total', stat: amounts.adult * numAdults + amounts.child * numChilds, type: 'number'},
            //{name: 'All', stat: amounts.all, type: 'number'},
            {name: 'Adult', stat: amounts.adult * numAdults, type: 'number'},
            {name: 'Child', stat: amounts.child * numChilds, type: 'number'},
        ]
    }

    // const amountsGroups = groups.reduce<StatGroup[]>((prev, curr) => {
    //     const statGroup = {
    //         label: curr.name,
    //         items: getAmountsForGroup(curr)
    //     }
    //     prev.push(statGroup);
    //     return prev;
    // }, [])

    const amountsTotal = {
        label: 'Bugdet',
        items: getAmountsForGroup()
    }

    return {
        groups: [],
        total: amountsTotal
    }
}