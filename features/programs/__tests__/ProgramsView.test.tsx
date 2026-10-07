import { render, screen } from "@testing-library/react";
import ProgramsView from "../ProgramsView";

const programs = [
  { id: "series-1", name: "COMPLECS" },
  { id: "series-2", name: "Summer Institute" },
];

const selectedProgram = {
  ...programs[0],
  total: 1,
  materials: [
    {
      id: "material-1",
      title: "Linux training",
      description: "Learn Linux for HPC.",
      topics: ["Linux"],
      tools: [],
      systems: [],
      instructors: [],
      program: "COMPLECS",
      series: "COMPLECS",
      resources: [],
    },
  ],
};

describe("ProgramsView", () => {
  it("renders program links and initial guidance", () => {
    render(<ProgramsView programs={programs} selectedProgram={null} />);

    expect(
      screen.getByRole("heading", {
        name: "See how individual sessions fit into a larger program.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "COMPLECS" })).toHaveAttribute(
      "href",
      "/programs?program=series-1#program-detail",
    );
    expect(
      screen.getByRole("heading", {
        name: "Collections add context to individual materials.",
      }),
    ).toBeInTheDocument();
  });

  it("renders a selected program and its representative materials", () => {
    render(
      <ProgramsView programs={programs} selectedProgram={selectedProgram} />,
    );

    expect(
      screen.getByText(
        "Showing 1 representative material from 1 associated with this series.",
      ),
    ).toBeInTheDocument();
    const materialLink = screen.getByRole("link", { name: "Linux training" });
    expect(materialLink).toHaveAttribute(
      "href",
      "/materials/material-1",
    );
    expect(materialLink.closest("article")).not.toHaveAttribute("tabindex");
    expect(materialLink.closest("article")).not.toHaveAttribute("data-card-href");
    expect(screen.getByRole("link", { name: "COMPLECS" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders empty states for missing programs and materials", () => {
    const { unmount } = render(
      <ProgramsView programs={[]} selectedProgram={null} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No programs or series are currently listed.",
    );
    unmount();

    render(
      <ProgramsView
        programs={programs}
        selectedProgram={{ ...programs[0], total: 0, materials: [] }}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "No training materials are currently connected to this series.",
    );
  });
});
