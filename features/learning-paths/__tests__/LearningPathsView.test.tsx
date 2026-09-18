import { render, screen } from "@testing-library/react";
import { LearningPathDetail, LearningPathsView } from "../LearningPathsView";
import type { LearningPath } from "@/lib/gateway/types";

const samplePath: LearningPath = {
  id: "new-to-hpc",
  title: "New to HPC",
  description: "Build a practical foundation.",
  audience: "New HPC learners",
  prerequisites: "None",
  estimatedScope: "Two guided steps",
  items: [
    {
      position: 2,
      material: {
        id: "batch-jobs",
        title: "Batch jobs",
        description: "Schedule work.",
      },
    },
    {
      position: 1,
      material: {
        id: "linux",
        title: "Linux basics",
        description: "Learn the shell.",
      },
    },
  ],
};

describe("LearningPathsView", () => {
  it("renders available paths with detail links", () => {
    render(<LearningPathsView paths={[samplePath]} />);

    expect(
      screen.getByRole("heading", { name: "Available learning paths" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New to HPC" })).toHaveAttribute(
      "href",
      "/learning-paths/new-to-hpc",
    );
  });

  it("renders an honest empty state", () => {
    render(<LearningPathsView paths={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "No learning paths are available yet.",
    );
  });

});

describe("LearningPathDetail", () => {
  it("renders metadata and orders steps by position", () => {
    render(<LearningPathDetail path={samplePath} />);

    expect(screen.getByText("New HPC learners")).toBeInTheDocument();
    const materialLinks = screen.getAllByRole("link", {
      name: /Linux basics|Batch jobs/,
    });
    expect(materialLinks[0]).toHaveTextContent("Linux basics");
    expect(materialLinks[1]).toHaveTextContent("Batch jobs");
  });

  it("renders a material-specific empty state", () => {
    render(<LearningPathDetail path={{ ...samplePath, items: [] }} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No training materials have been added to this path yet.",
    );
    expect(screen.queryByText("No learning paths are available yet.")).toBeNull();
  });
});
