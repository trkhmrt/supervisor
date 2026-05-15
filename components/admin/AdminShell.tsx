"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  Layers,
  BookOpen,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
} from "lucide-react";
import { useAppStore, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/randevular", label: "Randevular", icon: Calendar },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/supervizorler", label: "Süpervizörler", icon: UserPlus },
  { href: "/admin/hizmetler", label: "Hizmetler", icon: Layers },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/mesajlar", label: "Mesajlar & Bülten", icon: Mail },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const settings = useAppStore((s) => s.settings);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) router.push("/giris");
    else if (user.role !== "admin") router.push("/panelim");
  }, [user, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!user || user.role !== "admin") return null;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-navy-950 text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-navy-950">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-tight">{settings.siteName}</div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-navy-400">Admin Panel</div>
          </div>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden p-2 text-navy-400">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
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
              <Icon className={cn("h-4 w-4", active ? "text-navy-950" : "text-navy-500 group-hover:text-navy-300")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-premium px-4 py-3 text-xs font-bold text-navy-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <Home className="h-4 w-4" /> Siteyi Görüntüle
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/");
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
          <button onClick={() => setOpen(true)} className="p-2 text-navy-900">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-display font-bold text-navy-900">Yönetim Paneli</div>
          <div className="w-10" />
        </header>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
