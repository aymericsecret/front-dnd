import { Item } from "./types";
import { styled } from "styled-components";
import { HTMLAttributes, ReactNode, forwardRef } from "react";

type KanbanSectionProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  color: string;
  items: Item[];
  handleProps?: React.HTMLAttributes<any>;
  children: ReactNode;
};
// eslint-disable-next-line react/display-name
export const KanbanSection = forwardRef<HTMLDivElement, KanbanSectionProps>(
  (
    {
      title,
      color,
      items,
      children,
      handleProps,
      ...props
    }: KanbanSectionProps,
    forwardedRef
  ) => {
    return (
      <KanbanSectionContainer
        {...props}
        ref={forwardedRef}
        $isOver={false}
        $color={color}
      >
        <KanbanSectionTitle {...handleProps}>
          Title {title} - Totals {items.length}
        </KanbanSectionTitle>
        <KanbanSectionContent>{children}</KanbanSectionContent>
      </KanbanSectionContainer>
    );
  }
);

const KanbanSectionContainer = styled.div<{ $color: string; $isOver: boolean }>`
  display: flex;
  flex-wrap: nowrap;
  flex-shrink: 0;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 400px;
  border: 1px solid black;
  background-color: ${(props) =>
    props.$isOver ? `brightness(${props.$color})` : props.$color};
  overflow: hidden;
`;
const KanbanSectionTitle = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid black;
  padding: 10px;
`;

const KanbanSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  padding: 10px;

  gap: 10px;
  align-items: stretch;
  justify-content: flex-start;

  overflow-y: scroll;
`;
