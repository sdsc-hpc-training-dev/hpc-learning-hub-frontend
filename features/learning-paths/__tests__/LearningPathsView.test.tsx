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
    expect(
      screen.getByText(
        "Start with a curated learning path to build your skills in High Performance Computing (HPC). These paths arrange HPC trainings into a clear first journey. They are proposed guidance, not a completed curriculum.",
      ),
    ).toBeInTheDocument();
  });

  it("renders an honest empty state", () => {
    render(<LearningPathsView paths={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "No learning paths are available yet.",
    );
  });
});

describe("LearningPathDetail", () => {
  it("decodes the reported title and Python description before truncating steps", () => {
    const { container } = render(
      <LearningPathDetail
        path={{
          ...samplePath,
          title: "Research &amp; Data",
          description: "<p>Workflows &amp; tools.</p>",
          items: [
            {
              position: 1,
              material: {
                id: "20000132",
                title: "Cheap &amp; FAIR Data Practices",
                description:
                  "In this session, we will explore two transformative Python technologies&#8212;Numba and Dask&#8212;that empower researchers to bring their computing workflows to HPC.",
              },
            },
          ],
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Research & Data" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Cheap & FAIR Data Practices" }),
    ).toHaveAttribute("href", "/materials/20000132");
    expect(
      screen.getByText(/Python technologies\u2014Numba and Dask\u2014/),
    ).toBeInTheDocument();
    const summary = container.querySelector(".learning-path-step p");
    expect(Array.from(summary?.textContent ?? "")).toHaveLength(100);
    expect(container.textContent).not.toMatch(/&amp;|&#8212;|<p>/);
  });

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
    expect(
      screen.queryByText("No learning paths are available yet."),
    ).toBeNull();
  });
});
