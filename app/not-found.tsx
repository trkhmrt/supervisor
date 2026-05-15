import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-[#f1f0f0] px-6 py-16">
      <div className="container-wide">
        <div className="mx-auto grid max-w-5xl gap-10 rounded-premium border border-clinical-border bg-white/75 p-8 shadow-premium backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <section>
            <span className="inline-block rounded-md bg-[#d1f90b] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black">
              404 - Sayfa Bulunamadi
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-black md:text-5xl">
              Aradiginiz sayfaya ulasilamadi.
            </h1>
            <p className="mt-4 max-w-xl text-base text-clinical-muted">
              Link degismis, kaldirilmis veya hatali yazilmis olabilir. Ana akisa geri
              donerek supervizyon planinizi kesintisiz surdurebilirsiniz.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="btn-navy">
                <Home className="h-4 w-4" />
                Ana Sayfaya Don
              </Link>
              <Link href="/hizmetler" className="btn-outline-navy">
                <Search className="h-4 w-4" />
                Hizmetleri Incele
              </Link>
            </div>
          </section>

          <aside className="rounded-premium border border-clinical-border bg-[#f1f0f0] p-6">
            <h2 className="font-display text-2xl font-bold text-black">Ne yapabilirsiniz?</h2>
            <ul className="mt-5 space-y-3 text-sm text-clinical-muted">
              <li className="rounded-md border border-clinical-border bg-white px-3 py-2">
                URL adresini kontrol edin.
              </li>
              <li className="rounded-md border border-clinical-border bg-white px-3 py-2">
                Ust menuden ilgili bolume gecin.
              </li>
              <li className="rounded-md border border-clinical-border bg-white px-3 py-2">
                Hizmet veya supervizorler listesinden devam edin.
              </li>
            </ul>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-black/80 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Guvenli sekilde geri don
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
