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
import { request, RequestError } from "./api";
import { getBookmarks, type Bookmark } from "@/features/my-learning/api";

export interface Account {
  id: string;
  username: string;
  email: string | null;
  role: string;
}
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
  bookmarks: Bookmark[];
  bookmarksAvailable: boolean;
  reloadBookmarks: (activity?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}
const fallback: Session = {
  status: "disabled",
  account: null,
  bookmarks: [],
  bookmarksAvailable: false,
  reloadBookmarks: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
};
const Context = createContext<Session>(fallback);

// eslint-disable-next-line max-lines-per-function
export function SessionProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<Status>("checking");
  const [account, setAccount] = useState<Account | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarksAvailable, setBookmarksAvailable] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const config = await fetch("/api/account-config", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!config.ok) throw new Error();
        const { enabled } = (await config.json()) as { enabled: boolean };
        // The component may unmount while the configuration request is pending.
        if (!active) return;
        if (!enabled) {
          setStatus("disabled");
          return;
        }
        const current = await request<Account>("/me");
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (active) {
          setAccount(current);
          setStatus("signed-in");
        }
      } catch (error) {
        if (active)
          setStatus(
            error instanceof RequestError && error.status === 401
              ? "anonymous"
              : "unavailable",
          );
      }
    }
    void init();
    const expired = () => {
      generation.current++;
      setAccount(null);
      setBookmarks([]);
      setBookmarksAvailable(false);
      setStatus("expired");
    };
    window.addEventListener("learner-session-expired", expired);
    return () => {
      active = false;
      window.removeEventListener("learner-session-expired", expired);
    };
  }, []);
  const reloadBookmarks = useCallback(async (activity = false) => {
    const started = generation.current;
    try {
      const result = await getBookmarks(activity);
      if (generation.current === started) {
        setBookmarks(result);
        setBookmarksAvailable(true);
      }
    } catch (error) {
      if (generation.current === started) setBookmarksAvailable(false);
      throw error;
    }
  }, []);
  useEffect(() => {
    if (status === "signed-in") void reloadBookmarks().catch(() => { setBookmarks([]); });
  }, [status, reloadBookmarks]);
  const signOut = useCallback(async () => {
    await request("/auth/logout", { method: "POST" });
    generation.current++;
    setAccount(null);
    setBookmarks([]);
    setBookmarksAvailable(false);
    setStatus("anonymous");
  }, []);
  const value = useMemo(
    () => ({ status, account, bookmarks, bookmarksAvailable, reloadBookmarks, signOut }),
    [status, account, bookmarks, bookmarksAvailable, reloadBookmarks, signOut],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSession() {
  return useContext(Context);
}
