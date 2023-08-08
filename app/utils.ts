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
