"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (newPassword !== confirm) {
          setError("Yeni şifreler eşleşmiyor.");
          return;
        }
        if (newPassword.length < 6) {
          setError("Yeni şifre en az 6 karakter olmalı.");
          return;
        }
        setLoading(true);
        try {
          const res = await fetch("/api/auth/change-password", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
          });
          const j = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(j.error ?? "Şifre güncellenemedi");
          setMessage("Şifreniz güncellendi.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirm("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Şifre güncellenemedi");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
          Mevcut şifre
        </label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-premium border border-clinical-border px-4 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
          Yeni şifre
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-premium border border-clinical-border px-4 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
          Yeni şifre (tekrar)
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-premium border border-clinical-border px-4 py-2 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-outline-navy w-full py-2 text-xs disabled:opacity-50"
      >
        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Şifreyi Güncelle"}
      </button>
    </form>
  );
}
