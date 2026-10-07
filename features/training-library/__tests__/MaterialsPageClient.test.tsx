import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MaterialsPageClient from "../MaterialsPageClient";
import type { CatalogMaterial } from "@/lib/gateway/types";

const mockReplace = jest.fn();
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
  mockSearchParams.delete("query");
  mockSearchParams.delete("program");
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
    expect(screen.getByText("1 material shown")).toBeInTheDocument();
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
