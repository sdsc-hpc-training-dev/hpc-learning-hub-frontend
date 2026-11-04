import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import MaterialCard from "@/features/training-library/MaterialCard";
import MaterialDetail from "@/features/training-library/MaterialDetail";
import type { CatalogMaterial } from "@/lib/gateway/types";
import { materialOpenEvent, resourceOpenEvent } from "../events";

describe("Umami event attributes", () => {
  it("tracks a catalog material without sending its title or URL", () => {
    expect(materialOpenEvent("material-1")).toEqual({
      "data-umami-event": "material-open",
      "data-umami-event-material-id": "material-1",
    });
  });

  it("identifies the resource and its format", () => {
    expect(resourceOpenEvent("material-1", "resource-2", "video")).toEqual({
      "data-umami-event": "resource-open",
      "data-umami-event-material-id": "material-1",
      "data-umami-event-resource-id": "resource-2",
      "data-umami-event-resource-type": "video",
    });
  });
});

const material: CatalogMaterial = {
  id: "material-1",
  title: "HPC &amp; Training",
  topics: [],
  tools: [],
  systems: [],
  instructors: [],
  resources: [
    {
      id: "resource-2",
      title: "Slides &amp; code",
      type: "repository",
      url: "https://github.com/example/training",
    },
  ],
};

describe("Umami events with the current catalog UI", () => {
  it("tracks both card links while preserving cleaned titles and return navigation", () => {
    const returnTo = "/materials?query=MPI&page=2";
    render(createElement(MaterialCard, { material, returnTo }));

    expect(
      screen.getByRole("link", { name: "HPC & Training" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Source repository")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("data-umami-event", "material-open");
      expect(link).toHaveAttribute("data-umami-event-material-id", material.id);
      const href = new URL(
        link.getAttribute("href") ?? "",
        "https://catalog.invalid",
      );
      expect(href.searchParams.get("returnTo")).toBe(returnTo);
    }
  });

  it("tracks resource links while preserving readable labels and external-link behavior", () => {
    render(createElement(MaterialDetail, { material, relatedMaterials: [] }));

    const resource = screen.getByRole("link", { name: /Slides & code/ });
    expect(resource).toHaveAttribute("data-umami-event", "resource-open");
    expect(resource).toHaveAttribute(
      "data-umami-event-material-id",
      material.id,
    );
    expect(resource).toHaveAttribute(
      "data-umami-event-resource-id",
      "resource-2",
    );
    expect(resource).toHaveAttribute(
      "data-umami-event-resource-type",
      "repository",
    );
    expect(resource).toHaveAttribute("href", material.resources[0].url);
    expect(resource).toHaveAttribute("target", "_blank");
    expect(resource).toHaveAttribute("rel", "noopener noreferrer");
  });
});
