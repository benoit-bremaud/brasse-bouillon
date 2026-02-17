export type FermentableMalt = {
  id: string;
  name: string;
  ppg: number;
  efm: number;
};

export const fermentableMaltCatalog: FermentableMalt[] = [
  { id: "pilsner", name: "Pilsner", ppg: 37.5, efm: 82 },
  { id: "pale-ale", name: "Pale Ale", ppg: 37, efm: 82 },
  { id: "munich", name: "Munich", ppg: 33, efm: 80 },
  { id: "vienna", name: "Vienna", ppg: 35, efm: 80 },
  { id: "wheat", name: "Blé malté", ppg: 38, efm: 83 },
  { id: "maris-otter", name: "Maris Otter", ppg: 38, efm: 82 },
  { id: "cara-20", name: "Cara 20", ppg: 34, efm: 78 },
  { id: "cara-50", name: "Cara 50", ppg: 33, efm: 76 },
  { id: "cara-120", name: "Cara 120", ppg: 31, efm: 73 },
  { id: "carapils", name: "Carapils", ppg: 35, efm: 80 },
  { id: "rye", name: "Seigle malté", ppg: 36, efm: 80 },
  { id: "oats", name: "Flocons d'avoine", ppg: 33, efm: 72 },
  { id: "chocolate", name: "Chocolate", ppg: 28, efm: 65 },
  { id: "black", name: "Black Malt", ppg: 26, efm: 60 },
  { id: "roasted-barley", name: "Orge torréfiée", ppg: 25, efm: 58 },
  { id: "acidulated", name: "Malt acide", ppg: 33, efm: 76 },
  { id: "sugar-cane", name: "Sucre de canne", ppg: 46, efm: 100 },
  { id: "dextrose", name: "Dextrose", ppg: 46, efm: 100 },
  { id: "honey", name: "Miel", ppg: 35, efm: 95 },
  { id: "candi", name: "Sucre candi", ppg: 45, efm: 100 },
];

export function getMaltById(id: string) {
  return fermentableMaltCatalog.find((malt) => malt.id === id);
}
