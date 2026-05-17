"use client";

import { useCallback, useEffect, useState } from "react";
import type { Supervisor } from "@/lib/types";

export type RemoteFetchState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Süpervizör listesi — yalnızca `/api/supervisors` (veritabanı). Mock/store kullanılmaz. */
export function useRemoteSupervisors(): RemoteFetchState<Supervisor[]> {
  const [data, setData] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    fetch("/api/supervisors")
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(typeof j.error === "string" ? j.error : "Süpervizörler yüklenemedi");
        }
        return r.json() as Promise<Supervisor[]>;
      })
      .then((list) => {
        if (!cancelled) setData(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setData([]);
          setError(e instanceof Error ? e.message : "Süpervizörler yüklenemedi");
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
