export type Item = {
  id: string;
  name: string;
  status: string;
};

export type Section = {
  [name: string]: Item[];
};
