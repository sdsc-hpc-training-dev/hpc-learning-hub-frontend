"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  bindLearnerRequest,
  getCurrentSession,
  RequestError,
  type Account,
  type LearnerRequest,
} from "./api";
import { getBookmarks, type Bookmark } from "@/features/my-learning/api";

type Status =
  | "checking"
  | "disabled"
  | "anonymous"
  | "signed-in"
  | "expired"
  | "unavailable";
interface Session {
  status: Status;
  account: Account | null;
  privateRequest: LearnerRequest | null;
  bookmarks: Bookmark[];
  bookmarksAvailable: boolean;
  reloadBookmarks: (activity?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}
const fallback: Session = {
  status: "disabled",
  account: null,
  privateRequest: null,
  bookmarks: [],
  bookmarksAvailable: false,
  reloadBookmarks: () => Promise.reject(new RequestError(401)),
  signOut: () => Promise.reject(new RequestError(401)),
};
const Context = createContext<Session>(fallback);

type UnboundStatus = Exclude<Status, "signed-in">;
type Binding =
  | { status: UnboundStatus }
  | {
      status: "signed-in";
      account: Account;
      privateRequest: LearnerRequest;
      signOut: () => Promise<void>;
    };

function watchSession(
  current: Awaited<ReturnType<typeof getCurrentSession>>,
  signal: AbortSignal,
  clear: (status: UnboundStatus) => void,
) {
  let checking = false;
  async function recheck() {
    if (checking || signal.aborted) return;
    checking = true;
    try {
      const next = await getCurrentSession(signal);
      if (
        next.sessionContext !== current.sessionContext ||
        next.account.id !== current.account.id
      ) {
        clear("expired");
      }
    } catch (error) {
      clear(
        error instanceof RequestError && error.status === 401
          ? "expired"
          : "unavailable",
      );
    } finally {
      checking = false;
    }
  }
  const verify = () => {
    void recheck();
  };
  window.addEventListener("focus", verify, { signal });
  window.addEventListener(
    "pageshow",
    (event) => {
      if (event.persisted) verify();
    },
    { signal },
  );
}

function useBinding(clearBookmarks: () => void) {
  const [binding, setBinding] = useState<Binding>({ status: "checking" });
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    function clear(status: UnboundStatus) {
      if (signal.aborted) return;
      controller.abort();
      clearBookmarks();
      setBinding({ status });
    }
    async function init() {
      try {
        const config = await fetch("/api/account-config", {
          cache: "no-store",
          credentials: "same-origin",
          signal,
        });
        if (!config.ok) throw new RequestError(config.status);
        const { enabled } = (await config.json()) as { enabled: boolean };
        signal.throwIfAborted();
        if (!enabled) {
          clear("disabled");
          return;
        }
        const current = await getCurrentSession(signal);
        signal.throwIfAborted();
        const privateRequest = bindLearnerRequest(
          current.sessionContext,
          signal,
          () => {
            clear("expired");
          },
        );
        const signOut = async () => {
          await privateRequest("/auth/logout", { method: "POST" });
          clear("anonymous");
        };
        watchSession(current, signal, clear);
        setBinding({
          status: "signed-in",
          account: current.account,
          privateRequest,
          signOut,
        });
      } catch (error) {
        clear(
          error instanceof RequestError && error.status === 401
            ? "anonymous"
            : "unavailable",
        );
      }
    }
    void init();
    return () => {
      controller.abort();
    };
  }, [clearBookmarks]);
  return binding;
}

export function SessionProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksAvailable, setBookmarksAvailable] = useState(false);
  const generation = useRef(0);
  const clearBookmarks = useCallback(() => {
    generation.current++;
    setBookmarks([]);
    setBookmarksAvailable(false);
  }, []);
  const binding = useBinding(clearBookmarks);
  const privateRequest =
    binding.status === "signed-in" ? binding.privateRequest : null;
  const reloadBookmarks = useCallback(
    async (activity = false) => {
      if (!privateRequest) throw new RequestError(401);
      const started = generation.current;
      try {
        const result = await getBookmarks(privateRequest, activity);
        if (generation.current === started) {
          setBookmarks(result);
          setBookmarksAvailable(true);
        }
      } catch (error) {
        if (generation.current === started) setBookmarksAvailable(false);
        throw error;
      }
    },
    [privateRequest],
  );
  useEffect(() => {
    if (privateRequest) void reloadBookmarks().catch(() => undefined);
  }, [privateRequest, reloadBookmarks]);
  const value = useMemo(
    () => ({
      ...fallback,
      status: binding.status,
      ...(binding.status === "signed-in"
        ? { ...binding, bookmarks, bookmarksAvailable, reloadBookmarks }
        : {}),
    }),
    [binding, bookmarks, bookmarksAvailable, reloadBookmarks],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  return useContext(Context);
}
