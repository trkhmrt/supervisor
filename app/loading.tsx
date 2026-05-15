import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f0f0] px-6">
      <div className="w-full max-w-md rounded-premium border border-clinical-border bg-white/70 p-8 text-center shadow-premium backdrop-blur">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-clinical-border bg-white">
          <div className="site-loader-ring flex h-11 w-11 items-center justify-center rounded-full border-2 border-black border-t-[#d1f90b]">
            <ShieldCheck className="h-5 w-5 text-black" />
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-clinical-muted">
          Supervizyon Yukleniyor
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-black">
          Icerik hazirlaniyor
        </h2>
        <p className="mt-2 text-sm text-clinical-muted">
          Sayfa ve veriler hizli bir sekilde getiriliyor.
        </p>

        <div className="site-loader-progress relative mt-6 h-1.5 overflow-hidden rounded-full bg-black/10" />
      </div>
    </main>
  );
}
