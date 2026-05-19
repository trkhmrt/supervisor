export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/db/blog";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const post = await getPostBySlug(slug);
    if (!post || !post.published) {
      return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}
