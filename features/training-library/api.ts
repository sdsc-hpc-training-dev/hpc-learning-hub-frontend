import { gatewayFetch, GatewayRequestError } from "@/lib/gateway/client";
import type {
  CatalogMaterial,
  GatewayMaterial,
  GatewayMaterialPage,
} from "@/lib/gateway/types";

const MATERIALS_ENDPOINT = "/api/v1/materials";
const MATERIALS_PAGE_SIZE = 100;

export const fallbackMaterials: CatalogMaterial[] = [
  {
    id: "material:202403-batch-computing-part-1:37a37537278b",
    title: "Fallback Material 1",
    description:
      "High-performance computing systems are specialized resources in use and shared by many researchers across all domains of science, engineering, and beyond.",
    summary:
      "High-performance computing systems are specialized resources in use and shared by many researchers across all domains of science, engineering, and beyond.",
    date: "2024-03-21T18:00:00+00:00",
    topics: ["High Performance Computing", "Batch Computing"],
    tools: ["Slurm"],
    systems: ["Voyager", "TSCC", "Expanse"],
    instructors: ["Marty Kandes"],
    program: "COMPLECS",
    series: "COMPLECS",
    resources: [
      {
        id: "resource-1",
        title: "Recording",
        type: "recording",
        url: "https://youtube.com/watch?v=7aVumEnQWwg",
      },
      {
        id: "resource-2",
        title: "Slides",
        type: "slides",
        url: "https://drive.google.com/file/d/1xVEf32OyHT27m9-8Fn94kBKk8eaeO196/view",
      },
    ],
    primaryUrl: "https://youtube.com/watch?v=7aVumEnQWwg",
  },
  {
    id: "material:202302-sdscwebinar-batch-job-scheduling-slurm-ed:4265884af4d7",
    title: "Fallback Material 2",
    description:
      "Most high-performance computing systems are specialized resources in high demand and shared simultaneously by many researchers.",
    summary:
      "Most high-performance computing systems are specialized resources in high demand and shared simultaneously by many researchers.",
    date: "2023-02-16T19:00:00+00:00",
    topics: ["High Performance Computing", "Batch Computing"],
    tools: ["Slurm"],
    systems: ["Expanse"],
    instructors: ["Marty Kandes"],
    program: "Workshop",
    series: null,
    resources: [
      {
        id: "resource-3",
        title: "Recording",
        type: "recording",
        url: "https://education.sdsc.edu/training/interactive/202302-SDSCWebinar-Batch-Job-Scheduling-Slurm-Edition",
      },
      {
        id: "resource-4",
        title: "Repository",
        type: "repository",
        url: "https://github.com/mkandes/batch-computing/",
      },
    ],
    primaryUrl:
      "https://education.sdsc.edu/training/interactive/202302-SDSCWebinar-Batch-Job-Scheduling-Slurm-Edition",
  },
  {
    id: "material:202310-sdscwebinar-gpu-computing-and-programming:d00d538c38d0",
    title: "Fallback Material 3",
    description:
      "This webinar provides a brief introduction to massively parallel computing with graphics processing units on the SDSC Expanse supercomputer.",
    summary:
      "This webinar provides a brief introduction to massively parallel computing with graphics processing units on the SDSC Expanse supercomputer.",
    date: "2023-10-26T18:00:00+00:00",
    topics: [
      "Parallel Computing",
      "GPU Programming",
      "High Performance Computing",
    ],
    tools: ["OpenACC", "CUDA"],
    systems: ["Expanse"],
    instructors: ["Andreas Goetz"],
    program: "Webinar",
    series: null,
    resources: [
      {
        id: "resource-5",
        title: "Recording",
        type: "recording",
        url: "https://youtube.com/watch?v=vZz3gV8j1Yg",
      },
    ],
    primaryUrl: "https://youtube.com/watch?v=vZz3gV8j1Yg",
  },
  {
    id: "material:202204-matlab:ad3ff1f2cb98",
    title: "Fallback Material 4",
    description:
      "Learn how to solve and accelerate computationally and data-intensive problems that are becoming common in machine learning and deep learning.",
    summary:
      "Learn how to solve and accelerate computationally and data-intensive problems that are becoming common in machine learning and deep learning.",
    date: "2022-04-27T20:00:00+00:00",
    topics: [
      "GPU Programming",
      "Machine Learning",
      "High Performance Computing",
    ],
    tools: ["MATLAB"],
    systems: ["TSCC", "Expanse"],
    instructors: ["Timothy Kyung"],
    program: "Course",
    series: null,
    resources: [
      {
        id: "resource-6",
        title: "Repository",
        type: "repository",
        url: "https://content.mathworks.com/viewer/627bf639c548acba8f4a0e3c",
      },
      {
        id: "resource-7",
        title: "Recording",
        type: "recording",
        url: "https://education.sdsc.edu/training/interactive/202204_matlab",
      },
    ],
    primaryUrl: "https://education.sdsc.edu/training/interactive/202204_matlab",
  },
];

