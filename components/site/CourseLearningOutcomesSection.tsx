import { CheckCircle2 } from "lucide-react";

type CourseLearningOutcomesSectionProps = {
  items: string[];
  title?: string;
};

export function CourseLearningOutcomesSection({
  items,
  title = "Neler öğreneceksiniz",
}: CourseLearningOutcomesSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <span className="eyebrow-premium">{title}</span>
      <div className="card-premium mt-6 !p-6 md:!p-8">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
              <span className="text-sm font-medium leading-relaxed text-navy-900">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
