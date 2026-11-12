import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import AccountsPage from "@/app/account/page";
import { SessionProvider as AuthSessionProvider } from "@/features/auth/SessionProvider";
import { LearnerProfileProvider } from "../LearnerProfileProvider";
import {
  HomeFeedbackLink,
  LearnerWelcome,
} from "@/features/start-here/LearnerWelcome";
import type { ReactNode } from "react";
import MyLearningView from "../MyLearningView";
import SaveMaterialButton from "../SaveMaterialButton";

function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthSessionProvider>
      <LearnerProfileProvider>{children}</LearnerProfileProvider>
    </AuthSessionProvider>
  );
}

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
    },
    {
      materialId: "two",
      position: 1,
      material: { id: "two", title: "Second material" },
    },
  ],
};

function reply(body: unknown, status = 200, headers?: HeadersInit): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

// eslint-disable-next-line max-lines-per-function -- Keep the fixture state and HTTP contract together.
function mockBackend(anonymous = false, empty = false) {
  let saved = empty ? [] : [...bookmarks];
  let paths = empty ? [] : [initialPath];
  let profile = {
    displayName: null as string | null,
    email: "learner@example.test",
    topics: [] as string[],
    setupComplete: false,
  };
  // eslint-disable-next-line complexity, sonarjs/cognitive-complexity, max-lines-per-function
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
      return Promise.resolve(
        reply({}, 409, { "X-Learning-Hub-Session-Mismatch": "1" }),
      );
    if (url === "/api/v1/me/bookmarks" && method === "GET")
      return Promise.resolve(reply(saved));
    if (url === "/api/v1/me/bookmarks" && method === "POST") {
      saved = [...saved, bookmarks[0]];
      return Promise.resolve(reply(bookmarks[0], 201));
    }
    if (url === "/api/v1/me/profile" && method === "GET")
      return Promise.resolve(reply(profile));
    if (url === "/api/v1/me/profile" && method === "PATCH") {
      const data = JSON.parse(
        typeof init?.body === "string" ? init.body : "{}",
      ) as {
        displayName: string | null;
        topics: string[];
      };
      profile = { ...profile, ...data, setupComplete: true };
      return Promise.resolve(reply(profile));
    }
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

test("removing a bookmark keeps the row visible until the learner leaves My Learning", async () => {
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
      name: "Bookmark material",
      pressed: true,
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
      within(row as HTMLElement).getByRole("button", {
        name: "Bookmark material",
        pressed: false,
      }),
    ).toBeInTheDocument();
  });
  expect(link).toBeInTheDocument();
  expect(
    within(savedSection).getByRole("link", { name: "Second material" }),
  ).toBeInTheDocument();
  expect(
    within(savedSection).getByRole("link", {
      name: "Find more materials to save",
    }),
  ).toHaveAttribute("href", "/materials");
});

