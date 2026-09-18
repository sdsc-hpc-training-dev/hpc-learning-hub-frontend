import { gatewayFetch } from "@/lib/gateway/client";
import type { CatalogMaterial, GatewayEnvelope } from "@/lib/gateway/types";

export const fallbackMaterials: CatalogMaterial[] = [
  {
    id: "material:202403-batch-computing-part-1:37a37537278b",
    title: "Batch Computing: Getting Started with Batch Job Scheduling - Slurm Edition (COMPLECS)",
    description:
      "High-performance computing systems are specialized resources in use and shared by many researchers across all domains of science, engineering, and beyond.",
    summary: "High-performance computing systems are specialized resources in use and shared by many researchers across all domains of science, engineering, and beyond.",
    date: "2024-03-21T18:00:00+00:00",
    topics: ["High Performance Computing", "Batch Computing"],
    tools: ["Slurm"],
    systems: ["Voyager", "TSCC", "Expanse"],
    instructors: ["Marty Kandes"],
    program: "COMPLECS",
    series: "COMPLECS",
    resources: [
      { id: "resource-1", title: "Recording", type: "recording", url: "https://youtube.com/watch?v=7aVumEnQWwg" },
      { id: "resource-2", title: "Slides", type: "slides", url: "https://drive.google.com/file/d/1xVEf32OyHT27m9-8Fn94kBKk8eaeO196/view" },
    ],
    primaryUrl: "https://youtube.com/watch?v=7aVumEnQWwg",
  },
  {
    id: "material:202302-sdscwebinar-batch-job-scheduling-slurm-ed:4265884af4d7",
    title: "Getting Started with Batch Job Scheduling: Slurm Edition",
    description: "Most high-performance computing systems are specialized resources in high demand and shared simultaneously by many researchers.",
    summary: "Most high-performance computing systems are specialized resources in high demand and shared simultaneously by many researchers.",
    date: "2023-02-16T19:00:00+00:00",
    topics: ["High Performance Computing", "Batch Computing"],
    tools: ["Slurm"],
    systems: ["Expanse"],
    instructors: ["Marty Kandes"],
    program: "Workshop",
    series: null,
    resources: [
      { id: "resource-3", title: "Recording", type: "recording", url: "https://education.sdsc.edu/training/interactive/202302-SDSCWebinar-Batch-Job-Scheduling-Slurm-Edition" },
      { id: "resource-4", title: "Repository", type: "repository", url: "https://github.com/mkandes/batch-computing/" },
    ],
    primaryUrl: "https://education.sdsc.edu/training/interactive/202302-SDSCWebinar-Batch-Job-Scheduling-Slurm-Edition",
  },
  {
    id: "material:202310-sdscwebinar-gpu-computing-and-programming:d00d538c38d0",
    title: "GPU Computing and Programming on Expanse",
    description: "This webinar provides a brief introduction to massively parallel computing with graphics processing units on the SDSC Expanse supercomputer.",
    summary: "This webinar provides a brief introduction to massively parallel computing with graphics processing units on the SDSC Expanse supercomputer.",
    date: "2023-10-26T18:00:00+00:00",
    topics: ["Parallel Computing", "GPU Programming", "High Performance Computing"],
    tools: ["OpenACC", "CUDA"],
    systems: ["Expanse"],
    instructors: ["Andreas Goetz"],
    program: "Webinar",
    series: null,
    resources: [{ id: "resource-5", title: "Recording", type: "recording", url: "https://youtube.com/watch?v=vZz3gV8j1Yg" }],
    primaryUrl: "https://youtube.com/watch?v=vZz3gV8j1Yg",
  },
  {
    id: "material:202204-matlab:ad3ff1f2cb98",
    title: "Parallel and GPU Computing with MATLAB",
    description: "Learn how to solve and accelerate computationally and data-intensive problems that are becoming common in machine learning and deep learning.",
    summary: "Learn how to solve and accelerate computationally and data-intensive problems that are becoming common in machine learning and deep learning.",
    date: "2022-04-27T20:00:00+00:00",
    topics: ["GPU Programming", "Machine Learning", "High Performance Computing"],
    tools: ["MATLAB"],
    systems: ["TSCC", "Expanse"],
    instructors: ["Timothy Kyung"],
    program: "Course",
    series: null,
    resources: [
      { id: "resource-6", title: "Repository", type: "repository", url: "https://content.mathworks.com/viewer/627bf639c548acba8f4a0e3c" },
      { id: "resource-7", title: "Recording", type: "recording", url: "https://education.sdsc.edu/training/interactive/202204_matlab" },
    ],
    primaryUrl: "https://education.sdsc.edu/training/interactive/202204_matlab",
  },
];

export type MaterialListFilters = {
  topic?: string;
  tool?: string;
  system?: string;
  program?: string;
  resource?: string;
  query?: string;
  date?: string;
};

export async function getTrainingLibraryData(
  filters: MaterialListFilters = {},
): Promise<{ materials: CatalogMaterial[]; total: number }> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value.trim()) {
      params.set(key, value.trim());
    }
  });

  try {
    const response = await gatewayFetch<GatewayEnvelope<CatalogMaterial[]>>(`/materials${params.toString() ? `?${params.toString()}` : ""}`);
    const materials = response?.data ?? response?.items ?? [];

    return {
      materials: Array.isArray(materials) ? materials : [],
      total: typeof response?.total === "number" ? response.total : Array.isArray(materials) ? materials.length : 0,
    };
  } catch {
    return {
      materials: fallbackMaterials,
      total: fallbackMaterials.length,
    };
  }
}

export async function getMaterialById(materialId: string): Promise<CatalogMaterial | null> {
  const normalizedMaterialId = decodeURIComponent(materialId);

  try {
    const response = await gatewayFetch<GatewayEnvelope<CatalogMaterial>>(
      `/materials/${encodeURIComponent(normalizedMaterialId)}`,
    );
    const material = response?.data ?? response?.items;

    if (material && !Array.isArray(material)) {
      return material;
    }
  } catch {
    // Use the local subset while the Gateway is unavailable.
  }

  return fallbackMaterials.find((material) => material.id === normalizedMaterialId) ?? null;
}
