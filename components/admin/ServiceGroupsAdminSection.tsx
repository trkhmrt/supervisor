"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import type { Service, ServiceGroupWithStats } from "@/lib/types";

type Props = {
  supervisorId: string;
  services: Service[];
};

export function ServiceGroupsAdminSection({ supervisorId, services }: Props) {
  const groupServices = services.filter((s) => s.isGroupService);
  const [selectedServiceId, setSelectedServiceId] = useState(groupServices[0]?.id ?? "");
  const [groups, setGroups] = useState<ServiceGroupWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    capacity: "20",
    seatLabel: "",
    sortOrder: "0",
  });

  const load = useCallback(async () => {
    if (!selectedServiceId) {
      setGroups([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/supervisors/${supervisorId}/service-groups?serviceId=${selectedServiceId}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gruplar yüklenemedi");
      setGroups(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [supervisorId, selectedServiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!groupServices.length) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedServiceId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/supervisors/${supervisorId}/service-groups`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          name: form.name.trim(),
          capacity: Number(form.capacity) || 20,
          seatLabel: form.seatLabel.trim() || undefined,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Grup oluşturulamadı");
      setForm({ name: "", capacity: "20", seatLabel: "", sortOrder: "0" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grup oluşturulamadı");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(group: ServiceGroupWithStats) {
    try {
      const res = await fetch(
        `/api/admin/supervisors/${supervisorId}/service-groups/${group.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !group.active }),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Güncellenemedi");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi");
    }
  }

  async function removeGroup(groupId: string) {
    if (!confirm("Bu grubu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(
        `/api/admin/supervisors/${supervisorId}/service-groups/${groupId}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Silinemedi");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
    }
  }

  return (
    <div className="card-premium">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-navy-600" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900">
          Grup Hizmetleri
        </h2>
      </div>

      <select
        value={selectedServiceId}
        onChange={(e) => setSelectedServiceId(e.target.value)}
        className="mb-4 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
      >
        {groupServices.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {error && (
        <p className="mb-4 rounded-premium border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-navy-400" />
        </div>
      ) : groups.length === 0 ? (
        <p className="mb-4 text-sm text-clinical-muted">Henüz grup tanımlanmamış.</p>
      ) : (
        <ul className="mb-6 divide-y divide-clinical-border">
          {groups.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <span className="font-semibold text-navy-900">{g.name}</span>
                {g.seatLabel && (
                  <span className="ml-2 text-xs text-clinical-muted">({g.seatLabel})</span>
                )}
                <p className="mt-0.5 text-xs text-clinical-muted">
                  {g.enrolledCount}/{g.capacity} kişi
                  {g.isFull ? " · Dolu" : ` · ${g.remainingSeats} boş yer`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleActive(g)}
                  className="rounded border border-clinical-border px-2 py-1 text-[10px] font-bold uppercase"
                >
                  {g.active ? "Pasif" : "Aktif"}
                </button>
                <button
                  type="button"
                  onClick={() => void removeGroup(g.id)}
                  className="p-1.5 text-clinical-muted hover:text-red-600"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Grup adı (örn. 1. Grup)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-premium border border-clinical-border px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          required
          type="number"
          min={1}
          placeholder="Kapasite"
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
        <input
          placeholder="Koltuk etiketi (örn. 1-20)"
          value={form.seatLabel}
          onChange={(e) => setForm((f) => ({ ...f, seatLabel: e.target.value }))}
          className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Sıra"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          className="rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving || !selectedServiceId}
          className="btn-navy py-2 px-4 text-xs sm:col-span-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Grup Ekle
        </button>
      </form>
    </div>
  );
}
