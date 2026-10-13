import type { Metadata } from "next";
import AccountExperience from "@/features/auth/AccountExperience";

export const metadata: Metadata = {
  title: "Sign in or create an account | HPC Learning Hub",
  description: "Optional account access for bookmarks and personal learning paths.",
};

interface AccountPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountsPage({ searchParams }: Readonly<AccountPageProps> = {}) {
  const params = searchParams ? await searchParams : {};
  const returnTo = typeof params.next === "string" ? params.next : undefined;
  return (
    <AccountExperience initialMode={params.mode === "create" ? "create" : "signin"} returnTo={returnTo} />
  );
}
