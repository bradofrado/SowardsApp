import { useState } from "react";
import { DragOverlay, type UniqueIdentifier } from "@dnd-kit/core";
import type { HexColor } from "model/src/core/colors";
import { Header } from "../../core/header";
import type { SortableContainerItem } from "../../core/sortable-container";
import {
  SortableContainer,
  SortableContainerContext,
} from "../../core/sortable-container";
import { ToggleButton } from "../../core/toggle-button";
import { PieChart } from "./graphs/pie-chart";
import { ProgressBarMultiValue } from "./graphs/progressbar-multivalue";
import type { GraphComponent, GraphValue } from "./graphs/types";

export interface StatusLane {
  id: UniqueIdentifier;
  fill: HexColor;
  label: string;
}
export type StatusLaneItem = SortableContainerItem & {
  amount: number;
};
export interface StatusLaneContainerProps<T extends StatusLaneItem> {
  items: T[];
  setItems: React.Dispatch<(prevState: T[]) => T[]>;
  columns: StatusLane[];
  columnsToIncludeInProgressBar?: UniqueIdentifier[];
  children: (item: T, isDragging: boolean) => React.ReactNode;
}
export const StatusLaneContainer = <T extends StatusLaneItem>({
  items,
  setItems,
  columns,
  columnsToIncludeInProgressBar,
  children,
}: StatusLaneContainerProps<T>): JSX.Element => {
  const [graph, setGraph] = useState<GraphComponent>(
    () => ProgressBarMultiValue,
  );
  const Graph = graph;

  const getItemAmount = (
    _items: T[],
    columnIdFilter?: UniqueIdentifier,
  ): number => {
    const filtered =
      columnIdFilter !== undefined
        ? _items.filter((item) => item.columnId === columnIdFilter)
        : _items;

    return filtered.reduce((prev, curr) => prev + curr.amount, 0);
  };

  const totalValue = getItemAmount(items);
  const values: GraphValue[] = columns
    .filter((column) =>
      columnsToIncludeInProgressBar
        ? columnsToIncludeInProgressBar.includes(column.id)
        : true,
    )
    .map((column) => ({
      fill: column.fill,
      value: getItemAmount(items, column.id),
    }));

  return (
    <SortableContainerContext items={items} setItems={setItems}>
      {({ activeItem, items: sortItems }) => (
        <div className="mt-5 flex flex-col gap-4">
          <Graph total={totalValue} values={values} />
          <div className="mt-5 flex gap-4">
            {columns.map((column, i) => (
              <StatusLane
                key={i}
                {...column}
                items={sortItems.filter((item) => item.columnId === column.id)}
              >
                {children}
              </StatusLane>
            ))}
            <DragOverlay>
              {activeItem ? children(activeItem, false) : null}
            </DragOverlay>
          </div>
          <ToggleButton
            buttons={[
              { id: ProgressBarMultiValue, label: "Progress Bar" },
              { id: PieChart, label: "Pie" },
            ]}
            selected={Graph}
            setSelected={(selected) => {
              setGraph(() => selected);
            }}
          />
        </div>
      )}
    </SortableContainerContext>
  );
};

export interface StatusLaneProps<T extends SortableContainerItem> {
  id: UniqueIdentifier;
  label: string;
  fill: HexColor;
  items: T[];
  children: (item: T, isDragging: boolean) => React.ReactNode;
}
export const StatusLane = <T extends SortableContainerItem>({
  id,
  label,
  fill,
  items,
  children,
}: StatusLaneProps<T>): JSX.Element => {
  return (
    <div className="flex flex-col gap-2 w-full min-h-[500px]">
      <div className="h-[6px] rounded-lg" style={{ backgroundColor: fill }} />
      <Header level={3}>{label}</Header>
      <div className="flex flex-col gap-2 h-full">
        <SortableContainer id={id} items={items}>
          {(item) => (isDragging) => children(item, isDragging)}
        </SortableContainer>
      </div>
    </div>
  );
};
