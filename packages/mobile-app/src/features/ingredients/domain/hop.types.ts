export interface HopSpecRow {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface HopSpecGroup {
  id: string;
  title: string;
  rows: HopSpecRow[];
}

export interface HopProduct {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  originCountry?: string;
  hopType?: string;
  description?: string;
  specGroups: HopSpecGroup[];
}

export interface HopFilters {
  search?: string;
  alphaAcidMin?: number;
  alphaAcidMax?: number;
}
