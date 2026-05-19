import { PanelAppointmentsSkeleton } from "@/components/panel/PanelAppointmentsSkeleton";

export default function RandevularLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 h-9 w-48 rounded bg-clinical-border" />
          <div className="h-4 w-72 rounded bg-clinical-border" />
        </div>
        <div className="h-10 w-40 rounded bg-clinical-border" />
      </div>
      <div className="mb-4 h-4 w-32 rounded bg-clinical-border" />
      <PanelAppointmentsSkeleton rows={5} />
    </div>
  );
}
