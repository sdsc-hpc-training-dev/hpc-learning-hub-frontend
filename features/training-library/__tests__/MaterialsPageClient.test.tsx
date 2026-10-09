import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MaterialsPageClient from "../MaterialsPageClient";
import type { CatalogMaterial } from "@/lib/gateway/types";

const mockReplace = jest.fn<undefined, [string, { scroll: boolean }]>();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => "/materials",
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

const batchMaterial: CatalogMaterial = {
  id: "batch-scheduling",
  title: "Batch Computing with Slurm",
  description: "Learn how to schedule compute jobs.",
  topics: ["Batch Computing"],
  tools: ["Slurm"],
  systems: ["Expanse"],
  instructors: [],
  resources: [],
};

beforeEach(() => {
  mockReplace.mockReset();
  for (const key of Array.from(mockSearchParams.keys()))
    mockSearchParams.delete(key);
  window.history.replaceState(null, "", "/materials");
});

describe("Training Library search", () => {
  it("delegates the debounced query to the server and preserves current results", async () => {
    render(<MaterialsPageClient materials={[batchMaterial]} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "batch computing" },
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/materials?query=batch+computing",
        { scroll: false },
      );
    });
    expect(screen.getByText("1 material found")).toBeInTheDocument();
  });

  it("clears the URL search when filters are reset", () => {
    render(<MaterialsPageClient materials={[batchMaterial]} />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "batch computing" },
    });
    fireEvent.click(
      screen.getAllByRole("button", { name: "Reset filters" })[0],
    );

    expect(mockReplace).toHaveBeenLastCalledWith("/materials", {
      scroll: false,
    });
  });
});

describe("Training Library program filters", () => {
  it("shows fetched program options and submits the selected series ID", async () => {
    render(
      <MaterialsPageClient
        materials={[batchMaterial]}
        programs={[{ id: "series-1", name: "Series One" }]}
      />,
    );

    fireEvent.change(screen.getByLabelText("Program or series"), {
      target: { value: "series-1" },
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/materials?program=series-1", {
        scroll: false,
      });
    });
    expect(screen.getByRole("option", { name: "Series One" })).toHaveValue(
      "series-1",
    );
  });
});

describe("Training Library topic filters", () => {
  it("matches legacy lowercase topic filters against the catalog", () => {
    render(
      <MaterialsPageClient
        materials={[batchMaterial]}
        initialFilters={{ topic: "batch computing" }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Batch Computing with Slurm" }),
    ).toBeInTheDocument();
  });
});

it("renders the ten supplied records in server order and navigates with all filters and ranking intact", () => {
  const filters = {
    query: "batch",
    topic: "Batch Computing",
    tool: "Slurm",
    system: "Expanse",
    program: "series-1",
    resource: "video",
    date: "2025-01-01",
  };
  for (const [key, value] of Object.entries(filters))
    mockSearchParams.set(key, value);
  mockSearchParams.set("sort", "recommended");
  const materials = Array.from({ length: 10 }, (_, index) => ({
    ...batchMaterial,
    id: `m-${String(index)}`,
    title: `Material ${String(10 - index)}`,
  }));
  render(
    <MaterialsPageClient
      materials={materials}
      total={530}
      page={1}
      totalPages={53}
      initialFilters={filters}
    />,
  );
  expect(screen.getByText("Page 1 of 53")).toBeInTheDocument();
  expect(screen.getByText("530 materials found")).toBeInTheDocument();
  expect(
    screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent),
  ).toEqual(materials.map((material) => material.title));
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  const url = new URL(mockReplace.mock.calls[0][0], "https://example.org");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    ...filters,
    sort: "recommended",
    page: "2",
  });
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(10);
});

it("resets the server page when changing or removing a filter", async () => {
  mockSearchParams.set("page", "3");
  mockSearchParams.set("topic", "Batch Computing");
  mockSearchParams.set("tool", "Slurm");
  render(
    <MaterialsPageClient
      materials={[batchMaterial]}
      page={3}
      totalPages={4}
      initialFilters={{ topic: "Batch Computing", tool: "Slurm" }}
      facets={{
        topics: [
          { id: "t", name: "Batch Computing" },
          { id: "x", name: "Linux" },
        ],
        tools: [{ id: "s", name: "Slurm" }],
        systems: [],
      }}
    />,
  );
  fireEvent.change(screen.getByLabelText("Topic"), {
    target: { value: "Linux" },
  });
  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledWith(
      "/materials?topic=Linux&tool=Slurm",
      { scroll: false },
    );
  });
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

it("keeps catalog-wide options available when they are absent from the current page", () => {
  render(
    <MaterialsPageClient
      materials={[]}
      facets={{
        topics: [{ id: "linux", name: "Linux" }],
        tools: [],
        systems: [],
      }}
    />,
  );
  expect(screen.getByRole("option", { name: "Linux" })).toHaveValue("Linux");
  expect(screen.getByRole("option", { name: "Video" })).toHaveValue("video");
});
