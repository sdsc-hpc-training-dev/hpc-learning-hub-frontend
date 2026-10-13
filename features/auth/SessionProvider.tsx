"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentAccount,
  logout as logoutRequest,
  type AccountSummary,
} from "./api";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "@/features/my-learning/api";
import { BrowserGatewayError } from "@/lib/gateway/browser-client";

interface SessionContextValue {
  account: AccountSummary | null;
  loading: boolean;
  sessionError: string;
  bookmarkedIds: ReadonlySet<string>;
  bookmarksLoading: boolean;
  refresh: () => Promise<AccountSummary | null>;
  refreshBookmarks: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleBookmark: (materialId: string) => Promise<boolean>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const anonymousSession: SessionContextValue = {
  account: null,
  loading: false,
  sessionError: "",
  bookmarkedIds: new Set(),
  bookmarksLoading: false,
  refresh: () => Promise.resolve(null),
  refreshBookmarks: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  toggleBookmark: () => Promise.reject(new Error("Sign in to save training materials.")),
};

// This provider coordinates the account and bookmark state shared by the shell.
// eslint-disable-next-line max-lines-per-function
export function SessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<ReadonlySet<string>>(new Set());
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const refreshBookmarks = useCallback(async () => {
    if (!account) {
      setBookmarkedIds(new Set());
      return;
    }
    setBookmarksLoading(true);
    try {
      const bookmarks = await getBookmarks();
      setBookmarkedIds(new Set(bookmarks.map((bookmark) => bookmark.materialId)));
    } finally {
      setBookmarksLoading(false);
    }
  }, [account]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSessionError("");
    try {
      const current = await getCurrentAccount();
      setAccount(current);
      return current;
    } catch (error) {
      setAccount(null);
      setBookmarkedIds(new Set());
      if (!(error instanceof BrowserGatewayError) || error.status !== 401) {
        setSessionError(error instanceof Error ? error.message : "Account status is unavailable.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!account) {
      setBookmarkedIds(new Set());
      setBookmarksLoading(false);
      return;
    }
    void refreshBookmarks().catch((error: unknown) => {
      setBookmarkedIds(new Set());
      if (error instanceof BrowserGatewayError && error.status === 401) {
        setAccount(null);
      }
    });
  }, [account, refreshBookmarks]);

  const signOut = useCallback(async () => {
    await logoutRequest();
    setAccount(null);
    setBookmarkedIds(new Set());
    setSessionError("");
  }, []);

  const toggleBookmark = useCallback(
    async (materialId: string) => {
      if (!account) throw new Error("Sign in to save training materials.");
      if (bookmarkedIds.has(materialId)) {
        await removeBookmark(materialId);
        setBookmarkedIds((current) => {
          const next = new Set(current);
          next.delete(materialId);
          return next;
        });
        return false;
      }
      try {
        await addBookmark(materialId);
      } catch (error) {
        if (!(error instanceof BrowserGatewayError) || error.status !== 409) throw error;
      }
      setBookmarkedIds((current) => new Set(current).add(materialId));
      return true;
    },
    [account, bookmarkedIds],
  );

  const value = useMemo(
    () => ({
      account,
      loading,
      sessionError,
      bookmarkedIds,
      bookmarksLoading,
      refresh,
      refreshBookmarks,
      signOut,
      toggleBookmark,
    }),
    [
      account,
      loading,
      sessionError,
      bookmarkedIds,
      bookmarksLoading,
      refresh,
      refreshBookmarks,
      signOut,
      toggleBookmark,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  return context ?? anonymousSession;
}
