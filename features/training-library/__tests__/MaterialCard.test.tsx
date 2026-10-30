import { render, screen } from "@testing-library/react";
import MaterialCard from "../MaterialCard";
import MaterialDetail from "../MaterialDetail";
import type { CatalogMaterial } from "@/lib/gateway/types";

const material: CatalogMaterial = {
  id: "20000559",
  title: "SDSC Summer Institute 2026",
  description:
    'SDSC Summer Institute 2026 <a name="top" </a This repository hosts all material and slides.',
  topics: ["Containers"],
  tools: [],
  systems: ["Comet"],
  instructors: [],
  resources: [
    {
      id: "resource",
      type: "repository",
      title: "Slides &amp; code",
      url: "https://github.com/sdsc/sdsc-summer-institute-2026",
    },
  ],
};

describe("catalog cards and detail text", () => {
  it("uses a fixed calendar timezone for server and browser date labels", () => {
    const formatter = jest.spyOn(Intl, "DateTimeFormat");
    const dated = { ...material, date: "2026-08-03T00:30:00.000Z" };
    const card = render(<MaterialCard material={dated} />);
    expect(formatter).toHaveBeenCalledWith("en-US", expect.objectContaining({ timeZone: "UTC" }));
    expect(screen.getByText(/Aug 3, 2026/)).toBeInTheDocument();
    card.unmount();
    formatter.mockClear();
    render(<MaterialDetail material={dated} relatedMaterials={[]} />);
    expect(formatter).toHaveBeenCalledWith("en-US", expect.objectContaining({ timeZone: "UTC" }));
    expect(screen.getByText("Aug 3, 2026")).toBeInTheDocument();
    formatter.mockRestore();
  });

  it("cleans the reported malformed anchor without losing the card description", () => {
    const { container } = render(<MaterialCard material={material} />);
    expect(
      screen.getByText(
        "SDSC Summer Institute 2026 This repository hosts all material and slides.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: material.title })).toHaveAttribute(
      "href",
      "/materials/20000559",
    );
    expect(container.textContent).not.toContain('<a name="top"');
  });

  it("uses the same readable prose and resource titles on material details", () => {
    const { container } = render(
      <MaterialDetail material={material} relatedMaterials={[]} />,
    );
    expect(
      screen.getByText(
        "SDSC Summer Institute 2026 This repository hosts all material and slides.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Slides & code/ })).toHaveAttribute(
      "href",
      material.resources[0].url,
    );
    expect(container.textContent).not.toMatch(/&amp;|<a name/);
    expect(container.querySelector("#material-body a")).toBeNull();
  });
});
