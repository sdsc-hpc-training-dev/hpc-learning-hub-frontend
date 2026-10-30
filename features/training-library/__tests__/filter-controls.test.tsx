import { fireEvent, render, screen } from "@testing-library/react";
import TrainingLibraryFilters from "../TrainingLibraryFilters";
import { emptyFilterValues } from "../navigation";

function renderFilters(overrides: Partial<typeof emptyFilterValues> = {}) {
  const onChange = jest.fn();
  render(
    <TrainingLibraryFilters
      options={{
        topics: [{ label: "Linux", value: "Linux" }],
        tools: [],
        systems: [],
        programs: [],
        resourceTypes: [],
      }}
      values={{ ...emptyFilterValues, ...overrides }}
      onChange={onChange}
      onReset={jest.fn()}
    />,
  );
  return onChange;
}

it("renders exactly four unique sort choices with Recommended selected by default", () => {
  renderFilters();
  const sort = screen.getByLabelText("Sort");
  expect(sort).toHaveValue("recommended");
  expect(screen.getAllByRole("option").slice(-4).map((option) => option.textContent)).toEqual([
    "Recommended",
    "Title A-Z",
    "Newest First",
    "Oldest First",
  ]);
});

it("keeps facet clearing on the empty option", () => {
  const onChange = renderFilters({ topic: "Linux" });
  fireEvent.change(screen.getByLabelText("Topic"), { target: { value: "" } });
  expect(onChange).toHaveBeenCalledWith("topic", "");
});
