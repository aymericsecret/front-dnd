import { UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Item, Section } from "./types";
import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
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
    attributes,
    isDragging,
    listeners,
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
