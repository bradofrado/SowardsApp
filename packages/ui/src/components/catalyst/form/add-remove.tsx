/* eslint-disable jsx-a11y/no-static-element-interactions -- ok*/
/* eslint-disable jsx-a11y/click-events-have-key-events -- ok*/
"use client";

import { useState, useMemo, useEffect } from "react";
import { classNames } from "model/src/utils";
import type { DropdownItem } from "../../core/dropdown";
import { Dropdown } from "../../core/dropdown";
import { Button } from "../button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "../dialog";
import { DraggableListComponent } from "../../core/draggable-list";
import { useEffectEvent } from "../../../hooks/effect-event";
import { FormRow, FormDivider } from "./form";

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
  reorder?: boolean;
}
export const FormAddRemove = <T extends { id: string }>({
  label,
  description,
  items,
  onChange,
  dropdownItemsMap,
  getDefaultItem,
  componentLineItem: AddRemoveComponent,
  reorder = false,
}: FormAddRemoveProps<T>): JSX.Element => {
  const [showReorder, setShowReorder] = useState(false);
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

  const onReorder = (newItems: DropdownItem<string>[]): void => {
    const copy = newItems.map(
      (_item) => items.find((d) => d.id === _item.id) || items[0],
    );
    onChange(copy);
  };

  const dropdownItems = useMemo(
    () => items.map(dropdownItemsMap),
    [items, dropdownItemsMap],
  );

  return (
    <div>
      <FormRow description={description} label={label}>
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Dropdown
              className="w-full"
              initialValue={item?.id}
              items={dropdownItems}
              onChange={(_item) => {
                setSelectedItem(items.findIndex((d) => d.id === _item.id));
              }}
            />
            {reorder ? (
              <Button
                onClick={() => {
                  setShowReorder(true);
                }}
                type="button"
              >
                Reorder
              </Button>
            ) : null}
          </div>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                onRemoveItem(selectedItem);
              }}
              plain
              type="button"
            >
              Remove
            </Button>
            <Button onClick={onAddItem} type="button">
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
      {reorder ? (
        <ReorderItemsModal
          items={dropdownItems}
          onChange={onReorder}
          onClose={() => {
            setShowReorder(false);
          }}
          show={showReorder}
        />
      ) : null}
    </div>
  );
};

interface ReorderItemsModalProps<T> {
  show: boolean;
  onClose: () => void;
  items: T[];
  onChange: (items: T[]) => void;
}

const ReorderItemsModal = <T extends { id: string; name: React.ReactNode }>({
  show,
  onClose: onCloseProps,
  items: itemsProps,
  onChange,
}: ReorderItemsModalProps<T>): JSX.Element => {
  const [items, setItems] = useState(itemsProps);
  const [selectedItem, setSelectedItem] = useState<T>();

  useReorderByKeyboard({ items, onChange: setItems, selectedItem });

  const onSave = (): void => {
    onChange(items);
    onClose();
  };

  const onClose = (): void => {
    setItems(itemsProps);
    onCloseProps();
  };

  const onReorder = (newItems: T[]): void => {
    setItems(newItems);
  };

  const onClick = (item: T): void => {
    setSelectedItem(item);
  };
  return (
    <Dialog onClose={onClose} open={show}>
      <DialogTitle>Reorder Items</DialogTitle>
      <DialogDescription>
        Drag the items to put them in the correct order for exporting and
        viewing.
      </DialogDescription>
      <DialogBody>
        <DraggableListComponent
          id="form-reorder"
          items={items}
          onReorder={onReorder}
        >
          {(item) => (
            <div
              className={classNames(
                "p-4 hover:cursor-grab rounded-md w-full text-left",
                selectedItem?.id === item.id
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "hover:bg-gray-100 ",
              )}
              onClick={() => {
                onClick(item);
              }}
            >
              {item.name}
            </div>
          )}
        </DraggableListComponent>
      </DialogBody>
      <DialogActions>
        <Button onClick={onClose} plain>
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

interface ReorderByKeboardOptions<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  selectedItem: T | undefined;
}
const useReorderByKeyboard = <T extends { id: string }>({
  items,
  onChange,
  selectedItem,
}: ReorderByKeboardOptions<T>): void => {
  useEffect(() => {
    window.addEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, []);

  const onKeydown = useEffectEvent((event: KeyboardEvent): void => {
    if (!selectedItem) return;

    const copy = items.slice();
    if (event.key === "ArrowUp") {
      const index = items.findIndex((d) => d.id === selectedItem.id);
      if (index > 0) {
        copy.splice(index, 1);
        copy.splice(index - 1, 0, selectedItem);
      }
    } else if (event.key === "ArrowDown") {
      const index = items.findIndex((d) => d.id === selectedItem.id);
      if (index < items.length - 1) {
        copy.splice(index, 1);
        copy.splice(index + 1, 0, selectedItem);
      }
    }
    onChange(copy);
  });
};
