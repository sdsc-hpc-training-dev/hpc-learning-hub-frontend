import { render, screen } from "@testing-library/react";
import SeriesMaterialsView from "../SeriesMaterialsView";

const program = {
  id: "series & 1",
  name: "COMPLECS",
  total: 13,
  materials: Array.from({ length: 6 }, (_, i) => ({
    id: `material-${String(i)}`,
    title: `Training ${String(i)}`,
    topics: [],
    tools: [],
    systems: [],
    instructors: [],
    resources: [],
  })),
};

describe("series materials view", () => {
  it("renders six cards and preserves the series in both page links and the detail return", () => {
    render(<SeriesMaterialsView program={program} page={2} totalPages={3} />);
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByRole("status")).toHaveTextContent(
      "13 associated materials. Page 2 of 3.",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/programs/materials?program=series+%26+1&page=1",
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/programs/materials?program=series+%26+1&page=3",
    );
    expect(
      screen.getByRole("link", { name: "Back to COMPLECS" }),
    ).toHaveAttribute(
      "href",
      "/programs?program=series%20%26%201#program-detail",
    );
  });

  it("has no previous link on page one or next link on the last page", () => {
    render(<SeriesMaterialsView program={program} page={1} totalPages={1} />);
    expect(
      screen.queryByRole("link", { name: "Previous page" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Next page" }),
    ).not.toBeInTheDocument();
  });

  it("shows a truthful empty state without page 1 of 0 or material cards", () => {
    render(
      <SeriesMaterialsView
        program={{ ...program, total: 0, materials: [] }}
        page={1}
        totalPages={0}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No training materials are currently connected to this series.",
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("does not fall back to all materials for an unknown series", () => {
    render(<SeriesMaterialsView program={null} page={1} totalPages={0} />);
    expect(
      screen.getByRole("heading", { name: "Series unavailable" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
