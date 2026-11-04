import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_CACHE_TAG } from "@/lib/gateway/cache";

function secretsMatch(received: string | null, expected: string): boolean {
  if (!received) return false;

  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function POST(request: NextRequest) {
  const expectedSecret = process.env.CACHE_REVALIDATION_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Catalog cache invalidation is not configured" },
      { status: 503 },
    );
  }

  if (!secretsMatch(request.headers.get("x-revalidation-secret"), expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(CATALOG_CACHE_TAG, "max");
  return NextResponse.json({ revalidated: true, tag: CATALOG_CACHE_TAG });
}
