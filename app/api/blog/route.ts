export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/lib/db/blog";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export async function GET() {
  try {
    return NextResponse.json(await listPublishedPosts());
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
