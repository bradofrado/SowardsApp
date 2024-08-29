import { DropdownIcon, DropdownItem } from "./dropdown";
import { EllipsisHorizontalIcon } from "./icons";
import { Button } from "../catalyst/button";
import { classNames } from "model/src/utils";

const statuses = {
  Complete: "text-green-700 bg-green-50 ring-green-600/20",
  "In progress": "text-gray-600 bg-gray-50 ring-gray-500/10",
  Archived: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
};
export type Status = keyof typeof statuses;
export interface Project {
  id: number;
  title: string;
  subtitle: React.ReactNode;
  onButtonClick?: () => void;
  buttonText?: string;
  status: Status;
}

interface ProjectListProps {
  items: Project[];
  dropdownItems?: DropdownItem<string>[];
  onDropdownChange?: (item: DropdownItem<string>) => void;
}
export const ProjectList: React.FunctionComponent<ProjectListProps> = ({
  items,
  dropdownItems,
  onDropdownChange,
}) => {
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((project) => (
        <li
          key={project.id}
          className="flex items-center justify-between gap-x-6 py-5"
        >
          <div className="min-w-0">
            <div className="flex items-start gap-x-3">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {project.title}
              </p>
              <p
                className={classNames(
                  statuses[project.status],
                  "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                )}
              >
                {project.status}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
              {project.subtitle}
            </div>
          </div>
          <div className="flex flex-none items-center gap-x-4">
            {project.buttonText ? (
              <Button onClick={project.onButtonClick} plain>
                {project.buttonText}
                <span className="sr-only">, {project.title}</span>
              </Button>
            ) : null}
            {dropdownItems ? (
              <DropdownIcon
                icon={EllipsisHorizontalIcon}
                items={dropdownItems}
                onChange={onDropdownChange}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
};

export const DateCreatorSubTitle: React.FunctionComponent<{
  date: string;
  dateTime: string;
  createdBy: string;
}> = ({ date, dateTime, createdBy }) => {
  return (
    <>
      <p className="whitespace-nowrap">
        Due on <time dateTime={dateTime}>{date}</time>
      </p>
      <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
        <circle r={1} cx={1} cy={1} />
      </svg>
      <p className="truncate">Created by {createdBy}</p>
    </>
  );
};

export const projects: Project[] = [
  {
    id: 1,
    title: "GraphQL API",
    status: "Complete",
    subtitle: (
      <DateCreatorSubTitle
        date="March 17, 2023"
        dateTime="2023-03-17T00:00Z"
        createdBy="Leslie Alexander"
      />
    ),
  },
  {
    id: 2,
    title: "New benefits plan",
    status: "In progress",
    subtitle: (
      <DateCreatorSubTitle
        date="May 5, 2023"
        dateTime="2023-05-05T00:00Z"
        createdBy="Leslie Alexander"
      />
    ),
  },
  {
    id: 3,
    title: "Onboarding emails",
    status: "In progress",
    subtitle: (
      <DateCreatorSubTitle
        date="May 25, 2023"
        dateTime="2023-05-25T00:00Z"
        createdBy="Courtney Henry"
      />
    ),
  },
  {
    id: 4,
    title: "iOS app",
    status: "In progress",
    subtitle: (
      <DateCreatorSubTitle
        date="June 7, 2023"
        dateTime="2023-06-07T00:00Z"
        createdBy="Leonard Krasner"
      />
    ),
  },
  {
    id: 5,
    title: "Marketing site redesign",
    status: "Archived",
    subtitle: (
      <DateCreatorSubTitle
        date="June 10, 2023"
        dateTime="2023-06-10T00:00Z"
        createdBy="Floyd Miles"
      />
    ),
  },
];
