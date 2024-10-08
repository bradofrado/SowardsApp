"use client";
import React, { useEffect, useState, type PropsWithChildren } from "react";
import type { AllOrNothing } from "model/src/core/utils";
import { Button } from "./button";
import { ChevronDownIcon, type IconComponent } from "./icons";
import { CheckboxInput } from "./input";
import { Popover } from "./popover";
import clsx from "clsx";

export type ListBoxPopoverProps<T> = {
  items: DropdownItem<T>[];
  className?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
} & AllOrNothing<{ isOpen: boolean; setIsOpen: (value: boolean) => void }>;
export const ListBoxPopover = <T,>({
  items,
  className = "",
  header,
  children,
  ...isOpenStuff
}: ListBoxPopoverProps<T>): JSX.Element => {
  return (
    <Popover
      button={children}
      className={clsx(className, "max-h-[200px]")}
      {...isOpenStuff}
    >
      {header ? <div className="p-2 bg-gray-50">{header}</div> : null}
      <div className="min-w-[11rem]">
        <ul
          aria-labelledby="dropdownDefaultButton"
          className="text-sm text-gray-700 dark:text-gray-200"
        >
          {items.map((item, i) => (
            <li key={i}>{item.name}</li>
          ))}
        </ul>
      </div>
    </Popover>
  );
};

export type ListBoxProps<T> = ListBoxPopoverProps<T> & {
  mode?: "primary" | "secondary";
};
export const ListBox = <T,>({
  items,
  className,
  children,
  mode,
  header,
  ...isOpenStuff
}: ListBoxProps<T>): JSX.Element => {
  const button = (
    <Button type="button" className={className} mode={mode}>
      <div className="flex items-center w-full px-1 py-1">{children}</div>
    </Button>
  );
  return (
    <ListBoxPopover header={header} items={items} {...isOpenStuff}>
      {button}
    </ListBoxPopover>
  );
};

export interface DropdownItem<T> {
  name: React.ReactNode;
  id: T;
}
export type ItemAction<T> = (item: DropdownItem<T>, index: number) => void;
interface DropdownProps<T> extends PropsWithChildren {
  items: DropdownItem<T>[];
  initialValue?: T;
  className?: string;
  chevron?: boolean;
  onChange?: ItemAction<T>;
  forceChildren?: boolean;
}

export const Dropdown = <T,>({
  children,
  initialValue,
  onChange,
  items,
  chevron = true,
  className,
  forceChildren = false,
}: DropdownProps<T>): JSX.Element => {
  const [value, setValue] = useState<DropdownItem<T> | undefined>(
    items.find((x) => x.id === initialValue),
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setValue(items.find((x) => x.id === initialValue));
  }, [initialValue, items]);

  const onClick = (item: DropdownItem<T>, index: number): void => {
    setValue(item);
    onChange && onChange(item, index);
    setIsOpen(false);
  };

  const dropdownItems: DropdownItem<T>[] = items.map((item, i) => ({
    ...item,
    name: (
      <DropdownLineItem
        onClick={() => {
          onClick(item, i);
        }}
        selected={initialValue !== undefined && item === value}
      >
        {item.name}
      </DropdownLineItem>
    ),
  }));

  return (
    <ListBox
      className={className}
      isOpen={isOpen}
      items={dropdownItems}
      mode={value === undefined ? "secondary" : "secondary"}
      setIsOpen={setIsOpen}
    >
      <div className="flex w-full justify-between items-center">
        {value === undefined || forceChildren ? children : value.name}{" "}
        {chevron ? <ChevronDownIcon className="w-4 h-4 ml-1" /> : null}
      </div>
    </ListBox>
  );
};

export interface DropdownLineItemProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
export const DropdownLineItem: React.FunctionComponent<
  DropdownLineItemProps
> = ({ selected, onClick, children }) => {
  return (
    <button
      className={`${
        selected ? "bg-primary-light" : "text-gray-900"
      } group flex w-full items-center rounded-md p-2 text-sm cursor-pointer hover:bg-gray-100 [&>*]:flex-1`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};

export interface ListItem {
  label: React.ReactNode;
  value: boolean;
}

type ListItemProps<T> = (
  | Omit<DropdownIconProps<T>, "items">
  | Omit<DropdownProps<T>, "items">
) & {
  items: ListItem[];
  setItems: (items: ListItem[]) => void;
};

export const DropdownList = <T,>({
  items,
  setItems,
  ...rest
}: ListItemProps<T>): JSX.Element => {
  const copy = items.slice();
  const onSelect = (item: ListItem): void => {
    item.value = !item.value;
    setItems(copy);
  };
  const dropdownItems = copy.map((item) => ({
    name: <DropdownListItem item={item} />,
    id: undefined,
  }));
  return "icon" in rest ? (
    <DropdownIcon
      items={dropdownItems}
      {...rest}
      onChange={(item, index) => {
        onSelect(items[index]);
      }}
    />
  ) : (
    <Dropdown
      items={dropdownItems}
      {...rest}
      onChange={(item, index) => {
        onSelect(items[index]);
      }}
    />
  );
};

export interface DropdownListItemProps {
  item: ListItem;
}
export const DropdownListItem: React.FunctionComponent<
  DropdownListItemProps
> = ({ item }) => {
  return (
    <span className="flex items-center text-sm font-medium">
      <CheckboxInput className="mr-1" value={item.value} />
      {item.label}
    </span>
  );
};

type DropdownIconProps<T> = Omit<DropdownProps<T>, "chevron"> & {
  icon: IconComponent;
};
export const DropdownIcon = <T,>({
  icon,
  className,
  ...rest
}: DropdownIconProps<T>): JSX.Element => {
  const Icon = icon;
  return (
    <Dropdown
      className={`hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5 ${
        className || ""
      }`}
      {...rest}
      chevron={false}
      forceChildren
    >
      <Icon className="h-5 w-5" />
    </Dropdown>
  );
};
