import { render, screen } from "@testing-library/react";
import type { CatalogMaterial } from "@/lib/gateway/types";
import MaterialDetail from "../MaterialDetail";

it("renders a useful resource label instead of malformed repository badge markup", () => {
  const material: CatalogMaterial = {
    id: "summer-institute-2021",
    title: "SDSC Summer Institute 2021",
    description: "Materials and slides from the Summer Institute.",
    topics: [],
    tools: [],
    systems: [],
    instructors: [],
    resources: [
      {
        id: "repository-2021",
        type: "repository",
        title:
          '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/" <img alt="Creative Commons License" / </a',
        url: "https://github.com/sdsc/sdsc-summer-institute-2021",
      },
    ],
  };

  const { container } = render(
    <MaterialDetail material={material} relatedMaterials={[]} />,
  );

  expect(
    screen.getByRole("link", { name: /Source repository/ }),
  ).toHaveAttribute("href", material.resources[0].url);
  expect(container.textContent).not.toMatch(/<a rel=|<img|Snapshot v2/);
});
