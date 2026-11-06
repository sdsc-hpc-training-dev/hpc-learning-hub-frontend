import {
  render,
  renderHook,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import { bindLearnerRequest, RequestError } from "../api";
import { SessionProvider, useSession } from "../SessionProvider";
import {
  addBookmark,
  getBookmarks,
  getPaths,
  savePath,
  deletePath,
} from "@/features/my-learning/api";

const contextA = "f23c8ef5-32d8-4c90-8723-1075417f6789";
const contextB = "b39fdf16-30a5-426c-b4a0-af1954f1482c";
const account = {
  id: "1",
  username: "learner",
  email: null,
  role: "learner",
  sessionContext: contextA,
};
const saved = [{ id: "bookmark-1", materialId: "one", createdAt: "" }];
const sessionHeader = "X-Learning-Hub-Session";

function Probe() {
  const { status, account } = useSession();
  return (
    <div>
      {status} {account?.username}
    </div>
  );
}
function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
    json: () => Promise.resolve(body),
  };
}
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("disabled accounts never contact auth", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValue(response({ enabled: false }) as Response);
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
  await screen.findByText("disabled");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
function mockSession() {
  let cookie: typeof account | null = account;
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockImplementation((input, init) => {
      if (input === "/api/account-config")
        return Promise.resolve(response({ enabled: true }) as Response);
      if (input === "/api/v1/me")
        return Promise.resolve(
          response(cookie, cookie ? 200 : 401) as Response,
        );
      if (!cookie) return Promise.resolve(response({}, 401) as Response);
      if (
        new Headers(init?.headers).get(sessionHeader) !== cookie.sessionContext
      )
        return Promise.resolve(response({}, 409) as Response);
      return Promise.resolve(response(saved) as Response);
    });
  return {
    fetchMock,
    setCookie: (next: typeof account | null) => {
      cookie = next;
    },
  };
}

const cases = [
  {
    name: "stale read",
    status: 409,
    url: "/me/learning-paths",
    method: undefined,
  },
  { name: "stale write", status: 409, url: "/me/bookmarks", method: "POST" },
  { name: "stale logout", status: 409, url: "/auth/logout", method: "POST" },
  {
    name: "expired read",
    status: 401,
    url: "/me/learning-paths",
    method: undefined,
  },
] as const;

test.each(cases)(
  "$name sends the captured context and clears private state",
  async ({ status, url, method }) => {
    const { fetchMock, setCookie } = mockSession();
    const { result } = renderHook(useSession, { wrapper: SessionProvider });
    await waitFor(() => {
      expect(result.current.bookmarks).toEqual(saved);
    });
    const { privateRequest, signOut } = result.current;
    if (!privateRequest) throw new Error("Expected a session");
    setCookie(
      status === 409 ? { ...account, id: "2", sessionContext: contextB } : null,
    );
    const operation = () => {
      if (url === "/auth/logout") return signOut();
      if (url === "/me/bookmarks") return addBookmark(privateRequest, "two");
      return getPaths(privateRequest);
    };
    await act(async () => {
      await expect(operation()).rejects.toMatchObject({ status });
    });
    const [endpoint, init] = fetchMock.mock.lastCall ?? [];
    expect(endpoint).toBe(`/api/v1${url}`);
    expect(init?.method).toBe(method);
    expect(new Headers(init?.headers).get(sessionHeader)).toBe(contextA);
    expect(init?.signal?.aborted).toBe(true);
    expect(result.current).toMatchObject({
      status: "expired",
      account: null,
      privateRequest: null,
      bookmarks: [],
      bookmarksAvailable: false,
    });
    const count = fetchMock.mock.calls.length;
    await expect(operation()).rejects.toBeInstanceOf(RequestError);
    expect(fetchMock).toHaveBeenCalledTimes(count);
  },
);

test.each([
  { ...account, id: "2", username: "other", sessionContext: contextB },
  { ...account, sessionContext: contextB },
  null,
])("focus clears changed sessions without adopting them (%j)", async (next) => {
  const { fetchMock, setCookie } = mockSession();
  const { result } = renderHook(useSession, { wrapper: SessionProvider });
  await waitFor(() => {
    expect(result.current.bookmarks).toEqual(saved);
  });
  setCookie(next);
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
    await Promise.resolve();
  });
  expect(result.current).toMatchObject({
    status: "expired",
    account: null,
    privateRequest: null,
    bookmarks: [],
  });
  const meCalls = fetchMock.mock.calls.filter(([url]) => url === "/api/v1/me");
  expect(meCalls).toHaveLength(2);
  for (const [, init] of meCalls) {
    const headers = new Headers(init?.headers);
    expect(headers.has(sessionHeader)).toBe(false);
    expect(headers.has("X-Learning-Hub-Activity")).toBe(false);
  }
});

