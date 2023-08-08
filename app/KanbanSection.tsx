import { useDroppable } from "@dnd-kit/core";
import { Item } from "./types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./Card";
import { styled } from "styled-components";

export const KanbanSection = ({
  id,
  title,
  color,
  contacts,
}: {
  id: string;
  title: string;
  color: string;
  contacts: Item[];
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  return (
    <KanbanSectionContainer ref={setNodeRef} $isOver={isOver} $color={color}>
      <KanbanSectionTitle>
        Title {title} - Totals {contacts.length}
      </KanbanSectionTitle>
      <KanbanSectionContent>
        <SortableContext
          items={contacts}
          strategy={verticalListSortingStrategy}
        >
          {contacts.map((contact) => (
            // <DraggableCard key={contact.id} contact={contact} />
            <SortableCard key={contact.id} id={contact.id} contact={contact} />
          ))}
        </SortableContext>
        {/* <DragOverlay
          dropAnimation={{
            duration: 500,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {active ? <Cards key="overlayItem" contact={active} /> : null}
        </DragOverlay> */}
      </KanbanSectionContent>
    </KanbanSectionContainer>
  );
};

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
