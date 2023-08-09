import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, HTMLAttributes, forwardRef } from "react";
import { styled } from "styled-components";
import { Item } from "./types";
import { UniqueIdentifier } from "@dnd-kit/core";

const CardContainer = styled.div`
  height: 50px;
  border: 1px solid black;
  padding: 10px;
  background-color: white;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  item: Item;
  onToggle?: (id: UniqueIdentifier) => void;
  checked: boolean;
};
// eslint-disable-next-line react/display-name
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ item, onToggle, checked, ...props }: CardProps, ref) => {
    return (
      <CardContainer tabIndex={onToggle ? 0 : undefined} ref={ref} {...props}>
        <Checkbox
          type="checkbox"
          checked={checked}
          onChange={() => onToggle?.(item.id)}
        />
        {item?.name}
      </CardContainer>
    );
  }
);

export const SortableCard = ({
  id,
  item,
  onToggle,
  disabled,
  checked,
}: {
  key: UniqueIdentifier;
  id: UniqueIdentifier;
  item: Item;
  onToggle?: (id: UniqueIdentifier) => void;
  disabled: boolean;
  checked: boolean;
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
      onToggle={onToggle}
      checked={checked}
      {...attributes}
      {...listeners}
    />
  );
};
