import { styled } from "styled-components";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
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
  const [selected, setSelection] = useState<UniqueIdentifier[]>([]);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  const activeDraggedItems = useMemo(() => {
    if (!activeId) {
      return;
    }
    const sectionKey = Object.values(sections).find(
      (section) => section.id === activeId
    );
    const itemsList = Object.values(sections)
      .map((section) => section.items)
      .flat();
    const itemKeys = [
      itemsList.find((item) => item.id === activeId),
      ...selected.filter((itemId) =>
        itemsList.find((item) => item.id === itemId && item.id !== activeId)
      ),
    ];
    return sectionKey ?? itemKeys;
  }, [activeId, sections, selected]);

  const sensors = useSensors(
    useSensor(SmartPointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const initialContainer = useMemo(
    () => (activeId ? findSectionContainer(sections, activeId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId]
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setSelection((selected) => (selected.includes(active.id) ? selected : []));
    setActiveId(active.id);
    setClonedSections(sections);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    setSelection((selected) => (selected.includes(active.id) ? selected : []));
    setActiveId(active.id);
    setClonedSections(sections);

    const overId = over?.id;
    if (!overId || active.id in sections) {
      return;
    }

    // Find the containers
    const activeContainer = findSectionContainer(sections, active.id);
    const overContainer = findSectionContainer(sections, overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setSections((prevSections) => {
      const activeItems = prevSections[activeContainer].items;
      const overItems = prevSections[overContainer].items;

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id !== over?.id);

      let newIndex: number;

      if (overId in prevSections) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

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
            ...overItems.slice(0, newIndex),
            activeItems[activeIndex],
            ...overItems.slice(newIndex, overItems.length),
          ],
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id;
    if (active.id in sections && overId) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(overId);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }

    const activeContainer = findSectionContainer(sections, active.id);

    if (!activeContainer || !overId || !initialContainer) {
      setActiveId(null);
      setSelection([]);
      return;
    }
    const overContainer = findSectionContainer(sections, overId);

    // const activeIndex = sections[activeContainer].items.findIndex(
    //   (task) => task.id === active.id
    // );
    // const overIndex = sections[overContainer].items.findIndex(
    //   (task) => task.id === overId
    // );
    if (overContainer) {
      const overItems = filterItems(sections[overContainer].items);
      const overIndex = overItems.findIndex((item) => item.id === overId);
      const activeIndex = overItems.findIndex((item) => item.id === active.id);
      const newItems = arrayMove(overItems, activeIndex, overIndex);
      const newActiveIndex = newItems.findIndex(
        (item) => item.id === active.id
      );

      const movingItemIds = selected.length
        ? [active.id, ...selected.filter((id) => id !== active.id)]
        : [active.id];

      setSections((prevSections) => ({
        ...prevSections,
        [initialContainer]: {
          ...prevSections[initialContainer],
          items: prevSections[initialContainer].items.filter(
            (item) => !movingItemIds.includes(item.id)
          ),
        },
        [activeContainer]: {
          ...prevSections[activeContainer],
          items: prevSections[activeContainer].items.filter(
            (item) => !movingItemIds.includes(item.id)
          ),
        }, // Not sure if we should keep this
        [overContainer]: {
          ...prevSections[overContainer],
          items: [
            ...newItems.slice(0, newActiveIndex + 1),
            ...prevSections[initialContainer].items.filter(
              (item) => movingItemIds.includes(item.id) && item.id !== active.id
            ),
            ...newItems.slice(newActiveIndex + 1, newItems.length),
          ],
        },
      }));
    }

    setActiveId(null);
  };

  function filterItems(items: Item[]) {
    if (!activeId) {
      return items;
    }

    return items.filter(
      (item) => item.id === activeId || !selected.includes(item.id)
    );
  }

  const onToggleCard = useCallback(
    (itemId: UniqueIdentifier) => {
      setSelection((prevSelected) => {
        if (
          !selected.length ||
          findSectionContainer(sections, itemId) !==
            findSectionContainer(sections, selected[0])
        ) {
          return [itemId];
        }

        return selected.includes(itemId)
          ? prevSelected.filter((i) => i !== itemId)
          : [...prevSelected, itemId].filter((i) => i !== undefined);
      });
    },
    [sections, selected]
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
                items={filterItems(sections[containerId].items)}
                strategy={rectSortingStrategy}
              >
                {filterItems(sections[containerId].items).map((item) => (
                  <SortableCard
                    key={item.id}
                    id={item.id}
                    disabled={isSortingContainer}
                    item={item}
                    checked={selected.includes(item.id)}
                    onToggle={onToggleCard}
                    dragging={item.id === activeId}
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
                ? renderContainerDragOverlay(activeDraggedItems as Section)
                : renderSortableItemDragOverlay(activeDraggedItems as Item[])
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

const Badge = styled.div`
  background-color: black;
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;

  position: absolute;
  top: -10px;
  right: -10px;
`;

const MultiCardsOverlay = styled.div`
  position: relative;
`;

function renderSortableItemDragOverlay(activeDraggedItems: Item[]) {
  if (activeDraggedItems.length === 1) {
    return <Card key="overlayItem" checked item={activeDraggedItems[0]} />;
  } else {
    return (
      <MultiCardsOverlay>
        <Badge>{activeDraggedItems.length}</Badge>
        <Card key="overlayItem" checked item={activeDraggedItems[0]} />
      </MultiCardsOverlay>
    );
  }
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
