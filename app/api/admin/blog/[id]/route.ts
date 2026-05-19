export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { deleteBlogPost, upsertBlogPost } from "@/lib/db/blog";
import type { BlogPost } from "@/lib/types";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const body = (await req.json()) as Partial<BlogPost>;
      const post = await upsertBlogPost({ ...body, id, title: body.title ?? "Yazı" });
      return NextResponse.json(post);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.blog.write
);

export const DELETE = withAuth(
  async (_req, _auth, ctx: Ctx) => {
    try {
      const { id } = await ctx.params;
      const ok = await deleteBlogPost(id);
      if (!ok) {
        return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.blog.write
);
