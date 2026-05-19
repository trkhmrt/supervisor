"use client";

import { cn } from "@/lib/utils";

export type AdminTab = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function AdminTabBar({ tabs, active, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 border-b border-clinical-border mb-8",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-3 text-xs font-bold uppercase tracking-widest transition border-b-2 -mb-px",
            active === tab.id
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-clinical-muted hover:text-navy-900"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "ml-2 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-[10px]",
                active === tab.id ? "bg-navy-900 text-white" : "bg-clinical-light text-clinical-muted"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
