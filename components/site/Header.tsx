"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, UserCircle, ShieldCheck, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/hizmetler", label: "Hizmetler", hasDropdown: true },
  { href: "/supervizorler", label: "Süpervizörler" },
  { href: "/hakkimizda", label: "Kurumsal" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const siteName = useAppStore((s) => s.settings.siteName);
  const services = useAppStore((s) => s.services.filter((x) => x.active));

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdownOpen(null);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-clinical-white/95 backdrop-blur-md border-b border-clinical-border py-4 shadow-sm"
            : "bg-transparent py-6"
        )}
      >
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-navy-900 rounded-premium flex items-center justify-center text-clinical-white transition-transform group-hover:scale-105">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-navy-900 leading-none">
                {siteName}
              </span>
              <span className="mt-1 inline-block rounded-sm bg-[#d1f90b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                Clinical Platform
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => {
              const active = pathname.startsWith(n.href);
              
              if (n.hasDropdown) {
                return (
                  <div 
                    key={n.href}
                    className="relative group/dropdown"
                    onMouseEnter={() => setDropdownOpen(n.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                  >
                    <Link
                      href={n.href}
                      className={cn(
                        "hover-link flex items-center gap-1 pb-1 text-sm font-bold tracking-wide transition-colors",
                        dropdownOpen === n.label && "hover-link-active",
                        active
                          ? "hover-link-active text-black"
                          : "text-clinical-muted hover:text-black"
                      )}
                    >
                      {n.label}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", dropdownOpen === n.label && "rotate-180")} />
                    </Link>

                    <AnimatePresence>
                      {dropdownOpen === n.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.98 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="absolute left-0 top-full pt-4 w-64"
                        >
                          <div className="overflow-hidden rounded-premium border border-black/10 bg-white p-2 shadow-xl">
                            {services.map((s) => (
                              <Link
                                key={s.id}
                                href={`/hizmetler/${s.slug}`}
                                className="flex flex-col gap-1 p-3 rounded-xl hover:bg-navy-50 transition-colors group/item"
                              >
                                <span className="text-sm font-bold text-navy-900 group-hover/item:text-navy-700">
                                  {s.name}
                                </span>
                                <span className="text-xs text-clinical-muted line-clamp-1">
                                  {s.shortDescription}
                                </span>
                              </Link>
                            ))}
                            <div className="mt-2 pt-2 border-t border-clinical-border">
                              <Link
                                href="/hizmetler"
                                className="flex items-center justify-center p-2 text-xs font-bold text-navy-600 hover:text-navy-900 transition-colors"
                              >
                                Tüm Hizmetleri Gör
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "hover-link pb-1 text-sm font-bold tracking-wide transition-colors",
                    active
                      ? "hover-link-active text-black"
                      : "text-clinical-muted hover:text-black"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href={user.role === "admin" ? "/admin" : "/panelim"}
                  className="flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-navy-600 transition-colors"
                >
                  <UserCircle className="h-5 w-5" />
                  {user.fullName.split(" ")[0]}
                </Link>
                <button 
                  onClick={logout} 
                  className="text-xs font-bold uppercase tracking-widest text-clinical-muted hover:text-black transition-colors"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <>
                <Link href="/giris" className="text-sm font-bold text-navy-900 hover:text-navy-600 transition-colors">
                  Giriş
                </Link>
                <Link href="/kayit" className="btn-navy py-2 px-5">
                  Başla
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-navy-900"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-clinical-white flex flex-col"
          >
            <div className="container-wide flex items-center justify-between py-6 border-b border-clinical-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-900 rounded-premium flex items-center justify-center text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="font-display text-xl font-bold text-navy-900">{siteName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-navy-900">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col justify-center items-center gap-6 overflow-y-auto py-10">
              {nav.map((n) => (
                <div key={n.href} className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={n.href}
                      className="text-2xl font-display font-bold text-navy-900 hover:text-navy-600 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {n.label}
                    </Link>
                    {n.hasDropdown && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setMobileExpanded(mobileExpanded === n.label ? null : n.label);
                        }}
                        className="p-2 text-navy-900"
                      >
                        <ChevronDown className={cn("h-6 w-6 transition-transform", mobileExpanded === n.label && "rotate-180")} />
                      </button>
                    )}
                  </div>

                  {n.hasDropdown && mobileExpanded === n.label && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="flex flex-col items-center gap-3 overflow-hidden"
                    >
                      {services.map((s) => (
                        <Link
                          key={s.id}
                          href={`/hizmetler/${s.slug}`}
                          className="text-lg font-medium text-clinical-muted hover:text-navy-900 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          {s.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-10 border-t border-clinical-border flex flex-col gap-4">
              {user ? (
                <Link href="/panelim" className="btn-navy w-full text-center">Panelim</Link>
              ) : (
                <>
                  <Link href="/kayit" className="btn-navy w-full text-center">Kayıt Ol</Link>
                  <Link href="/giris" className="btn-outline-navy w-full text-center">Giriş Yap</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
