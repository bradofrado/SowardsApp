import type { Replace, ReplaceWithName } from "model/src/core/utils";
import React, { useEffect, useState } from "react";
import {
  Draggable,
  DragDropContext,
  Droppable,
  type DroppableProps,
  type DraggableProps,
  type DropResult,
} from "react-beautiful-dnd";
import { PolymorphicComponentProps } from "../../types/polymorphics";

export const DroppableComponent = <C extends React.ElementType>({
  children,
  className,
  as,
  ...props
}: PolymorphicComponentProps<
  C,
  Replace<DroppableProps, "children", React.ReactNode> & {
    className?: string;
  }
>) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setEnabled(true);
    });

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  const Component = as || "div";

  return (
    <Droppable {...props}>
      {(provided) => (
        <Component
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={className}
        >
          {children}
          {provided.placeholder}
        </Component>
      )}
    </Droppable>
  );
};

type DraggableComponentProps<C extends React.ElementType> =
  PolymorphicComponentProps<
    C,
    ReplaceWithName<
      Replace<DraggableProps, "children", React.ReactNode>,
      "draggableId",
      { id: string }
    >
  >;
export const DraggableComponent = <C extends React.ElementType>({
  children,
  id,
  as,
  ...rest
}: DraggableComponentProps<C>) => {
  const Component = as || "div";
  return (
    <Draggable draggableId={`${id}`} key={id} {...rest}>
      {(provided) => (
        <Component
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {children}
        </Component>
      )}
    </Draggable>
  );
};

interface DroppableContextProps<T> {
  onReorder: (items: T[]) => void;
  id: string;
  children: React.ReactNode;
  items: T[];
  className?: string;
}
export const DroppableContext = <C extends React.ElementType, T>({
  onReorder,
  id,
  children,
  items,
  className,
  ...rest
}: PolymorphicComponentProps<C, DroppableContextProps<T>>) => {
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const copy = [...items];
    const [orderedTodo] = copy.splice(result.source.index, 1);
    if (!orderedTodo) throw new Error("No ordered :(");
    copy.splice(result.destination.index, 0, orderedTodo);
    onReorder(copy);
  };
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <DroppableComponent
        {...(rest as PolymorphicComponentProps<
          C,
          Replace<DroppableProps, "children", React.ReactNode> & {
            className?: string;
          }
        >)}
        className={className}
        droppableId={id}
      >
        {children}
      </DroppableComponent>
    </DragDropContext>
  );
};

type DraggableListComponentProps<T> = Replace<
  DroppableContextProps<T>,
  "children",
  (item: T, index: number) => React.ReactNode
> & {
  itemAs?: React.ElementType;
};
export const DraggableListComponent = <
  T extends { id: number } | string,
  C extends React.ElementType,
>({
  children,
  items,
  itemAs,
  ...rest
}: PolymorphicComponentProps<C, DraggableListComponentProps<T>>) => {
  const getId = (item: T): string => {
    if (typeof item === "string") {
      return item;
    }

    return `${item.id}`;
  };

  return (
    <DroppableContext
      {...(rest as PolymorphicComponentProps<C, DroppableContextProps<T>>)}
      items={items}
    >
      {items.map((item, i) => (
        <DraggableComponent
          id={getId(item)}
          index={i}
          key={getId(item)}
          as={itemAs}
        >
          {children(item, i)}
        </DraggableComponent>
      ))}
    </DroppableContext>
  );
};
