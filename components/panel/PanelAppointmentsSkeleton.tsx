export function PanelAppointmentsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="card-premium flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 rounded bg-clinical-border" />
            <div className="h-5 w-48 rounded bg-clinical-border" />
            <div className="h-3 w-64 rounded bg-clinical-border" />
          </div>
          <div className="h-9 w-28 rounded bg-clinical-border" />
        </div>
      ))}
    </div>
  );
}
