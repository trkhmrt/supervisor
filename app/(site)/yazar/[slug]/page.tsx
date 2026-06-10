import { notFound } from "next/navigation";
import { getAuthorWithPosts } from "@/lib/db/authors";
import { getFounderContentByAuthorSlug } from "@/lib/db/founder-profile";
import { safeGetSupervisorById } from "@/lib/db/queries";
import { isFounderAuthor } from "@/lib/content/founder-profile";
import { AuthorProfileClient } from "./AuthorProfileClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAuthorWithPosts(slug);
  if (!data) notFound();

  let supervisor = null;
  if (data.author.supervisorId) {
    const result = await safeGetSupervisorById(data.author.supervisorId);
    supervisor = result.data;
  }

  const founderContent = isFounderAuthor(slug)
    ? await getFounderContentByAuthorSlug(slug)
    : null;

  return (
    <AuthorProfileClient
      author={data.author}
      posts={data.posts}
      supervisor={supervisor}
      founderContent={founderContent}
    />
  );
}
