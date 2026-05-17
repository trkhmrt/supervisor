"use client";

import { useCallback, useEffect, useState } from "react";
import type { Service } from "@/lib/types";

export type RemoteFetchState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Aktif hizmetler — yalnızca `/api/services` (veritabanı). Mock/store kullanılmaz. */
export function useRemoteServices(): RemoteFetchState<Service[]> {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    fetch("/api/services")
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(typeof j.error === "string" ? j.error : "Hizmetler yüklenemedi");
        }
        return r.json() as Promise<Service[]>;
      })
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setData([]);
          setError(e instanceof Error ? e.message : "Hizmetler yüklenemedi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  return { data, loading, error, reload: load };
}
