"use client";

import { useEffect, useRef, useState } from "react";
import type { Service } from "@/lib/types";

/** Aktif hizmetler (API); hata durumunda yalnızca aktif olan `fallback` öğeleri. */
export function useRemoteServices(fallback: Service[]) {
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const [services, setServices] = useState<Service[]>(() =>
    fallbackRef.current.filter((s) => s.active)
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Service[]) => {
        if (!cancelled) setServices(data);
      })
      .catch(() => {
        if (!cancelled) setServices(fallbackRef.current.filter((s) => s.active));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return services;
}