export interface MaterialListFilters {
  topic?: string;
  tool?: string;
  system?: string;
  program?: string;
  resource?: string;
  query?: string;
  date?: string;
}

function namedValues(items: { name: string }[] | undefined) {
  return Array.isArray(items) ? items.map((item) => item.name) : [];
}

function normalizeMaterial(material: GatewayMaterial): CatalogMaterial {
  return {
    id: material.id,
    title: material.title ?? "Untitled material",
    description: material.description,
    summary: material.description,
    topics: namedValues(material.topics),
    tools: namedValues(material.tools),
    systems: namedValues(material.systems),
    instructors: namedValues(material.instructors),
    resources: Array.isArray(material.resources) ? material.resources : [],
  };
}

function queryForFilters(filters: MaterialListFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.query?.trim()) {
    params.set("search", filters.query.trim());
  }
  if (filters.program?.trim()) {
    params.set("eventSeries", filters.program.trim());
  }
  params.set("page", String(page));
  params.set("pageSize", String(MATERIALS_PAGE_SIZE));

  return params;
}

function matchesTitleOrDescription(material: CatalogMaterial, query: string) {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase();
  const normalizeText = (value: string) =>
    value.replace(/\s+/g, " ").toLowerCase();

  return (
    normalizeText(material.title).includes(normalizedQuery) ||
    normalizeText(material.description ?? "").includes(normalizedQuery)
  );
}

export async function getTrainingLibraryData(
  filters: MaterialListFilters = {},
): Promise<{
  materials: CatalogMaterial[];
  total: number;
  error?: boolean;
}> {
  try {
    const firstPage = await gatewayFetch<GatewayMaterialPage>(
      `${MATERIALS_ENDPOINT}?${queryForFilters(filters, 1)}`,
      { cache: "no-store" },
    );
    const materials = Array.isArray(firstPage.items)
      ? firstPage.items.map(normalizeMaterial)
      : [];
    const totalPages = Math.max(firstPage.totalPages, 1);

    for (let page = 2; page <= totalPages; page += 1) {
      const response = await gatewayFetch<GatewayMaterialPage>(
        `${MATERIALS_ENDPOINT}?${queryForFilters(filters, page)}`,
        { cache: "no-store" },
      );

      if (Array.isArray(response.items)) {
        materials.push(...response.items.map(normalizeMaterial));
      }
    }

    const matchingMaterials = filters.query?.trim()
      ? materials.filter((material) =>
          matchesTitleOrDescription(material, filters.query ?? ""),
        )
      : materials;

    return {
      materials: matchingMaterials,
      total: filters.query?.trim() ? matchingMaterials.length : firstPage.total,
    };
  } catch {
    return {
      materials: [],
      total: 0,
      error: true,
    };
  }
}

export async function getMaterialById(
  materialId: string,
): Promise<CatalogMaterial | null> {
  const normalizedMaterialId = decodeURIComponent(materialId);

  try {
    return await gatewayFetch<GatewayMaterial>(
      `${MATERIALS_ENDPOINT}/${encodeURIComponent(normalizedMaterialId)}`,
      { cache: "no-store" },
    ).then(normalizeMaterial);
  } catch (error) {
    if (error instanceof GatewayRequestError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
