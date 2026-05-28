"use client";

import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SupervisorApplication } from "@/lib/types";

type Props = {
  applications: SupervisorApplication[];
  invitingId: string | null;
  onInvite: (id: string) => Promise<void>;
  embedded?: boolean;
};

export function SupervisorApplicationsCard({
  applications,
  invitingId,
  onInvite,
  embedded = false,
}: Props) {
  const list = (
    <div className="divide-y divide-clinical-border">
      {applications.length === 0 ? (
        <p className="py-8 text-center text-clinical-muted text-sm">Kayıt bulunamadı.</p>
      ) : (
        applications.map((app) => (
          <div
            key={app.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-sm font-bold text-navy-900">{app.fullName}</div>
              <div className="text-sm text-clinical-muted">{app.email}</div>
              {app.phone && (
                <div className="text-sm text-clinical-muted">{app.phone}</div>
              )}
              {app.message && (
                <p className="mt-1 text-xs text-clinical-muted line-clamp-2">{app.message}</p>
              )}
              <div className="text-[10px] text-clinical-muted uppercase font-bold tracking-widest mt-1">
                {formatDate(app.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                  app.status === "invited"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : app.status === "rejected"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                }`}
              >
                {app.status === "invited"
                  ? "Davet gönderildi"
                  : app.status === "rejected"
                    ? "Reddedildi"
                    : "Bekliyor"}
              </span>
              {app.status === "pending" && (
                <button
                  type="button"
                  disabled={invitingId === app.id}
                  onClick={() => onInvite(app.id)}
                  className="btn-navy py-2 px-4 text-[10px] disabled:opacity-50"
                >
                  {invitingId === app.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Davet gönder"
                  )}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (embedded) return <div className="card-premium">{list}</div>;

  return (
    <div className="card-premium mb-8">
      <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8">
        Süpervizör Talepleri
      </h3>
      {list}
    </div>
  );
}
