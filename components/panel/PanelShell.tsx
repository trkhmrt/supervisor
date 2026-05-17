"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  UserPlus,
  Layers,
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { canListServices, canListSupervisors } from "@/lib/auth/access";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";

const nav = [
  { href: "/panelim", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  {
    href: "/panelim/supervizorler",
    label: "Süpervizör Yönetimi",
    icon: UserPlus,
    requires: canListSupervisors,
  },
  {
    href: "/panelim/supervizorler",
    label: "Süpervizör Ekle",
    icon: UserPlus,
    requires: (u: SessionUser | null) => !canListSupervisors(u),
  },
  {
    href: "/supervizorler",
    label: "Süpervizörler",
    icon: ExternalLink,
    requires: (u: SessionUser | null) => !canListSupervisors(u),
  },
  { href: "/panelim/hizmetler", label: "Hizmet Yönetimi", icon: Layers, requires: canListServices },
  { href: "/panelim/randevular", label: "Randevularım", icon: Calendar },
  { href: "/panelim/profil", label: "Profil", icon: User },
];

export function PanelShell({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const authReady = useAppStore((s) => s.authReady);
  const logout = useAppStore((s) => s.logout);
  const settings = useAppStore((s) => s.settings);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!user) router.push("/giris");
    else if (user.role === "admin") router.push("/adminpanel");
  }, [user, authReady, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-clinical-light">
        <p className="text-sm text-clinical-muted">Yükleniyor…</p>
      </div>
    );
  }

  if (!user || user.role === "admin") return null;

  const sessionUser = user as SessionUser;
  const visibleNav = nav.filter((item) => !item.requires || item.requires(sessionUser));

  const SidebarContent = (
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <Link href="/panelim" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-navy-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-tight">{settings.siteName}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400">
              Yönetim Paneli
            </div>
          </div>
        </Link>
        <button type="button" onClick={() => setOpen(false)} className="p-2 text-navy-400 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
          onClick={() => {
            void signOut().then(() => {
              logout();
              router.push("/");
            });
          }}
          className="flex w-full items-center gap-3 rounded-premium px-4 py-3 text-xs font-bold text-black/80 transition-all hover:bg-black/10"
        >
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-clinical-light lg:flex">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
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

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-clinical-border bg-white/80 px-6 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="p-2 text-navy-900">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-display font-bold text-navy-900">Panelim</div>
          <Link href="/panelim/profil" className="p-2 text-navy-500">
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        <header className="sticky top-0 z-20 hidden border-b border-clinical-border bg-white/90 px-10 py-5 backdrop-blur lg:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                Hoş geldiniz
              </p>
              <p className="font-display text-lg font-bold text-navy-900">{user.fullName}</p>
            </div>
            <Link href="/panelim/profil" className="btn-outline-navy py-2 px-5 text-xs">
              <Settings className="h-4 w-4" /> Profil
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
