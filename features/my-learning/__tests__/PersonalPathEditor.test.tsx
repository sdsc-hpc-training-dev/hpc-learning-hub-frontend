import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PersonalPathEditor from "../PersonalPathEditor";
import { savePath } from "../api";
jest.mock("../api", () => ({ savePath: jest.fn() }));

test("creates a path with selected materials in the chosen order", async () => {
  (savePath as jest.Mock).mockResolvedValue(undefined);
  const onSaved = jest.fn().mockResolvedValue(undefined);
  render(
    <PersonalPathEditor
      bookmarks={[
        { id: "b1", materialId: "one", createdAt: "" },
        { id: "b2", materialId: "two", createdAt: "" },
      ]}
      onSaved={onSaved}
      onCancel={jest.fn()}
    />,
  );
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Sequence" },
  });
  fireEvent.click(screen.getByLabelText("Material one"));
  fireEvent.click(screen.getByLabelText("Material two"));
  fireEvent.click(screen.getByRole("button", { name: "Move material two up" }));
  fireEvent.click(screen.getByRole("button", { name: "Save path" }));
  await waitFor(() => {
    expect(savePath).toHaveBeenCalledWith(
      {
        title: "Sequence",
        description: null,
        items: [
          { materialId: "two", position: 0 },
          { materialId: "one", position: 1 },
        ],
      },
      undefined,
    );
  });
  expect(onSaved).toHaveBeenCalled();
});
test("metadata-only edit preserves unavailable items", async () => {
  (savePath as jest.Mock).mockResolvedValue(undefined);
  render(
    <PersonalPathEditor
      path={{
        id: "p",
        title: "Old",
        description: null,
        items: [{ position: 0, materialId: "missing" }],
      }}
      bookmarks={[]}
      onSaved={jest.fn().mockResolvedValue(undefined)}
      onCancel={jest.fn()}
    />,
  );
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "New" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save path" }));
  await waitFor(() => {
    expect(savePath).toHaveBeenCalledWith(
      { title: "New", description: null },
      "p",
    );
  });
});
