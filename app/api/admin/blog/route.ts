export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listAllPosts, upsertBlogPost } from "@/lib/db/blog";
import type { BlogPost } from "@/lib/types";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async () => {
    try {
      return NextResponse.json(await listAllPosts());
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.blog.list
);

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as Partial<BlogPost> & { title: string };
      if (!body.title?.trim()) {
        return NextResponse.json({ error: "Başlık zorunlu." }, { status: 400 });
      }
      const post = await upsertBlogPost(body);
      return NextResponse.json(post, { status: 201 });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.blog.write
);
