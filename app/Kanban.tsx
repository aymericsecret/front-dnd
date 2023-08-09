import { styled } from "styled-components";
import {
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
import { useCallback, useMemo, useState } from "react";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { findSectionContainer } from "./utils";
import { Item, Section, SectionList } from "./types";
import { KanbanSection } from "./KanbanSection";
import { Card, SortableCard } from "./Card";
import { sectionsData } from "./constants/data";
import { DroppableKanbanSection } from "./DroppableKanbanSection";
import { createPortal } from "react-dom";
import { SmartPointerSensor } from "./utils/SmartPointerSensor";

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: auto;
`;

export const Kanban = () => {
  const [sections, setSections] = useState<SectionList>(sectionsData);
  const [clonedSections, setClonedSections] = useState<SectionList | null>(
    null
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [containers, setContainers] = useState(
    Object.keys(sections) as UniqueIdentifier[]
  );
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  const activeItem = useMemo(() => {
    if (!activeId) {
      return;
    }
    const sectionKey = Object.values(sections).find(
      (section) => section.id === activeId
    );
    const itemKey = Object.values(sections)
      .map((section) => section.items)
      .flat()
      .find((item) => item.id === activeId);
    return sectionKey ?? itemKey;
  }, [activeId, sections]);

  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
    setClonedSections(sections);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    const overId = over?.id;
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

    setActiveId(null);
  };

  const [selected, setSelection] = useState<UniqueIdentifier[]>([]);
  const onToggleCard = useCallback(
    (itemId: UniqueIdentifier) => {
      setSelection((prevSelected) =>
        selected.includes(itemId)
          ? prevSelected.filter((i) => i !== itemId)
          : [...prevSelected, itemId].filter((i) => i !== undefined)
      );
    },
    [selected]
  );

  return (
    <Wrapper>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          if (clonedSections) {
            setSections(clonedSections);
          }
          setActiveId(null);
          setClonedSections(null);
        }}
      >
        <SortableContext
          items={containers}
          strategy={horizontalListSortingStrategy}
        >
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
                strategy={rectSortingStrategy}
              >
                {sections[containerId].items.map((item) => (
                  <SortableCard
                    key={item.id}
                    id={item.id}
                    disabled={isSortingContainer}
                    item={item}
                    checked={selected.includes(item.id)}
                    onToggle={onToggleCard}
                  />
                ))}
              </SortableContext>
            </DroppableKanbanSection>
          ))}
        </SortableContext>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId
              ? containers.includes(activeId)
                ? renderContainerDragOverlay(activeItem as Section)
                : renderSortableItemDragOverlay(activeItem as Item)
              : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </Wrapper>
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
  return <Card key="overlayItem" checked item={activeItem} />;
}

function renderContainerDragOverlay(section: Section) {
  return (
    <KanbanSection title={section.id} items={section.items} color="#C9DDF2">
      {section.items.map((item, index) => (
        <Card key={index} checked item={item} />
      ))}
    </KanbanSection>
  );
}
