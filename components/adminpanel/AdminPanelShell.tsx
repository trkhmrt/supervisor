"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  Shield,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hasUserScope } from "@/lib/auth/access";
import { useAppStore, useCurrentUser } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

const nav = [
  { href: "/adminpanel", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/adminpanel/supervizorler", label: "Süpervizörler", icon: UserPlus, scope: "supervisors:list" },
  { href: "/adminpanel/kullanicilar", label: "Alt Adminler", icon: Shield, scope: "admins:list" },
  { href: "/adminpanel/profil", label: "Profil", icon: User },
];

export function AdminPanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser() as SessionUser | null;
  const authReady = useAppStore((s) => s.authReady);
  const logoutStore = useAppStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/adminpanel/giris") return;
    if (!authReady) return;
    if (!user || user.role !== "admin") {
      router.replace("/adminpanel/giris");
    }
  }, [pathname, router, authReady, user]);

  if (pathname === "/adminpanel/giris") {
    return <>{children}</>;
  }

  if (!authReady || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-clinical-light">
        <p className="text-sm text-clinical-muted">Yükleniyor…</p>
      </div>
    );
  }

  const visibleNav = nav.filter((n) => !n.scope || hasUserScope(user, n.scope));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    logoutStore();
    router.replace("/adminpanel/giris");
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-navy-950 text-white p-6">
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-navy-400">Yönetim</span>
        <h2 className="font-display text-xl font-bold mt-1">Admin Panel</h2>
        <p className="text-xs text-navy-400 mt-2 truncate">{user.email}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {visibleNav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-premium px-4 py-3 text-sm font-bold transition",
                active ? "bg-white text-navy-900" : "text-navy-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => void logout()}
        className="flex w-full items-center gap-3 rounded-premium px-4 py-3 text-sm font-bold text-navy-300 hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        Çıkış
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-clinical-light flex">
      <aside className="hidden w-64 shrink-0 lg:block border-r border-clinical-border">
        {Sidebar}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between border-b border-clinical-border bg-white px-4 py-3">
          <button type="button" onClick={() => setOpen(true)} aria-label="Menü">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-navy-900">Admin Panel</span>
          <div className="w-6" />
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64">
              <button
                type="button"
                className="absolute right-4 top-4 text-white"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
              {Sidebar}
            </div>
          </div>
        )}
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
