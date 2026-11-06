import FeedbackForm from "@/features/feedback/FeedbackForm";

export default async function FeedbackPage({ searchParams }: Readonly<{ searchParams: Promise<{ returnTo?: string | string[] }> }>) {
  const { returnTo } = await searchParams;
  return <FeedbackForm returnTo={typeof returnTo === "string" ? returnTo : undefined} />;
}
