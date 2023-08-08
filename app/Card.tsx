import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, forwardRef } from "react";
import { styled } from "styled-components";
import { Item } from "./types";
import { useDraggable } from "@dnd-kit/core";

const CardContainer = styled.div`
  height: 50px;
  border: 1px solid black;
  padding: 10px;
  background-color: white;
`;

// eslint-disable-next-line react/display-name
export const Card = forwardRef(({ item, ...props }: any, ref) => {
  return (
    <CardContainer id={item.id} {...props} ref={ref}>
      {item?.name}
    </CardContainer>
  );
});

export const DraggableCard = ({ item }: { item: Item }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: item.id,
  });

  return <Card ref={setNodeRef} item={item} {...listeners} {...attributes} />;
};

export const SortableCard = ({ disabled, item, ...props }: any) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Card
      item={item}
      ref={disabled ? undefined : setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};
