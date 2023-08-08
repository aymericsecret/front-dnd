import { styled } from "styled-components";
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { findSectionContainer } from "./utils";
import { Item, Section, SectionList } from "./types";
import { KanbanSection } from "./KanbanSection";
import { Card, SortableCard } from "./Card";
import { originalItemsOrdered, sectionsData } from "./constants/data";
import { DroppableKanbanSection } from "./DroppableKanbanSection";
import { createPortal } from "react-dom";

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: auto;
`;

export const Kanban = () => {
  const [sections, setSections] = useState<SectionList>(sectionsData);
  const [active, setActive] = useState<Active | null>(null);
  const [containers, setContainers] = useState(
    Object.keys(sections) as UniqueIdentifier[]
  );
  const isSortingContainer = active?.id
    ? containers.includes(active?.id)
    : false;

  const activeItem = useMemo(() => {
    if (!active) {
      return;
    }
    const sectionKey = Object.values(sections).find(
      (section) => section.id === active.id
    );
    // console.log(
    //   "sections",
    //   sections,
    //   Object.values(sections)
    //     .map((section) => section.items)
    //     .flat()
    // );
    const itemKey = Object.values(sections)
      .map((section) => section.items)
      .flat()
      .find((item) => item.id === active?.id);
    return sectionKey ?? itemKey;
  }, [active, sections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    const overId = over?.id;
    console.log("ondragover", active.id, sections);
    if (overId == null || active.id in sections) {
      return;
    }

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
    console.log("handleDragOver", { event, activeContainer, overContainer });

    setSections((prevSections) => {
      const activeItems = prevSections[activeContainer];
      const overItems = prevSections[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.items.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.items.findIndex(
        (item) => item.id !== over?.id
      );

      console.log("setSection", { activeIndex, overIndex });
      return {
        ...prevSections,
        [activeContainer]: {
          ...prevSections[activeContainer],
          items: [
            ...prevSections[activeContainer].items.filter(
              (item) => item.id !== active.id
            ),
          ],
        },
        [overContainer]: {
          ...prevSections[overContainer],
          items: [
            ...prevSections[overContainer].items.slice(0, overIndex),
            prevSections[activeContainer].items[activeIndex],
            ...prevSections[overContainer].items.slice(
              overIndex,
              prevSections[overContainer].items.length
            ),
          ],
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id in sections && over?.id) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }

    const activeContainer = findSectionContainer(sections, active.id as string);
    const overContainer = findSectionContainer(sections, over?.id as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = sections[activeContainer].items.findIndex(
      (task) => task.id === active.id
    );
    const overIndex = sections[overContainer].items.findIndex(
      (task) => task.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setSections((prevSections) => ({
        ...prevSections,
        [overContainer]: {
          ...prevSections[overContainer],
          items: arrayMove(
            prevSections[overContainer].items,
            activeIndex,
            overIndex
          ),
        },
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
        {containers.map((containerId) => (
          <DroppableKanbanSection
            key={containerId}
            id={containerId}
            title={sections[containerId].name}
            color="#C9DDFF"
            items={sections[containerId].items}
          >
            <SortableContext
              items={sections[containerId].items}
              strategy={verticalListSortingStrategy}
            >
              {sections[containerId].items.map((item) => (
                <SortableCard
                  key={item.id}
                  id={item.id}
                  disabled={isSortingContainer}
                  item={item}
                />
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
          </DroppableKanbanSection>
        ))}

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeItem
              ? Object.keys(sections).includes(activeItem.id)
                ? renderContainerDragOverlay(activeItem as Section)
                : renderSortableItemDragOverlay(activeItem as Item)
              : null}
          </DragOverlay>,
          document.body
        )}

        {/* <DragOverlay
          dropAnimation={{
            duration: 500,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {active ? <Card key="overlayItem" contact={activeItem} /> : null}
        </DragOverlay> */}
      </Wrapper>
    </DndContext>
  );
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function renderSortableItemDragOverlay(activeItem: Item) {
  return <Card key="overlayItem" item={activeItem} />;
}

function renderContainerDragOverlay(section: Section) {
  return (
    <KanbanSection title={section.id} items={section.items} color="#C9DDF2">
      {section.items.map((item, index) => (
        <Card key={index} item={item} />
      ))}
    </KanbanSection>
  );
}
