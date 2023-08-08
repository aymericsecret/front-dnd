import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CSSProperties,
  HTMLAttributes,
  SetStateAction,
  forwardRef,
} from "react";
import { styled } from "styled-components";
import { Item } from "./types";
import { UniqueIdentifier } from "@dnd-kit/core";

const CardContainer = styled.div`
  height: 50px;
  border: 1px solid black;
  padding: 10px;
  background-color: white;
`;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  item: Item;
};
// eslint-disable-next-line react/display-name
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ item, ...props }: CardProps, ref) => {
    return (
      <CardContainer ref={ref} {...props}>
        {item?.name}
      </CardContainer>
    );
  }
);

export const SortableCard = ({
  id,
  item,
  disabled,
}: {
  key: UniqueIdentifier;
  id: UniqueIdentifier;
  item: Item;
  selection: UniqueIdentifier[];
  setSelection: (id: SetStateAction<UniqueIdentifier[]>) => void;
  disabled: boolean;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

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
