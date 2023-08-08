export type Item = {
  id: string;
  name: string;
  status: string;
};

export type Section = {
  id: string;
  name: string;
  items: Item[];
};

export type SectionList = {
  [name: string]: Section;
};

export type Section2 = {
  [name: string]: Item[];
};
