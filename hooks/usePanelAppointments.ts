"use client";

import { useCallback, useEffect, useState } from "react";
import { panelFetch, panelErrorMessage } from "@/lib/panel-client";
import type { Appointment, User } from "@/lib/types";

type AppointmentListResponse = {
  items: Appointment[];
  hasMore: boolean;
  nextOffset: number | null;
};

type UsePanelAppointmentsOptions = {
  limit?: number;
};

export function usePanelAppointments(
  user: User | null,
  options: UsePanelAppointmentsOptions = {}
) {
  const pageSize = options.limit ?? 20;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      if (!user) {
        setAppointments([]);
        setHasMore(false);
        setNextOffset(null);
        setLoading(false);
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await panelFetch(
          user,
          `/api/panel/appointments?limit=${pageSize}&offset=${offset}`
        );
        if (!res.ok) throw new Error(await panelErrorMessage(res, "Randevular yüklenemedi"));
        const data = (await res.json()) as AppointmentListResponse;
        setAppointments((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.hasMore);
        setNextOffset(data.nextOffset);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Randevular yüklenemedi");
        if (!append) setAppointments([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, pageSize]
  );

  const reload = useCallback(async () => {
    await fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || nextOffset === null) return;
    await fetchPage(nextOffset, true);
  }, [fetchPage, hasMore, loadingMore, nextOffset]);

  useEffect(() => {
    void fetchPage(0, false);
  }, [fetchPage]);

  /** Sekmeye dönünce listeyi yenile (eski önbellek sorununu önler) */
  useEffect(() => {
    if (!user) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, reload]);

  const cancelAppointment = useCallback(
    async (id: string) => {
      if (!user) return false;
      try {
        const res = await panelFetch(user, `/api/panel/appointments/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled" }),
        });
        if (!res.ok) throw new Error(await panelErrorMessage(res, "İptal edilemedi"));
        await reload();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "İptal edilemedi");
        return false;
      }
    },
    [user, reload]
  );

  return {
    appointments,
    loading,
    loadingMore,
    hasMore,
    error,
    reload,
    loadMore,
    cancelAppointment,
  };
}
