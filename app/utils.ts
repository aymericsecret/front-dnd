import { SectionList } from "./types";

export const findSectionContainer = (
  boardSections: SectionList,
  id: string
) => {
  if (id in boardSections) {
    return id;
  }

  const container = Object.keys(boardSections).find((key) =>
    boardSections[key].items.find((item) => item.id === id)
  );
  return container;
};

// import { Item, Section } from "./types";

// export const findSectionContainer = (boardSections: Section[], id: string) => {
//   const activeSection = boardSections.find((section) => section.id === id);
//   const activeItem = boardSections.reduce((item: Item | undefined, section) => {
//     return item ? item : section.items.find((item) => item.id === id);
//   }, undefined);
//   return activeSection?.id ?? activeItem?.id;
// };
