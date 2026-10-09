import { fireEvent, render, screen } from "@testing-library/react";
import ProgramDescription, {
  collapsedSeriesDescription,
} from "../ProgramDescription";
import { seriesDescription, seriesDescriptions } from "../descriptions";

// Group the public copy and interaction contract in one focused suite.
// eslint-disable-next-line max-lines-per-function
describe("series descriptions", () => {
  it("covers every active series with distinct primary-source descriptions", () => {
    const names = [
      "Advanced Computing Series",
      "CIML",
      "COMPLECS",
      "SDSC Webinars",
      "Summer Institute",
      "TSCC Workshop Series",
    ];
    expect(Object.keys(seriesDescriptions)).toHaveLength(names.length);
    expect(Object.keys(seriesDescriptions)).toEqual(
      expect.arrayContaining(names),
    );
    expect(new Set(names.map(seriesDescription)).size).toBe(6);
    for (const [name, entry] of Object.entries(seriesDescriptions)) {
      expect(
        entry.sources.some((url) => url.startsWith("https://www.sdsc.edu/")),
      ).toBe(true);
      expect(
        collapsedSeriesDescription(seriesDescription(name)).length,
      ).toBeLessThanOrEqual(200);
    }
    expect(seriesDescription("CIML")).toContain(
      "Cyberinfrastructure-Enabled Machine Learning",
    );
    expect(seriesDescription("COMPLECS")).toContain(
      "Comprehensive Learning for End-users to Effectively Utilize Cyberinfrastructure",
    );
    expect(seriesDescription("New program")).toBe(
      "A verified description for New program is not yet available.",
    );
  });

  it("counts ellipsis within the 200-character limit, including unbroken text", () => {
    expect(collapsedSeriesDescription("a".repeat(200))).toHaveLength(200);
    expect(collapsedSeriesDescription("a".repeat(201))).toHaveLength(200);
    expect(collapsedSeriesDescription("a".repeat(201)).endsWith("…")).toBe(
      true,
    );
  });

  it("expands and collapses with an accessible native button and controlled region", () => {
    const text = seriesDescription("COMPLECS");
    render(<ProgramDescription text={text} name="COMPLECS" />);
    const toggle = screen.getByRole("button", {
      name: "Show more about COMPLECS",
    });
    const region = screen.getByRole("region", { name: "COMPLECS description" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", region.id);
    expect(region).toHaveTextContent(collapsedSeriesDescription(text));
    expect(region.textContent.length).toBeLessThanOrEqual(200);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveTextContent(text);
    expect(
      screen.getByRole("button", { name: "Show less about COMPLECS" }),
    ).toBe(toggle);
    fireEvent.click(toggle);
    expect(region).toHaveAttribute("tabindex", "0");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("does not add an expansion button to a short description", () => {
    render(
      <ProgramDescription text="A short description." name="Short series" />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
