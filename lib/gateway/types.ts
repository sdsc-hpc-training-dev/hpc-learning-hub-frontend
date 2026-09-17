export type GatewayEnvelope<T> = {
  data?: T;
  items?: T;
  total?: number;
  message?: string;
  error?: string;
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
