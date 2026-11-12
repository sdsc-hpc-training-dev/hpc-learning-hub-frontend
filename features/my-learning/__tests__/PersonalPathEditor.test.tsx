import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PersonalPathEditor from "../PersonalPathEditor";
import { savePath } from "../api";
jest.mock("../api", () => ({ savePath: jest.fn() }));
const privateRequest = jest.fn();

test("creates a path with selected materials in the chosen order", async () => {
  (savePath as jest.Mock).mockResolvedValue(undefined);
  const onSaved = jest.fn().mockResolvedValue(undefined);
  render(
    <PersonalPathEditor
      privateRequest={privateRequest}
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
  fireEvent.click(screen.getByRole("button", { name: "Move Material two up" }));
  fireEvent.click(screen.getByRole("button", { name: "Save path" }));
  await waitFor(() => {
    expect(savePath).toHaveBeenCalledWith(
      privateRequest,
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
test("adds a Training Library material without a bookmark", async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        items: [{ id: "library-only", title: "Slurm jobs" }],
        totalPages: 1,
      }),
  });
  const originalFetch = global.fetch;
  global.fetch = fetchMock;
  try {
    (savePath as jest.Mock).mockResolvedValue(undefined);
    render(
      <PersonalPathEditor
        privateRequest={privateRequest}
        bookmarks={[]}
        onSaved={jest.fn().mockResolvedValue(undefined)}
        onCancel={jest.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Slurm" },
    });
    fireEvent.change(screen.getByLabelText("Find a material"), {
      target: { value: "Slurm jobs" },
    });
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "Slurm jobs" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save path" }));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("term=Slurm+jobs"),
      expect.objectContaining({ credentials: "omit" }),
    );
    await waitFor(() => {
      expect(savePath).toHaveBeenCalledWith(
        privateRequest,
        {
          title: "Slurm",
          description: null,
          items: [{ materialId: "library-only", position: 0 }],
        },
        undefined,
      );
    });
  } finally {
    global.fetch = originalFetch;
  }
});
test("metadata-only edit preserves unavailable items", async () => {
  (savePath as jest.Mock).mockResolvedValue(undefined);
  render(
    <PersonalPathEditor
      privateRequest={privateRequest}
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
      privateRequest,
      { title: "New", description: null },
      "p",
    );
  });
});
