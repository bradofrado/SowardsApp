/* eslint-disable jsx-a11y/no-static-element-interactions -- give me body*/
/* eslint-disable jsx-a11y/click-events-have-key-events -- we want body */
/* eslint-disable jsx-a11y/role-supports-aria-props -- we need aria-selected*/
import { type ParsedUrlQueryInput } from "node:querystring";
import React from "react";
import type { IconComponent } from "./icons";
import { NotifyLabel, type NotifyLabelProps } from "./notify-label";

export interface SidePanelItems {
  label: string;
  icon?: IconComponent;
  href:
    | { pathname: string; query?: undefined }
    | { query: ParsedUrlQueryInput; pathname?: undefined };
  notifyLabelItem?: NotifyLabelProps;
}
export type SidePanelProps = {
  className?: string;
  items: SidePanelItems[];
  onBodyClick?: () => void;
  path: string;
	title?: string;
	bottomContent?: React.ReactNode;
} & React.PropsWithChildren;
export const SidePanel: React.FunctionComponent<SidePanelProps> = ({
  className,
  items,
  children,
  onBodyClick,
  path,
	title,
	bottomContent
}) => {
  const queryToString = (query: ParsedUrlQueryInput): string => {
    return Object.entries(query)
      .map((values) => values.join("="))
      .join("&");
  };
  return (
    <div className="flex flex-1">
      <div
        className={`${
          className || ""
        } z-40 transition-transform sm:translate-x-0`}
      >
        <div className="flex flex-col justify-between h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
					<div>
						{title ? <a href="/">
							<div className="w-32 p-2">
								<img alt="Nexa Logo" className="w-full" src="/logo.png"/>
							</div>
						</a> : null}
						<ul className="space-y-2 font-medium">
							{items.map((item, i) => {
								const Icon = item.icon;
								const includesLink =
									item.href.pathname ?? queryToString(item.href.query);
								const selected = path.includes(includesLink);
								const link =
									item.href.pathname ??
									`${path.split("?")[0]}?${queryToString(item.href.query)}`;
								return (
									<li key={i}>
										<a
											aria-selected={selected}
											className="flex items-center px-4 py-2 text-gray-900 rounded-md dark:text-white hover:bg-primary-light dark:hover:bg-primary-light group aria-selected:font-bold aria-selected:bg-primary-light dark:aria-selected:bg-primary-light"
											href={link}
										>
											{Icon ? (
												<Icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-white group-aria-selected:text-primary dark:group-aria-selected:text-white" />
											) : null}
											<span className="ml-3 flex-1">{item.label}</span>
											{item.notifyLabelItem ? (
												<NotifyLabel {...item.notifyLabelItem} />
											) : null}
										</a>
									</li>
								);
							})}
						</ul>
					</div>
					{bottomContent ? <div>
						{bottomContent}
					</div> : null}
				</div>
      </div>

      <div
        className="dark:bg-gray-800 dark:text-white flex-1"
        onClick={onBodyClick}
      >
        {children}
      </div>
    </div>
  );
};
