import React, { Fragment } from 'react'
import { calculateDateDifference, classNames, day, displayElapsedTime, hour } from 'model/src/utils'
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from './icons'

type ActivityType = 'comment' | 'assignment' | 'tags';
interface ActivityPerson {
	name: string,
	href: string
}
interface ActivityTag {
	name: string,
	href: string,
	color: string
}
interface ActivityBase<Type extends ActivityType> {
	id: number,
	type: Type,
	person: ActivityPerson,
	date: Date
}

interface ActivityComment extends ActivityBase<'comment'> {
	imageUrl: string,
	comment: string
}

interface ActivityAssignment extends ActivityBase<'assignment'> {
	assigned: ActivityPerson
}

interface ActivityTags extends ActivityBase<'tags'> {
	tags: ActivityTag[]
}

type Activity = ActivityComment | ActivityAssignment | ActivityTags
type ActivityComponent<Type extends ActivityType> = React.FunctionComponent<{activity: Extract<Activity, ActivityBase<Type>>}>

const _activity: Activity[] = [
  {
    id: 1,
    type: 'comment',
    person: { name: 'Eduardo Benz', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ',
    date: calculateDateDifference(6 * day),
  },
  {
    id: 2,
    type: 'assignment',
    person: { name: 'Hilary Mahy', href: '#' },
    assigned: { name: 'Kristin Watson', href: '#' },
    date: calculateDateDifference(2 * day),
  },
  {
    id: 3,
    type: 'tags',
    person: { name: 'Hilary Mahy', href: '#' },
    tags: [
      { name: 'Bug', href: '#', color: 'fill-red-500' },
      { name: 'Accessibility', href: '#', color: 'fill-indigo-500' },
    ],
    date: calculateDateDifference(6 * hour),
  },
  {
    id: 4,
    type: 'comment',
    person: { name: 'Jason Meyers', href: '#' },
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
    comment:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
    date: calculateDateDifference(2 * hour),
  },
];

const ActivityComment: ActivityComponent<'comment'> = ({activity}) => {
	return (
		<>
			<div className="relative">
				<img
					alt=""
					className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
					src={activity.imageUrl}
				/>

				<span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
					<ChatBubbleLeftEllipsisIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
				</span>
			</div>
			<div className="min-w-0 flex-1">
				<div>
					<div className="text-sm">
						<a className="font-medium text-gray-900" href={activity.person.href}>
							{activity.person.name}
						</a>
					</div>
					<p className="mt-0.5 text-sm text-gray-500">Commented {displayElapsedTime(activity.date)}</p>
				</div>
				<div className="mt-2 text-sm text-gray-700">
					<p>{activity.comment}</p>
				</div>
			</div>
		</>
	)
}

const ActivityAssignment: ActivityComponent<'assignment'> = ({activity}) => {
	return (
		<>
			<div>
				<div className="relative px-1">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
						<UserCircleIcon aria-hidden="true" className="h-5 w-5 text-gray-500" />
					</div>
				</div>
			</div>
			<div className="min-w-0 flex-1 py-1.5">
				<div className="text-sm text-gray-500">
					<a className="font-medium text-gray-900" href={activity.person.href}>
						{activity.person.name}
					</a>{' '}
					assigned{' '}
					<a className="font-medium text-gray-900" href={activity.assigned.href}>
						{activity.assigned.name}
					</a>{' '}
					<span className="whitespace-nowrap">{displayElapsedTime(activity.date)}</span>
				</div>
			</div>
		</>
	)
}

const ActivityTags: ActivityComponent<'tags'> = ({activity}) => {
	return (
	<>
			<div>
				<div className="relative px-1">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
						<TagIcon aria-hidden="true" className="h-5 w-5 text-gray-500" />
					</div>
				</div>
			</div>
			<div className="min-w-0 flex-1 py-0">
				<div className="text-sm leading-8 text-gray-500">
					<span className="mr-0.5">
						<a className="font-medium text-gray-900" href={activity.person.href}>
							{activity.person.name}
						</a>{' '}
						added tags
					</span>{' '}
					<span className="mr-0.5">
						{activity.tags.map((tag) => (
							<Fragment key={tag.name}>
								<a
									className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200"
									href={tag.href}
								>
									<svg
										aria-hidden="true"
										className={classNames(tag.color, 'h-1.5 w-1.5')}
										viewBox="0 0 6 6"
									>
										<circle cx={3} cy={3} r={3} />
									</svg>
									{tag.name}
								</a>{' '}
							</Fragment>
						))}
					</span>
					<span className="whitespace-nowrap">{displayElapsedTime(activity.date)}</span>
				</div>
			</div>
		</>
	)
}

const activityComponents: {[P in ActivityType]: ActivityComponent<P>} = {
	'comment': ActivityComment,
	'assignment': ActivityAssignment,
	'tags': ActivityTags
}

export const ActivityFeed: React.FunctionComponent<{value: Activity[]}> = ({value}) => {
	const sorted = value.sort((a, b) => a.date.getTime() - b.date.getTime());
	return (
		<div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((activityItem, activityItemIdx) => {
					const Component = activityComponents[activityItem.type] as ActivityComponent<ActivityType>;
          return <li key={activityItem.id}>
            <div className="relative pb-8">
              {activityItemIdx !== value.length - 1 ? (
                <span aria-hidden="true" className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <Component activity={activityItem}/>
              </div>
            </div>
          </li>
				})}
      </ul>
    </div>
	)
} 


export const FeedExample: React.FunctionComponent = () => {
  return (
    <ActivityFeed value={_activity}/>
  )
}
