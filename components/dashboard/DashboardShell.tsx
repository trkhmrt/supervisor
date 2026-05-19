"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  Layers,
  Calendar,
  User,
  Settings,
  BookOpen,
  ClipboardList,
  Loader2,
  type LucideIcon,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
  ExternalLink,
  Newspaper,
  Shield,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { DASHBOARD_BASE, type DashboardNavId } from "@/lib/dashboard/navigation";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<DashboardNavId, LucideIcon> = {
  overview: LayoutDashboard,
  "supervisors-manage": UserPlus,
  "supervisor-apply": UserPlus,
  "supervisor-browse": ExternalLink,
  supervisors: UserPlus,
  services: Layers,
  appointments: Calendar,
  courses: BookOpen,
  availability: Calendar,
  enrollments: ClipboardList,
  blog: Newspaper,
  admins: Shield,
  profile: User,
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const logout = useAppStore((s) => s.logout);
  const settings = useAppStore((s) => s.settings);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { navItems, user, shellReady, navLoading } = useDashboardAccess();

  async function handleLogout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      logout();
      window.location.assign("/giris");
    } catch {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const subtitle = user?.role === "admin" ? "Admin Panel" : "Yönetim Paneli";

  const SidebarContent = (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <Link href={DASHBOARD_BASE} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-navy-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-tight">
              {user?.role === "admin" ? "Süpervizyon" : settings.siteName}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400">
              {subtitle}
            </div>
          </div>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="p-2 text-navy-400 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-premium bg-white/10"
                aria-hidden
              />
            ))
          : navItems.map((item) => {
              const Icon = NAV_ICONS[item.id];
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-premium px-4 py-3 text-sm font-bold transition-all",
                    active
                      ? "bg-white text-navy-950 shadow-lg"
                      : "text-navy-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active ? "text-navy-950" : "text-navy-500 group-hover:text-navy-300"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        <Link
          href="/supervizorler"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-premium px-4 py-3 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> Siteyi Görüntüle
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-premium px-4 py-3 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" /> Ana Sayfa
        </Link>
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-premium px-4 py-3 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {signingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-clinical-light">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:flex">
        {SidebarContent}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85%] overflow-hidden lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-clinical-border bg-white/80 px-6 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="p-2 text-navy-900">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-display font-bold text-navy-900">Dashboard</div>
          <Link href={`${DASHBOARD_BASE}/profil`} className="p-2 text-navy-500">
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <header className="sticky top-0 z-20 hidden h-20 shrink-0 border-b border-clinical-border bg-white/90 px-10 backdrop-blur lg:flex lg:items-center">
          <div className="flex w-full items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-clinical-muted">
                Hoş geldiniz
              </p>
              <p className="mt-1 font-display text-lg font-bold leading-tight text-navy-900">
                {user?.fullName ?? "—"}
              </p>
            </div>
            <Link
              href={`${DASHBOARD_BASE}/profil`}
              className="btn-outline-navy shrink-0 px-5 py-2.5 text-xs"
            >
              <Settings className="h-4 w-4" /> Profil
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {!shellReady ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
