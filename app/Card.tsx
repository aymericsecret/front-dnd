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
export const Card = forwardRef(({ contact, ...props }: any, ref) => {
  return (
    <CardContainer id={contact.id} {...props} ref={ref}>
      {contact?.name}
    </CardContainer>
  );
});

export const DraggableCard = ({ contact }: { contact: Item }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: contact.id,
  });

  return (
    <Card ref={setNodeRef} contact={contact} {...listeners} {...attributes} />
  );
};

export const SortableCard = ({ contact, ...props }: any) => {
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
      contact={contact}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};
