"use client";

import { gatewayBrowserFetch } from "@/lib/gateway/browser-client";

export interface AccountSummary {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface LoginChallenge {
  challengeId: string;
  expiresAt: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export async function registerAccount(input: {
  email: string;
  username: string;
  password: string;
}) {
  return gatewayBrowserFetch<AccountSummary>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function requestLoginCode(input: LoginInput) {
  return gatewayBrowserFetch<LoginChallenge>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyLoginCode(input: {
  challengeId: string;
  code: string;
}) {
  return gatewayBrowserFetch("/auth/verify-login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentAccount() {
  return gatewayBrowserFetch<AccountSummary>("/me");
}

export async function logout() {
  return gatewayBrowserFetch("/auth/logout", { method: "POST" });
}
