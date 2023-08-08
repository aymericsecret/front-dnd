"use client";
import { styled } from "styled-components";
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  CSSProperties,
  createContext,
  forwardRef,
  useMemo,
  useState,
} from "react";
import {
  SyntheticListenerMap,
  useSensorSetup,
} from "@dnd-kit/core/dist/hooks/utilities";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { findSectionContainer } from "./utils";
import { Item } from "./types";

const Main = styled.main`
  overflow-x: hidden;
  height: 100vh;
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const MainWrapper = styled.main`
display: flex;
flex-direction: column;
flex: 1 1 0%;
overflow: hidden;
}
`;

const Wrapper = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  flex: 1 1 0%;
  overflow-x: auto;
`;

const ColumnContainer = styled.div<{ $color: string; $isOver: boolean }>`
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
const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid black;
  padding: 10px;
`;

const ColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  padding: 10px;

  gap: 10px;
  align-items: stretch;
  justify-content: flex-start;

  overflow-y: scroll;
`;

const CardsContainer = styled.div`
  height: 50px;
  border: 1px solid black;
  padding: 10px;
  background-color: white;
`;

const Column = ({
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
    <ColumnContainer ref={setNodeRef} $isOver={isOver} $color={color}>
      <ColumnTitle>
        Title {title} - Totals {contacts.length}
      </ColumnTitle>
      <ColumnContent>
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
      </ColumnContent>
    </ColumnContainer>
  );
};

// eslint-disable-next-line react/display-name
const Cards = forwardRef(({ contact, ...props }: any, ref) => {
  return (
    <CardsContainer id={contact.id} {...props} ref={ref}>
      {contact?.name}
    </CardsContainer>
  );
});

const DraggableCard = ({ contact }: { contact: Item }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: contact.id,
  });

  return (
    <Cards ref={setNodeRef} contact={contact} {...listeners} {...attributes} />
  );
};

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

const SortableCard = ({ contact, ...props }: any) => {
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
    <Cards
      contact={contact}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

export default function Home() {
  const [sections, setSections] = useState(originalItemsOrdered);
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
    <Main>
      <MainWrapper>
        <div
          style={{
            height: "100px",
            backgroundColor: "white",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          Title{" "}
        </div>
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
              <Column
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
              {active ? <Cards key="overlayItem" contact={activeItem} /> : null}
            </DragOverlay>
          </Wrapper>
        </DndContext>
      </MainWrapper>
    </Main>
  );
}

let originalItems = [
  { id: "100", name: "Hildegaard", status: "status3" },
  { id: "101", name: "Jorry", status: "status1" },
  { id: "102", name: "Celestyna", status: "status1" },
  { id: "103", name: "Phylis", status: "status3" },
  { id: "104", name: "Lorne", status: "status1" },
  { id: "105", name: "Phedra", status: "status3" },
  { id: "106", name: "Dede", status: "status3" },
  { id: "107", name: "Konstance", status: "status3" },
  { id: "108", name: "Calla", status: "status3" },
  { id: "109", name: "Flory", status: "status1" },
  { id: "110", name: "Esmeralda", status: "status1" },
  { id: "111", name: "Sissy", status: "status2" },
  { id: "112", name: "Tybie", status: "status3" },
  { id: "113", name: "Dolli", status: "status2" },
  { id: "114", name: "Ingrid", status: "status1" },
  { id: "115", name: "Marline", status: "status2" },
  { id: "116", name: "Beth", status: "status3" },
  { id: "117", name: "Babita", status: "status1" },
  { id: "118", name: "Nannie", status: "status2" },
  { id: "119", name: "Dione", status: "status1" },
  { id: "120", name: "Nicoli", status: "status2" },
  { id: "121", name: "Dianemarie", status: "status1" },
  { id: "122", name: "Vanessa", status: "status2" },
  { id: "123", name: "Fawne", status: "status1" },
  { id: "124", name: "Johna", status: "status3" },
  // { id: "125", name: "Kellen", status: 'status1' },
  // { id: "126", name: "Janeczka", status: 'status2' },
  // { id: "127", name: "Sindee", status: 'status2' },
  // { id: "128", name: "Annice", status: 'status2' },
  // { id: "129", name: "Wileen", status: 'status1' },
  // { id: "130", name: "Sonni", status: 'status2' },
  // { id: "131", name: "Olwen", status: 'status2' },
  // { id: "132", name: "Emmey", status: 'status3' },
  // { id: "133", name: "Philis", status: 'status1' },
  // { id: "134", name: "Morganica", status: 'status1' },
  // { id: "135", name: "Karolina", status: 'status1' },
  // { id: "136", name: "Lynea", status: 'status1' },
  // { id: "137", name: "Margalo", status: 'status1' },
  // { id: "138", name: "Zia", status: 'status1' },
  // { id: "139", name: "Ginnie", status: 'status3' },
  // { id: "140", name: "Lynnea", status: 'status1' },
  // { id: "141", name: "Lilith", status: 'status2' },
  // { id: "142", name: "Amara", status: 'status2' },
  // { id: "143", name: "Kristan", status: 'status1' },
  // { id: "144", name: "Danny", status: 'status2' },
  // { id: "145", name: "Molli", status: 'status3' },
  // { id: "146", name: "Amalie", status: 'status3' },
  // { id: "147", name: "Raf", status: 'status1' },
  // { id: "148", name: "Henriette", status: 'status2' },
  // { id: "149", name: "Elyssa", status: 'status1' },
  // { id: "150", name: "Merci", status: 'status3' },
];

let originalItemsOrdered: { [key: string]: Item[] } = {
  status1: [
    { id: "101", name: "Jorry", status: "status1" },
    { id: "102", name: "Celestyna", status: "status1" },
    { id: "104", name: "Lorne", status: "status1" },
    { id: "109", name: "Flory", status: "status1" },
    { id: "110", name: "Esmeralda", status: "status1" },
    { id: "114", name: "Ingrid", status: "status1" },
    { id: "117", name: "Babita", status: "status1" },
    { id: "119", name: "Dione", status: "status1" },
    { id: "121", name: "Dianemarie", status: "status1" },
    { id: "123", name: "Fawne", status: "status1" },
  ],
  status2: [
    // { id: "111", name: "Sissy", status: "status2" },
    // { id: "113", name: "Dolli", status: "status2" },
    // { id: "115", name: "Marline", status: "status2" },
    // { id: "118", name: "Nannie", status: "status2" },
    // { id: "120", name: "Nicoli", status: "status2" },
    // { id: "122", name: "Vanessa", status: "status2" },
  ],
  status3: [
    { id: "100", name: "Hildegaard", status: "status3" },
    { id: "103", name: "Phylis", status: "status3" },
    { id: "105", name: "Phedra", status: "status3" },
    { id: "106", name: "Dede", status: "status3" },
    { id: "107", name: "Konstance", status: "status3" },
    { id: "108", name: "Calla", status: "status3" },
    { id: "112", name: "Tybie", status: "status3" },
    { id: "116", name: "Beth", status: "status3" },
    { id: "124", name: "Johna", status: "status3" },
  ],
};
