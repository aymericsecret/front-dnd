import { Section } from "./types";

export const findSectionContainer = (boardSections: Section, id: string) => {
  if (id in boardSections) {
    return id;
  }

  const container = Object.keys(boardSections).find((key) =>
    boardSections[key].find((item) => item.id === id)
  );
  return container;
};
