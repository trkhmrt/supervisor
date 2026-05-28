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
  Megaphone,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { ProfileCompletionBanner } from "@/components/auth/ProfileCompletionBanner";
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
  ads: Megaphone,
  "site-content": FileText,
  messages: MessageSquare,
  members: Users,
  admins: Shield,
  profile: User,
};

function SidebarPanel({
  user,
  settings,
  subtitle,
  navLoading,
  navItems,
  pathname,
  signingOut,
  onClose,
  onLogout,
}: {
  user: ReturnType<typeof useDashboardAccess>["user"];
  settings: { siteName: string };
  subtitle: string;
  navLoading: boolean;
  navItems: ReturnType<typeof useDashboardAccess>["navItems"];
  pathname: string;
  signingOut: boolean;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
  <>
    <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
      <Link href={DASHBOARD_BASE} className="flex min-w-0 items-center gap-3" onClick={onClose}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white text-navy-950">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold tracking-tight">
            {user?.role === "admin" ? "Süpervizyon" : settings.siteName}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-400">{subtitle}</div>
        </div>
      </Link>
      {onClose ? (
        <button type="button" onClick={onClose} className="shrink-0 p-2 text-navy-400 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>

    <nav className="space-y-1 p-3 sm:p-4" aria-label="Panel menüsü">
      {navLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-premium bg-white/10 sm:h-11" aria-hidden />
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
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-premium px-3 py-2.5 text-sm font-bold transition-all sm:px-4 sm:py-3",
                  active
                    ? "bg-white text-navy-950 shadow-lg"
                    : "text-navy-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-navy-950" : "text-navy-500 group-hover:text-navy-300"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
    </nav>

    <div className="shrink-0 space-y-1 border-t border-white/10 p-3 sm:space-y-2 sm:p-4">
      <Link
        href="/supervizorler"
        target="_blank"
        rel="noreferrer"
        onClick={onClose}
        className="flex items-center gap-3 rounded-premium px-3 py-2.5 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white sm:px-4 sm:py-3"
      >
        <ExternalLink className="h-4 w-4 shrink-0" /> Siteyi Görüntüle
      </Link>
      <Link
        href="/"
        onClick={onClose}
        className="flex items-center gap-3 rounded-premium px-3 py-2.5 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white sm:px-4 sm:py-3"
      >
        <Home className="h-4 w-4 shrink-0" /> Ana Sayfa
      </Link>
      <button
        type="button"
        disabled={signingOut}
        onClick={() => void onLogout()}
        className="flex w-full items-center gap-3 rounded-premium px-3 py-2.5 text-xs font-bold text-navy-300 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50 sm:px-4 sm:py-3"
      >
        {signingOut ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <LogOut className="h-4 w-4 shrink-0" />}
        {signingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
      </button>
    </div>
  </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const logout = useAppStore((s) => s.logout);
  const settings = useAppStore((s) => s.settings);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dashboardPhoneReminderOpen, setDashboardPhoneReminderOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const subtitle = user?.role === "admin" ? "Admin Panel" : "Yönetim Paneli";

  const sidebarProps = {
    user,
    settings,
    subtitle,
    navLoading,
    navItems,
    pathname,
    signingOut,
    onLogout: handleLogout,
  };

  return (
    <div className="grid h-dvh grid-cols-1 overflow-hidden bg-clinical-light lg:grid-cols-[16rem_1fr] xl:grid-cols-[17rem_1fr]">
      <aside
        className="hidden min-h-0 flex-col overflow-y-auto overscroll-contain border-r border-navy-900/20 bg-navy-950 text-white lg:flex"
        aria-label="Panel kenar çubuğu"
      >
        <SidebarPanel {...sidebarProps} />
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
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,17rem)] flex-col overflow-y-auto overscroll-contain bg-navy-950 text-white shadow-2xl lg:hidden"
              aria-label="Panel menüsü"
            >
              <SidebarPanel {...sidebarProps} onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-0 min-w-0 flex-col">
        <header
          className={cn(
            "flex shrink-0 items-center gap-3 bg-white/95 px-4 py-3 backdrop-blur-sm sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8",
            dashboardPhoneReminderOpen ? "border-b-0" : "border-b border-clinical-border"
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="-ml-1 shrink-0 rounded-premium p-2 text-navy-900 transition hover:bg-navy-50 lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-clinical-muted">
              Hoş geldiniz
            </p>
            <p className="mt-0.5 truncate font-display text-base font-bold leading-tight text-navy-900 sm:text-lg">
              {user?.fullName ?? "—"}
            </p>
          </div>
        </header>

        <ProfileCompletionBanner
          variant="dashboard"
          onDashboardAlertVisibleChange={setDashboardPhoneReminderOpen}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
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
