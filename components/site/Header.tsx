"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X, LogOut, UserCircle, ShieldCheck, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "@/lib/auth/client";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/hizmetler", label: "Hizmetler", hasDropdown: true },
  { href: "/egitimler", label: "Eğitimler" },
  { href: "/supervizorler", label: "Süpervizörler" },
  { href: "/hakkimizda", label: "Kurumsal" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

/** Sayfa üstünde koyu hero (bg-navy-950) var — şeffaf header'da açık metin gerekir */
function isDarkHeroPath(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname.startsWith("/giris") || pathname.startsWith("/kayit")) return false;
  return true;
}

const SITE_HEADER_VAR = "--site-header-h";

export function Header({ services = [] }: { services?: Service[] }) {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const siteName = useAppStore((s) => s.settings.siteName);

  async function handleLogout() {
    await signOut();
    logout();
    window.location.assign("/giris");
  }

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

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el || typeof document === "undefined") return;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(SITE_HEADER_VAR, `${h}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.setProperty(SITE_HEADER_VAR, "5.5rem");
    };
  }, [scrolled, pathname]);

  const onDarkHero = isDarkHeroPath(pathname);
  const lightText = onDarkHero && !scrolled;

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed top-[var(--phone-reminder-banner-h,0px)] z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-clinical-white/95 backdrop-blur-md border-b border-clinical-border py-4 shadow-sm"
            : "bg-transparent py-6"
        )}
      >
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-premium transition-transform group-hover:scale-105",
                lightText ? "bg-white text-navy-900" : "bg-navy-900 text-clinical-white"
              )}
            >
              <ShieldCheck className="h-6 w-6" />
            </motion.div>
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-display text-xl font-bold leading-none tracking-tight transition-colors",
                  lightText ? "text-white" : "text-navy-900"
                )}
              >
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
                        lightText
                          ? active
                            ? "hover-link-active text-white"
                            : "text-white/75 hover:text-white"
                          : active
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
                                className="block p-3 rounded-xl text-sm font-bold text-navy-900 hover:bg-navy-50 hover:text-navy-700 transition-colors"
                              >
                                {s.name}
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
                    lightText
                      ? active
                        ? "hover-link-active text-white"
                        : "text-white/75 hover:text-white"
                      : active
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
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 text-sm font-bold transition-colors",
                    lightText ? "text-white hover:text-white/80" : "text-navy-900 hover:text-navy-600"
                  )}
                >
                  <UserCircle className="h-5 w-5" />
                  {user.fullName.split(" ")[0]}
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-colors",
                    lightText
                      ? "text-white/90 hover:text-white"
                      : "text-navy-900 hover:text-navy-600"
                  )}
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/giris"
                  className={cn(
                    "text-sm font-bold transition-colors",
                    lightText ? "text-white hover:text-white/80" : "text-navy-900 hover:text-navy-600"
                  )}
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className={cn("py-2 px-5", lightText ? "btn-white" : "btn-navy")}
                >
                  Başla
                </Link>
              </>
            )}
          </div>

          <button
            className={cn("p-2 lg:hidden", lightText ? "text-white" : "text-navy-900")}
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
                <Link href="/dashboard" className="btn-navy w-full text-center">Dashboard</Link>
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
