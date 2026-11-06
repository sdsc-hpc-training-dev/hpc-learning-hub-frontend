import { render, screen, act } from "@testing-library/react";
import { request } from "../api";
import { SessionProvider, useSession } from "../SessionProvider";
import {
  addBookmark,
  getBookmarks,
  getPaths,
  savePath,
  deletePath,
} from "@/features/my-learning/api";

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
test("successful session and expiry clear identity", async () => {
  jest.spyOn(global, "fetch").mockImplementation((input) => {
    if (input === "/api/account-config")
      return Promise.resolve(response({ enabled: true }) as Response);
    if (input === "/api/v1/me")
      return Promise.resolve(response({
        id: "1",
        username: "learner",
        email: null,
        role: "learner",
      }) as Response);
    if (input === "/api/v1/me/bookmarks") return Promise.resolve(response([]) as Response);
    return Promise.resolve(response({}, 401) as Response);
  });
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
  await screen.findByText("signed-in learner");
  await act(async () => {
    await expect(request("/me/learning-paths")).rejects.toThrow();
  });
  await screen.findByText("expired");
});
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
  await getBookmarks();
  await getBookmarks(true);
  await getPaths();
  await addBookmark("one");
  await savePath({
    title: "Path",
    description: null,
    items: [{ materialId: "one", position: 0 }],
  });
  await savePath({ title: "Path", description: null }, "p");
  await deletePath("p");
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
});
