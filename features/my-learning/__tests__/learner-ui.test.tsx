import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import AccountsPage from "@/app/account/page";
import { SessionProvider } from "@/features/auth/SessionProvider";
import MyLearningView from "../MyLearningView";

const account = {
  id: "user",
  username: "learner",
  email: null,
  role: "learner",
  sessionContext: "f23c8ef5-32d8-4c90-8723-1075417f6789",
};
const bookmarks = [
  { id: "bookmark-1", materialId: "one", createdAt: "" },
  { id: "bookmark-2", materialId: "two", createdAt: "" },
];
const initialPath = {
  id: "path-1",
  title: "Original path",
  description: null,
  items: [
    {
      materialId: "one",
      position: 0,
      material: { id: "one", title: "First material" },
    },
    {
      materialId: "two",
      position: 1,
      material: { id: "two", title: "Second material" },
    },
  ],
};

function reply(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function mockBackend(anonymous = false) {
  let saved = [...bookmarks];
  let paths = [initialPath];
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
  const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrl(input);
    const method = init?.method ?? "GET";
    if (url === "/api/account-config")
      return Promise.resolve(reply({ enabled: true }));
    if (url === "/api/v1/me")
      return Promise.resolve(anonymous ? reply({}, 401) : reply(account));
    if (
      url.startsWith("/api/v1/me/") &&
      new Headers(init?.headers).get("X-Learning-Hub-Session") !==
        account.sessionContext
    )
      return Promise.resolve(reply({}, 409));
    if (url === "/api/v1/me/bookmarks" && method === "GET")
      return Promise.resolve(reply(saved));
    if (url === "/api/v1/me/bookmarks/one" && method === "DELETE") {
      saved = saved.filter((item) => item.materialId !== "one");
      return Promise.resolve(reply(undefined, 204));
    }
    if (url === "/api/v1/me/learning-paths" && method === "GET")
      return Promise.resolve(reply(paths));
    if (url === "/api/v1/me/learning-paths/path-1" && method === "PATCH") {
      const data = JSON.parse(
        typeof init?.body === "string" ? init.body : "{}",
      ) as {
        title: string;
        description: null;
        items: typeof initialPath.items;
      };
      paths = [{ ...initialPath, ...data }];
      return Promise.resolve(reply(paths[0]));
    }
    if (url === "/api/v1/me/learning-paths/path-1" && method === "DELETE") {
      paths = [];
      return Promise.resolve(reply(undefined, 204));
    }
    if (url.startsWith("/api/v1/materials/")) {
      return Promise.resolve(
        reply({
          title: url.endsWith("/one") ? "First material" : "Second material",
        }),
      );
    }
    return Promise.resolve(reply({}, 404));
  });
  global.fetch = fetchMock as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  jest.restoreAllMocks();
  window.history.replaceState({}, "", "/");
});

test("a denied callback shows a friendly sign-in retry without displaying query details", async () => {
  const fetchMock = mockBackend(true);
  window.history.replaceState({}, "", "/account?status=denied");
  render(
    <SessionProvider>
      <AccountsPage />
    </SessionProvider>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Sign-in was not completed",
  );
  expect(
    await screen.findByRole("link", { name: "Sign in with CILogon" }),
  ).toHaveAttribute("href", "/api/v1/auth/cilogon/login");
  expect(screen.queryByText(/status=denied/)).not.toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalledWith(
    expect.stringContaining("/auth/cilogon/callback"),
    expect.anything(),
  );
});

test("removing a bookmark sends DELETE and removes it from My Learning", async () => {
  const fetchMock = mockBackend();
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  const savedSection = await screen.findByRole("region", {
    name: "Saved materials",
  });
  const link = await within(savedSection).findByRole("link", {
    name: "First material",
  });
  const row = link.closest("li");
  expect(row).not.toBeNull();
  fireEvent.click(
    within(row as HTMLElement).getByRole("button", {
      name: "Remove saved material",
    }),
  );
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/me/bookmarks/one",
      expect.objectContaining({ method: "DELETE", credentials: "same-origin" }),
    );
  });
  await waitFor(() => {
    expect(
      within(savedSection).queryByRole("link", { name: "First material" }),
    ).not.toBeInTheDocument();
  });
  expect(
    within(savedSection).getByRole("link", { name: "Second material" }),
  ).toBeInTheDocument();
});

test("editing a path submits the updated order and refreshes the view", async () => {
  const fetchMock = mockBackend();
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  await screen.findByRole("heading", { name: "Original path" });
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Updated path" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Move material two up" }));
  fireEvent.click(screen.getByRole("button", { name: "Save path" }));
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/me/learning-paths/path-1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "same-origin",
        body: JSON.stringify({
          title: "Updated path",
          description: null,
          items: [
            { materialId: "two", position: 0 },
            { materialId: "one", position: 1 },
          ],
        }),
      }),
    );
  });
  expect(
    await screen.findByRole("heading", { name: "Updated path" }),
  ).toBeInTheDocument();
});

test("deleting a path requires confirmation and refreshes the view", async () => {
  const fetchMock = mockBackend();
  const confirm = jest
    .spyOn(window, "confirm")
    .mockReturnValueOnce(false)
    .mockReturnValueOnce(true);
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  await screen.findByRole("heading", { name: "Original path" });
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(fetchMock).not.toHaveBeenCalledWith(
    "/api/v1/me/learning-paths/path-1",
    expect.objectContaining({ method: "DELETE" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(confirm).toHaveBeenCalledWith('Delete "Original path"?');
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/me/learning-paths/path-1",
      expect.objectContaining({ method: "DELETE", credentials: "same-origin" }),
    );
  });
  await waitFor(() => {
    expect(
      screen.queryByRole("heading", { name: "Original path" }),
    ).not.toBeInTheDocument();
  });
});
