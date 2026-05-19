import { PanelAppointmentsSkeleton } from "@/components/panel/PanelAppointmentsSkeleton";

export default function PanelimLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 h-9 w-56 rounded bg-clinical-border" />
      <div className="mb-10 h-4 w-80 max-w-full rounded bg-clinical-border" />
      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <div className="card-premium h-28" />
        <div className="card-premium h-28" />
      </div>
      <PanelAppointmentsSkeleton rows={3} />
    </div>
  );
}
