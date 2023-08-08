import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, createContext, forwardRef } from "react";
import { styled } from "styled-components";
import { Item } from "./types";
import { DraggableSyntheticListeners, useDraggable } from "@dnd-kit/core";

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

// interface Context {
//   attributes: Record<string, any>;
//   listeners: DraggableSyntheticListeners;
//   ref(node: HTMLElement | null): void;
// }

// const SortableItemContext = createContext<Context>({
//   attributes: {},
//   listeners: undefined,
//   ref() {},
// });

export const SortableCard = ({ contact, ...props }: any) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  // const context = useMemo(
  //   () => ({
  //     attributes,
  //     listeners,
  //     ref: setActivatorNodeRef,
  //   }),
  //   [attributes, listeners, setActivatorNodeRef]
  // );
  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };

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
