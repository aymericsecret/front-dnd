import { styled } from "styled-components";
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { findSectionContainer } from "./utils";
import { Section } from "./types";
import { KanbanSection } from "./KanbanSection";
import { Card } from "./Card";
import { originalItemsOrdered } from "./constants/data";

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: auto;
`;

export const Kanban = () => {
  const [sections, setSections] = useState<Section>(originalItemsOrdered);
  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(
    () =>
      Object.values(sections)
        .flat()
        .find((item) => item.id === active?.id),
    [active, sections]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    console.log("handleDragOver", event);
    const { active, over } = event;

    // Find the containers
    const activeContainer = findSectionContainer(sections, active.id as string);
    const overContainer = findSectionContainer(sections, over?.id as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setSections((sections) => {
      const activeItems = sections[activeContainer];
      const overItems = sections[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id !== over?.id);

      return {
        ...sections,
        [activeContainer]: [
          ...sections[activeContainer].filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...sections[overContainer].slice(0, overIndex),
          sections[activeContainer][activeIndex],
          ...sections[overContainer].slice(
            overIndex,
            sections[overContainer].length
          ),
        ],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findSectionContainer(sections, active.id as string);
    const overContainer = findSectionContainer(sections, over?.id as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = sections[activeContainer].findIndex(
      (task) => task.id === active.id
    );
    const overIndex = sections[overContainer].findIndex(
      (task) => task.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setSections((boardSection) => ({
        ...boardSection,
        [overContainer]: arrayMove(
          boardSection[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    setActive(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActive(event.active);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <Wrapper>
        {Object.keys(sections).map((sectionKey) => (
          <KanbanSection
            key={sectionKey}
            id={sectionKey}
            title="1"
            color="#C9DDFF"
            contacts={sections[sectionKey]}
          />
        ))}
        <DragOverlay
          dropAnimation={{
            duration: 500,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {active ? <Card key="overlayItem" contact={activeItem} /> : null}
        </DragOverlay>
      </Wrapper>
    </DndContext>
  );
};
