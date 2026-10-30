import { fireEvent, render, screen } from "@testing-library/react";
import MaterialTags, { uniqueMaterialTags } from "../MaterialTags";

function tags(count: number) {
  return Array.from({ length: count }, (_, index) => `Tag ${String(index + 1)}`);
}

it.each([0, 8])("renders %s tags without pagination controls", (count) => {
  render(<MaterialTags tags={tags(count)} />);
  expect(screen.queryByRole("button", { name: /Show all/ })).toBeNull();
  expect(screen.queryAllByText(/^Tag /)).toHaveLength(count);
});

it("expands 9 tags and can return to the initial eight", () => {
  render(<MaterialTags tags={tags(9)} />);
  expect(screen.queryByText("Tag 9")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show more tags (9)" }));
  expect(screen.getByText("Showing tags 1–9 of 9")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));
  expect(screen.queryByText("Tag 9")).toBeNull();
});

it.each([30, 31, 90])("pages %s tags in windows of at most thirty", (count) => {
  render(<MaterialTags tags={tags(count)} />);
  fireEvent.click(screen.getByRole("button", { name: `Show more tags (${String(count)})` }));
  expect(screen.queryAllByText(/^Tag /)).toHaveLength(30);
  if (count > 30) {
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText(`Showing tags 31–${String(Math.min(count, 60))} of ${String(count)}`)).toBeInTheDocument();
  }
});

it("deduplicates labels case-insensitively in source order", () => {
  expect(uniqueMaterialTags(["Topic", "tool", "topic", " Tool ", "System"])).toEqual(["Topic", "tool", "System"]);
});
