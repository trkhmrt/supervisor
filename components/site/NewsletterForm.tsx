"use client";

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "exists">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = (await res.json()) as { created?: boolean };
      if (!res.ok) {
        setStatus("idle");
        return;
      }
      setStatus(j.created === false ? "exists" : "ok");
      if (j.created !== false) setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        placeholder="E-posta adresiniz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-premium border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-navy-400 focus:border-white/30 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "ok"}
        className="flex items-center gap-2 rounded-premium bg-white px-6 py-3 text-sm font-bold text-navy-950 hover:bg-navy-50 disabled:opacity-70"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "ok" ? (
          <Check className="h-4 w-4" />
        ) : (
          <>
            <span className="hidden sm:inline">Abone Ol</span>
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
