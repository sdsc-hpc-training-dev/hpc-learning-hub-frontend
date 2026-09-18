export interface GatewayEnvelope<T> {
  data?: T;
  items?: T;
  total?: number;
  message?: string;
  error?: string;
}

export interface NamedCatalogItem {
  id: string;
  name: string;
}

export interface GatewayMaterial {
  id: string;
  title: string | null;
  description: string | null;
  eventEditions: unknown[];
  topics: NamedCatalogItem[];
  tools: NamedCatalogItem[];
  systems: NamedCatalogItem[];
  instructors: NamedCatalogItem[];
  resources: CatalogResource[];
}

export interface GatewayMaterialPage {
  items: GatewayMaterial[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogResource {
  id: string;
  title: string;
  type: string;
  url?: string | null;
  verificationStatus?: string | null;
}

export interface CatalogMaterial {
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
}

export interface LearningPathMaterial {
  id: string;
  title: string | null;
  description: string | null;
}

export interface LearningPathItem {
  position: number;
  material: LearningPathMaterial;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  audience: string | null;
  prerequisites: string | null;
  estimatedScope: string | null;
  items: LearningPathItem[];
}