test("a late success cannot repopulate cleared bookmarks", async () => {
  const { fetchMock, setCookie } = mockSession();
  const { result } = renderHook(useSession, { wrapper: SessionProvider });
  await waitFor(() => {
    expect(result.current.bookmarks).toEqual(saved);
  });
  let finish: ((value: Response) => void) | undefined;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  const reload = result.current.reloadBookmarks();
  setCookie(null);
  await act(async () => {
    window.dispatchEvent(new Event("focus"));
    await Promise.resolve();
  });
  await act(async () => {
    finish?.(response(saved) as Response);
    await expect(reload).rejects.toMatchObject({ status: 401 });
  });
  expect(result.current).toMatchObject({
    status: "expired",
    bookmarks: [],
    bookmarksAvailable: false,
  });
});

test.each([undefined, "invalid"])(
  "invalid session context (%s) fails closed",
  async (sessionContext) => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(response({ enabled: true }) as Response)
      .mockResolvedValueOnce(
        response({ ...account, sessionContext }) as Response,
      );
    const { result } = renderHook(useSession, { wrapper: SessionProvider });
    await waitFor(() => {
      expect(result.current.status).toBe("unavailable");
    });
    expect(result.current.privateRequest).toBeNull();
    await expect(result.current.reloadBookmarks()).rejects.toMatchObject({
      status: 401,
    });
    await expect(result.current.signOut()).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  },
);
test("anonymous and unavailable sessions are distinct", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValueOnce(response({ enabled: true }) as Response)
    .mockResolvedValueOnce(response({}, 401) as Response);
  const view = render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
  await screen.findByText("anonymous");
  view.unmount();
  fetchMock
    .mockResolvedValueOnce(response({ enabled: true }) as Response)
    .mockResolvedValueOnce(response({}, 503) as Response);
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
  expect(await screen.findByText("unavailable")).toBeInTheDocument();
});
test("learner reads mark only explicit activity; mutations stay same-origin", async () => {
  const fetchMock = jest
    .spyOn(global, "fetch")
    .mockResolvedValue(response([]) as Response);
  const request = bindLearnerRequest(
    contextA,
    new AbortController().signal,
    jest.fn(),
  );
  await getBookmarks(request);
  await getBookmarks(request, true);
  await getPaths(request);
  await addBookmark(request, "one");
  await savePath(request, {
    title: "Path",
    description: null,
    items: [{ materialId: "one", position: 0 }],
  });
  await savePath(request, { title: "Path", description: null }, "p");
  await deletePath(request, "p");
  const calls = fetchMock.mock.calls;
  expect(new Headers(calls[0][1]?.headers).has("X-Learning-Hub-Activity")).toBe(
    false,
  );
  expect(new Headers(calls[1][1]?.headers).get("X-Learning-Hub-Activity")).toBe(
    "1",
  );
  expect(new Headers(calls[2][1]?.headers).get("X-Learning-Hub-Activity")).toBe(
    "1",
  );
  for (const [, init] of calls.slice(3)) {
    expect(init?.credentials).toBe("same-origin");
    expect(new Headers(init?.headers).has("X-Learning-Hub-Activity")).toBe(
      false,
    );
  }
  for (const [, init] of calls) {
    expect(new Headers(init?.headers).get(sessionHeader)).toBe(contextA);
  }
});
