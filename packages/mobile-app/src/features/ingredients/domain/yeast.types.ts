export interface YeastSpecRow {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface YeastSpecGroup {
  id: string;
  title: string;
  rows: YeastSpecRow[];
}

export interface YeastProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  originCountry?: string;
  yeastType?: string;
  description?: string;
  specGroups: YeastSpecGroup[];
}

export interface YeastFilters {
  search?: string;
  attenuationMin?: number;
  attenuationMax?: number;
}
