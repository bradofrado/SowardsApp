"use client";

import { useState, useMemo } from "react";
import { Dropdown, DropdownItem } from "../../core/dropdown";
import { FormRow, FormDivider } from "./form";
import { Button } from "../button";

export type AddRemoveComponent<T> = React.FunctionComponent<{
  value: T;
  onChange: (value: T) => void;
}>;

interface FormAddRemoveProps<T> {
  label: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  dropdownItemsMap: (item: T) => DropdownItem<string>;
  getDefaultItem: (items: T[]) => T;
  componentLineItem: AddRemoveComponent<T>;
}
export const FormAddRemove = <T extends { id: string }>({
  label,
  description,
  items,
  onChange,
  dropdownItemsMap,
  getDefaultItem,
  componentLineItem: AddRemoveComponent,
}: FormAddRemoveProps<T>): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<number>(0);
  const item: T | undefined = useMemo(
    () => items[selectedItem] as T | undefined,
    [items, selectedItem],
  );

  const onItemChange = (value: T, index: number): void => {
    const copy = items.slice();
    copy[index] = value;
    onChange(copy);
  };

  const onAddItem = (): void => {
    const copy = items.slice();
    copy.push(getDefaultItem(copy));
    onChange(copy);
    setSelectedItem(copy.length - 1);
  };

  const onRemoveItem = (index: number): void => {
    const copy = items.slice();
    copy.splice(index, 1);
    onChange(copy);
    setSelectedItem(0);
  };

  return (
    <div>
      <FormRow label={label} description={description}>
        <div className="flex gap-4 items-center justify-between">
          <Dropdown
            className="w-full"
            items={items.map(dropdownItemsMap)}
            initialValue={item?.id}
            onChange={(_item) => {
              setSelectedItem(items.findIndex((d) => d.id === _item.id));
            }}
          />
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              plain
              onClick={() => {
                onRemoveItem(selectedItem);
              }}
            >
              Remove
            </Button>
            <Button type="button" onClick={onAddItem}>
              New
            </Button>
          </div>
        </div>
      </FormRow>

      <FormDivider />

      {item ? (
        <AddRemoveComponent
          onChange={(value) => {
            onItemChange(value, selectedItem);
          }}
          value={item}
        />
      ) : null}
    </div>
  );
};
