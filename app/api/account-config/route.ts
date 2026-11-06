export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { enabled: process.env.ENABLE_ACCOUNTS === "true" },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
