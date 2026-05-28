import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Calendar, Users } from "lucide-react";
import { getPublicCourseBySlug } from "@/lib/db/courses";
import { formatDate } from "@/lib/utils";
import { CourseApplyButton } from "./CourseApplyButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function EgitimDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  return (
    <>
      <section className="bg-navy-950 text-white pt-site-hero pb-16">
        <div className="container-wide">
          <Link
            href="/egitimler"
            className="text-navy-400 text-xs font-bold uppercase tracking-widest hover:text-white mb-8 inline-block"
          >
            ← Tüm eğitimler
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold max-w-3xl">{course.title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-navy-300">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {course.supervisorName}
            </span>
            {course.startsAt && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(course.startsAt)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-wide grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="prose prose-navy max-w-none">
              <p className="text-lg text-clinical-text leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="card-premium sticky top-32 p-6">
              <BookOpen className="h-8 w-8 text-navy-600 mb-4" />
              <h2 className="font-bold text-navy-900 mb-4">Başvuru</h2>
              {course.maxParticipants != null && (
                <p className="text-sm text-clinical-muted mb-4">
                  Kayıtlı: {course.enrollmentCount ?? 0} / {course.maxParticipants}
                </p>
              )}
              {course.acceptsApplications ? (
                <CourseApplyButton courseId={course.id} />
              ) : (
                <p className="text-sm text-clinical-muted">Bu programa şu an başvuru alınmıyor.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
