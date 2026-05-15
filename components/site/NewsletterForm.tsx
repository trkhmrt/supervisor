"use client";

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "exists">("idle");
  const addNewsletter = useAppStore((s) => s.addNewsletter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    
    setStatus("loading");
    
    // Simulate network delay for premium feel
    setTimeout(() => {
      const ok = addNewsletter(email);
      setStatus(ok ? "ok" : "exists");
      if (ok) setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        placeholder="E-posta adresiniz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-white/5 border border-white/10 rounded-premium px-5 py-3 text-sm text-white placeholder-navy-400 focus:outline-none focus:border-white/30 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "ok"}
        className="bg-white text-navy-950 px-6 py-3 rounded-premium text-sm font-bold flex items-center gap-2 hover:bg-navy-50 transition-colors disabled:opacity-70"
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
