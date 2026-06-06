import { notFound } from "next/navigation";
import { getPublicCourseBySlug } from "@/lib/db/courses";
import { EgitimDetailClient } from "./EgitimDetailClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EgitimDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  return <EgitimDetailClient course={course} />;
}
