"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/features/auth/SessionProvider";
import type { LearnerRequest } from "@/features/auth/api";
import { getProfile, saveProfile, type LearnerProfile } from "./api";

interface ProfileState {
  request: LearnerRequest;
  profile?: LearnerProfile;
  failed?: boolean;
}

interface ProfileContext {
  profile?: LearnerProfile;
  failed?: boolean;
  retry?: () => void;
  save?: (name: string | null) => Promise<void>;
}

const Context = createContext<ProfileContext>({});

export function LearnerProfileProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { privateRequest } = useSession();
  const [state, setState] = useState<ProfileState>();
  const [attempt, setAttempt] = useState(0);
  const current =
    privateRequest && state?.request === privateRequest ? state : undefined;

  useEffect(() => {
    if (!privateRequest) return;
    let active = true;
    void getProfile(privateRequest)
      .then((profile) => {
        if (active) setState({ request: privateRequest, profile });
        return undefined;
      })
      .catch(() => {
        if (active) setState({ request: privateRequest, failed: true });
      });
    return () => {
      active = false;
    };
  }, [privateRequest, attempt]);

  const profile = current?.profile;
  const value: ProfileContext = {
    profile,
    failed: current?.failed,
    retry: () => {
      setState(undefined);
      setAttempt((previous) => previous + 1);
    },
    save:
      privateRequest && profile
        ? async (name) => {
            const updated = await saveProfile(
              privateRequest,
              name,
              profile.topics,
            );
            setState((latest) =>
              latest?.request === privateRequest
                ? { request: privateRequest, profile: updated }
                : latest,
            );
          }
        : undefined,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLearnerProfile() {
  return useContext(Context);
}
