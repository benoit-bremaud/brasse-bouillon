export interface MaltSpecRow {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface MaltSpecGroup {
  id: string;
  title: string;
  rows: MaltSpecRow[];
}

export interface MaltProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  originCountry?: string;
  maltType?: string;
  description?: string;
  specGroups: MaltSpecGroup[];
}
