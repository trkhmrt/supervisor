"use client";

import { useEffect, useRef, useState } from "react";
import type { Supervisor } from "@/lib/types";

/** Veritabanından süpervizör listesi; hata veya 503 durumunda `fallback` kullanılır. */
export function useRemoteSupervisors(fallback: Supervisor[]) {
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const [supervisors, setSupervisors] = useState<Supervisor[]>(() => fallbackRef.current);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/supervisors")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Supervisor[]) => {
        if (!cancelled) setSupervisors(data);
      })
      .catch(() => {
        if (!cancelled) setSupervisors(fallbackRef.current);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return supervisors;
}
