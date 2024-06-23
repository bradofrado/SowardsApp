"use client";
import type {
  AmountType,
  UserVacation,
  VacationAmount,
  VacationEvent,
  VacationGroup,
} from "model/src/vacation";
import type { Stat } from "ui/src/components/core/stats";
import { useUser } from "./user-provider";
import { formatDollarAmount } from "model/src/utils";
import { Divider } from "ui/src/components/catalyst/divider";
import { Badge } from "ui/src/components/catalyst/badge";
import { getAmountOfPeople } from "model/src/vacation-utils";

export function Stat({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change?: string;
}) {
  return (
    <div>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6">{title}</div>
      <div className="mt-3 text-3xl/8 font-semibold sm:text-2xl/8">{value}</div>
      {change ? (
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          <Badge color={change.startsWith("+") ? "lime" : "pink"}>
            {change}
          </Badge>{" "}
          <span className="text-zinc-500">from last week</span>
        </div>
      ) : null}
    </div>
  );
}

interface StatsViewProps {
  events: VacationEvent[];
  groups: VacationGroup[];
}
export const StatsView: React.FunctionComponent<StatsViewProps> = ({
  events,
  groups,
}) => {
  const { user: currUser } = useUser();
  const stats = useCalculateStats({ events, groups, currUser });
  return (
    <div className="mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {stats.total.items.map((stat) => (
        <Stat
          key={stat.name}
          title={stat.name}
          value={formatDollarAmount(stat.stat)}
        />
      ))}
    </div>
  );
};

interface StatGroup {
  items: Stat[];
  label: string;
}

interface CalculateStatsResults {
  groups: StatGroup[];
  total: StatGroup;
}
interface CalculateStatsProps {
  events: VacationEvent[];
  groups: VacationGroup[];
  currUser: UserVacation | undefined;
}
export const useCalculateStats = ({
  events,
  currUser,
}: CalculateStatsProps): CalculateStatsResults => {
  const getAmountsForGroup = (group?: VacationGroup): Stat[] => {
    const _events = currUser?.events ?? events;
    const groupId = group?.id;
    if (groupId) {
      _events.push(
        ...events.filter((event) => event.groupIds.includes(groupId)),
      );
    }
    const amounts = _events.reduce<Record<"adult" | "child" | "total", number>>(
      (prev, curr) => {
        const eventAmount = getAmountForEvent(curr, currUser);
        prev.adult += eventAmount.adult;
        prev.child += eventAmount.child;
        prev.total += eventAmount.total;

        return prev;
      },
      { total: 0, adult: 0, child: 0 },
    );

    // const numPeopleInGroup = //group?.users ? getAmountOfPeople(group.users, (item) => getAmountOfPeople(item.dependents)) :
    //   (function UserAmounts() {
    //     if (!currUser?.dependents) return { adult: 0, child: 0 };

    //     const amount = getAmountOfPeople(currUser.dependents);
    //     // if (currUser..amountType === 'adult') {
    //     //     amount.adult += 1;
    //     // } else if (currUser.amountType === 'child') {
    //     //     amount.child += 1;
    //     // }

    //     return amount;
    //   })();
    // const numAdults = numPeopleInGroup.adult;
    // const numChilds = numPeopleInGroup.child;

    // const totalChild = amounts.child * numChilds;
    // const totalAdult = amounts.adult * numAdults;
    // const total = totalAdult + totalChild + amounts.custom;

    return [
      { name: "Total", stat: amounts.total, type: "number" },
      { name: "Adult", stat: amounts.adult, type: "number" },
      { name: "Child", stat: amounts.child, type: "number" },
    ];
  };

  // const amountsGroups = groups.reduce<StatGroup[]>((prev, curr) => {
  //     const statGroup = {
  //         label: curr.name,
  //         items: getAmountsForGroup(curr)
  //     }
  //     prev.push(statGroup);
  //     return prev;
  // }, [])

  const amountsTotal = {
    label: "Bugdet",
    items: getAmountsForGroup(),
  };

  return {
    groups: [],
    total: amountsTotal,
  };
};

export const getAmountForEvent = (
  event: VacationEvent,
  currUser?: UserVacation,
): { total: number; adult: number; child: number } => {
  const results = event.amounts.reduce(
    (prev, curr) => {
      if (
        (currUser && !currUser.eventIds.includes(event.id)) ||
        !isUserAmount(curr, currUser?.id)
      )
        return prev;

      prev[curr.type] += curr.amount;

      return prev;
    },
    { custom: 0, adult: 0, child: 0 },
  );

  const amounts = getAmountOfPeople(currUser?.dependents ?? []);
  return {
    total:
      results.custom +
      results.adult * amounts.adult +
      results.child * amounts.child,
    adult: results.adult * amounts.adult,
    child: results.child * amounts.child,
  };
};

export const isUserAmount = (
  amount: VacationAmount,
  userId: string | undefined,
): boolean => amount.type !== "custom" || amount.createdById === userId;
