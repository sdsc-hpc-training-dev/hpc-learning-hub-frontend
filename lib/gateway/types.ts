export type GatewayEnvelope<T> = {
  data?: T;
  items?: T;
  total?: number;
  message?: string;
  error?: string;
};

export type NamedCatalogItem = {
  id: string;
  name: string;
};

export type GatewayMaterial = {
  id: string;
  title: string | null;
  description: string | null;
  eventEditions: unknown[];
  topics: NamedCatalogItem[];
  tools: NamedCatalogItem[];
  systems: NamedCatalogItem[];
  instructors: NamedCatalogItem[];
  resources: CatalogResource[];
};

export type GatewayMaterialPage = {
  items: GatewayMaterial[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CatalogResource = {
  id: string;
  title: string;
  type: string;
  url?: string | null;
  verificationStatus?: string | null;
};

export type CatalogMaterial = {
  id: string;
  title: string;
  description?: string | null;
  summary?: string | null;
  date?: string | null;
  topics: string[];
  tools: string[];
  systems: string[];
  instructors: string[];
  program?: string | null;
  series?: string | null;
  resources: CatalogResource[];
  primaryUrl?: string | null;
};
