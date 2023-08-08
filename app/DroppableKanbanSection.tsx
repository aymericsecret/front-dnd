import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Item, Section } from "./types";
import {
  AnimateLayoutChanges,
  SortableContext,
  defaultAnimateLayoutChanges,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./Card";
import { styled } from "styled-components";
import { KanbanSection } from "./KanbanSection";
import { ReactNode } from "react";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export const DroppableKanbanSection = ({
  id,
  items,
  children,
  style,
  ...props
}: {
  id: UniqueIdentifier;
  title: string;
  color: string;
  items: Item[];
  children: ReactNode;
  style?: React.CSSProperties;
}) => {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  // const isOverContainer = over
  //   ? (id === over.id && active?.data.current?.type !== "container") ||
  //     items[id].map((item) => item.id).includes(over.id as string)
  //   : false;

  return (
    <KanbanSection
      ref={setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      items={items}
      {...props}
    >
      {children}
    </KanbanSection>
  );
};
