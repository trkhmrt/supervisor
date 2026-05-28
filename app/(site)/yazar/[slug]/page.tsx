import { notFound } from "next/navigation";
import { getAuthorWithPosts } from "@/lib/db/authors";
import { AuthorProfileClient } from "./AuthorProfileClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAuthorWithPosts(slug);
  if (!data) notFound();

  return <AuthorProfileClient author={data.author} posts={data.posts} />;
}
