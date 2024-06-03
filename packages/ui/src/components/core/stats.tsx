import { classNames, formatDollarAmount } from 'model/src/utils'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

export interface Stat {
	name: string;
	stat: number;
	previousStat?: number;
	type: 'percent' | 'number';
}

type StatFormatted = {
	name: string;
	stat: string;
	
} & ({
  previousStat: string;
	change: `${number}%`;
	changeType: 'increase' | 'decrease'
} | {previousStat: undefined})
// const statsRaw: Stat[] = [
// 	{ name: 'Total Subscribers', stat: 71897, previousStat: 70946, type: 'number' },
//   { name: 'Avg. Open Rate', stat: 58.16, previousStat: 56.14, type: 'percent' },
//   { name: 'Avg. Click Rate', stat: 24.57, previousStat: 28.62, type: 'percent' },
// ]

const formatStats = (unformatted: Stat[]): StatFormatted[] => {
	const formatPercent = (val: number): `${number}%` => {
		return `${Math.round(val * 100) / 100}%`;
	}

	const formatNumber = (val: number): string => {
		return formatDollarAmount(val)//.slice(1);
	}
	return unformatted.map(stat => {
    if (stat.previousStat === undefined) {
      return {
        ...stat,
        stat: stat.type === 'number' ? formatNumber(stat.stat) : formatPercent(stat.stat),
        previousStat: undefined
      }
    }

		const changeType = stat.stat > stat.previousStat ? 'increase' : 'decrease';
		if (stat.type === 'number') {
			const change = changeType === 'increase' ? stat.stat / stat.previousStat : stat.previousStat / stat.stat;
			return {
				...stat,
				stat: formatNumber(stat.stat),
				previousStat: formatNumber(stat.previousStat),
				change: formatPercent(change),
				changeType
			}
		} 

		const change = Math.abs(stat.stat - stat.previousStat);
		return {
			...stat,
			stat: formatPercent(stat.stat),
			previousStat: formatPercent(stat.previousStat),
			change: formatPercent(change),
			changeType
		}
	})
}

interface StatsProps {
  label: string;
  items: Stat[]
}
export const Stats: React.FunctionComponent<StatsProps> = ({items: statsRaw, label}) => {
	const stats = formatStats(statsRaw);
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">{label}</h3>
      <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-md bg-white shadow md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((item) => (
          <div className="px-4 py-5 sm:p-6" key={item.name}>
            <dt className="text-base font-normal text-gray-900">{item.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-primary">
                {item.stat}
                {item.previousStat ? <span className="ml-2 text-sm font-medium text-gray-500">from {item.previousStat}</span> : null}
              </div>

              {item.previousStat ? <div
                className={classNames(
                  item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0'
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowUpIcon
                    aria-hidden="true"
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
                  />
                ) : (
                  <ArrowDownIcon
                    aria-hidden="true"
                    className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
                  />
                )}

                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </div> : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