test("shows useful empty states without opening the path editor", async () => {
  mockBackend(false, true);
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  expect(await screen.findByText("No learning paths yet.")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Browse the Training Library" }),
  ).toHaveAttribute("href", "/materials");
  expect(
    screen.getByRole("link", { name: "Go to my learning paths" }),
  ).toHaveAttribute("href", "#personal-paths");
  expect(
    screen.queryByRole("textbox", { name: "Title" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Create a path" }));
  const title = screen.getByRole("textbox", { name: "Title" });
  const description = screen.getByRole("textbox", { name: "Description" });
  expect(title).toHaveFocus();
  expect(title).toHaveAttribute("maxlength", "200");
  expect(description).toHaveAttribute("maxlength", "5000");
  fireEvent.change(title, { target: { value: "My path" } });
  fireEvent.change(description, { target: { value: "Try Slurm" } });
  expect(title).toHaveAccessibleDescription("7 / 200 characters");
  expect(description).toHaveAccessibleDescription("9 / 5,000 characters");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(
    screen.queryByRole("textbox", { name: "Title" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Personal learning paths" }),
  ).toHaveFocus();
});

test("Your profile saves the preferred name and shows private email and learning shortcuts", async () => {
  mockBackend(false, true);
  const view = render(
    <SessionProvider>
      <AccountsPage />
      <LearnerWelcome />
      <HomeFeedbackLink />
    </SessionProvider>,
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "Set up profile" }),
  );
  const name = screen.getByRole("textbox", { name: "Preferred name" });
  expect(name).toHaveFocus();
  expect(name).toHaveAttribute("maxlength", "80");
  fireEvent.change(name, { target: { value: "Pilot Learner" } });
  expect(name).toHaveAccessibleDescription("13 / 80 characters");
  fireEvent.click(screen.getByRole("button", { name: "Save profile" }));
  expect(
    await screen.findByText("Preferred name: Pilot Learner"),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      "Hello Pilot Learner, ready to learn something new today?",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", {
      name: "Let us know what you think, Pilot Learner",
    }),
  ).toHaveAttribute("href", "/feedback?returnTo=%2F");
  view.unmount();
  render(
    <SessionProvider>
      <AccountsPage />
    </SessionProvider>,
  );
  expect(
    await screen.findByText("Preferred name: Pilot Learner"),
  ).toBeInTheDocument();
  expect(screen.getByText(/learner@example.test/)).toHaveTextContent(
    "(private)",
  );
  expect(screen.getByRole("link", { name: "Saved materials" })).toHaveAttribute(
    "href",
    "/my-learning#saved-materials",
  );
  expect(
    screen.getByRole("link", { name: "Go to my learning paths" }),
  ).toHaveAttribute("href", "/my-learning#personal-paths");
});

test("first-time learners are asked for an optional preferred name in My Learning", async () => {
  const fetchMock = mockBackend(false, true);
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  expect(
    await screen.findByRole("heading", { name: "What should we call you?" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: "Preferred name" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Keep browsing" }));
  await waitFor(() => {
    expect(
      screen.queryByRole("textbox", { name: "Preferred name" }),
    ).toBeNull();
  });
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/v1/me/profile",
    expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ displayName: null, topics: [] }),
    }),
  );
});

test("a card bookmark updates the matching detail star without navigation", async () => {
  const fetchMock = mockBackend(false, true);
  render(
    <SessionProvider>
      <SaveMaterialButton
        materialId="one"
        materialTitle="First material"
        placement="card"
      />
      <SaveMaterialButton materialId="one" placement="detail" />
    </SessionProvider>,
  );
  const card = await screen.findByRole("button", {
    name: "Bookmark: First material",
  });
  await waitFor(() => {
    expect(card).toBeEnabled();
  });
  fireEvent.click(card);
  await waitFor(() => {
    expect(card).toHaveAttribute("aria-pressed", "true");
  });
  const detail = screen.getByRole("button", {
    name: "Bookmark material",
    pressed: true,
  });
  fireEvent.click(detail);
  await waitFor(() => {
    expect(card).toHaveAttribute("aria-pressed", "false");
  });
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/v1/me/bookmarks",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ materialId: "one" }),
    }),
  );
});

test("lets a learner skip setup and edit it later", async () => {
  mockBackend(false, true);
  render(
    <SessionProvider>
      <AccountsPage />
    </SessionProvider>,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Skip for now" }));
  expect(
    await screen.findByRole("button", { name: "Edit profile" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Skip for now" }),
  ).not.toBeInTheDocument();
});

test("editing a path submits the updated order and refreshes the view", async () => {
  const fetchMock = mockBackend();
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  await screen.findByRole("heading", { name: "Original path" });
  expect(
    await within(screen.getByRole("article")).findByRole("link", {
      name: "First material",
    }),
  ).toHaveAttribute("href", "/materials/one");
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { value: "Updated path" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Move Second material up" }),
  );
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
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
    close(this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
  render(
    <SessionProvider>
      <MyLearningView />
    </SessionProvider>,
  );
  await screen.findByRole("heading", { name: "Original path" });
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  const dialog = screen.getByRole("dialog", {
    name: "Delete this learning path?",
  });
  expect(dialog).toHaveTextContent("Original path");
  expect(
    within(dialog).getByRole("button", { name: "Keep path" }),
  ).toHaveFocus();
  fireEvent.click(within(dialog).getByRole("button", { name: "Keep path" }));
  expect(fetchMock).not.toHaveBeenCalledWith(
    "/api/v1/me/learning-paths/path-1",
    expect.objectContaining({ method: "DELETE" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Delete path",
    }),
  );
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
