/* eslint-disable jsx-a11y/no-static-element-interactions -- ok*/
/* eslint-disable jsx-a11y/click-events-have-key-events -- ok*/
"use client";
import type { AllOrNothing } from "model/src/core/utils";
import { DropdownIcon, type DropdownItem, type ItemAction } from "./dropdown";
import { EllipsisHorizontalIcon } from "./icons";
import { classNames } from "model/src/utils";

interface CardDropdown {
  items: DropdownItem<string>[];
  onChange: ItemAction<string>;
}
export type CardProps = React.PropsWithChildren & {
  className?: string;
  label?: string | React.ReactNode;
  items?: DropdownItem<string>[];
  onClick?: () => void;
} & AllOrNothing<CardDropdown>;
export const Card: React.FunctionComponent<CardProps> = ({
  children,
  className,
  label,
  items,
  onChange,
  onClick,
}) => {
  const labelComponent: React.ReactNode =
    typeof label === "string" ? (
      <span className="text-sm font-medium">{label}</span>
    ) : (
      label
    );
  return (
    <div
      className={classNames(
        "bg-white border border-gray-200 rounded-xl shadow dark:bg-gray-800 dark:border-gray-700",
        onClick ? "hover:bg-gray-50 hover:cursor-pointer" : "",
        className,
      )}
      onMouseDown={onClick}
    >
      <div className="flex justify-between px-4 pt-4 sm:px-8 sm:pt-8 items-center">
        {labelComponent}
        {items ? (
          <DropdownIcon
            className="text-gray-500 dark:text-gray-400"
            icon={EllipsisHorizontalIcon}
            items={items}
            onChange={onChange}
          />
        ) : (
          <div />
        )}
      </div>
      <div className="p-4 sm:p-8 pt-4 sm:pt-4">{children}</div>
    </div>
  );
};
