import { hasUserScope } from "@/lib/auth/access";
import { SCOPES, type Scope } from "@/lib/auth/permissions";
import type { SessionUser, UserRole } from "@/lib/types";

export type DashboardNavId =
  | "overview"
  | "supervisors-manage"
  | "supervisor-apply"
  | "supervisor-browse"
  | "supervisors"
  | "services"
  | "appointments"
  | "courses"
  | "availability"
  | "enrollments"
  | "blog"
  | "ads"
  | "site-content"
  | "messages"
  | "members"
  | "admins"
  | "profile";

export type DashboardNavItem = {
  id: DashboardNavId;
  href: string;
  label: string;
  exact?: boolean;
  /** Dashboard dışı link (erişim kontrolü uygulanmaz) */
  external?: boolean;
  /** Yalnızca admin menüsünde — scope filtresi */
  scope?: Scope;
};

export const DASHBOARD_BASE = "/dashboard";

/** Kullanıcı (danışan) menüsü */
export const DASHBOARD_NAV_USER: DashboardNavItem[] = [
  { id: "overview", href: DASHBOARD_BASE, label: "Genel Bakış", exact: true },
  { id: "appointments", href: `${DASHBOARD_BASE}/randevular`, label: "Randevularım" },
  {
    id: "enrollments",
    href: `${DASHBOARD_BASE}/basvurularim`,
    label: "Kurs Başvurularım",
  },
  { id: "profile", href: `${DASHBOARD_BASE}/profil`, label: "Profil" },
];

/** Süpervizör menüsü */
export const DASHBOARD_NAV_SUPERVISOR: DashboardNavItem[] = [
  { id: "overview", href: DASHBOARD_BASE, label: "Genel Bakış", exact: true },
  { id: "appointments", href: `${DASHBOARD_BASE}/randevular`, label: "Randevularım" },
  { id: "courses", href: `${DASHBOARD_BASE}/kurslar`, label: "Kurs Başvuruları" },
  { id: "availability", href: `${DASHBOARD_BASE}/takvim`, label: "Takvim" },
  { id: "profile", href: `${DASHBOARD_BASE}/profil`, label: "Profil" },
];

/** Admin menüsü — scope olan öğeler oturumda filtrelenir */
export const DASHBOARD_NAV_ADMIN: DashboardNavItem[] = [
  { id: "overview", href: DASHBOARD_BASE, label: "Genel Bakış", exact: true },
  {
    id: "supervisors",
    href: `${DASHBOARD_BASE}/supervizorler`,
    label: "Süpervizörler",
    scope: SCOPES.SUPERVISORS_LIST,
  },
  {
    id: "services",
    href: `${DASHBOARD_BASE}/hizmetler`,
    label: "Hizmetler",
    scope: SCOPES.SERVICES_LIST,
  },
  {
    id: "appointments",
    href: `${DASHBOARD_BASE}/randevular`,
    label: "Randevular",
    scope: SCOPES.APPOINTMENTS_LIST,
  },
  {
    id: "ads",
    href: `${DASHBOARD_BASE}/reklamlar`,
    label: "Reklamlar",
    scope: SCOPES.SETTINGS_UPDATE,
  },
  {
    id: "site-content",
    href: `${DASHBOARD_BASE}/site-icerik`,
    label: "Site İçerik",
    scope: SCOPES.SETTINGS_UPDATE,
  },
  {
    id: "courses",
    href: `${DASHBOARD_BASE}/kurslar`,
    label: "Eğitimler",
    scope: SCOPES.SUPERVISORS_LIST,
  },
  {
    id: "blog",
    href: `${DASHBOARD_BASE}/blog`,
    label: "Blog",
    scope: SCOPES.SETTINGS_UPDATE,
  },
  {
    id: "messages",
    href: `${DASHBOARD_BASE}/mesajlar`,
    label: "Mesajlar",
    scope: SCOPES.SETTINGS_READ,
  },
  {
    id: "members",
    href: `${DASHBOARD_BASE}/uyeler`,
    label: "Üyeler",
    scope: SCOPES.USERS_LIST,
  },
  {
    id: "admins",
    href: `${DASHBOARD_BASE}/alt-adminler`,
    label: "Alt Adminler",
    scope: SCOPES.ADMINS_LIST,
  },
  { id: "profile", href: `${DASHBOARD_BASE}/profil`, label: "Profil" },
];

const NAV_BY_ROLE: Record<UserRole, DashboardNavItem[]> = {
  user: DASHBOARD_NAV_USER,
  supervisor: DASHBOARD_NAV_SUPERVISOR,
  admin: DASHBOARD_NAV_ADMIN,
};

/** Oturumdaki role göre aside menüsü */
export function getDashboardNavForUser(user: SessionUser): DashboardNavItem[] {
  const catalog = NAV_BY_ROLE[user.role] ?? [];
  if (user.role !== "admin") {
    return catalog;
  }
  return catalog.filter((item) => !item.scope || hasUserScope(user, item.scope));
}

export type DashboardAccess =
  | { status: "loading" }
  | { status: "redirect"; href: string }
  | { status: "ready"; user: SessionUser; nav: DashboardNavItem[] };

export function resolveDashboardAccess(
  user: SessionUser | null | undefined
): DashboardAccess {
  if (!user) {
    return { status: "redirect", href: `/giris?next=${DASHBOARD_BASE}` };
  }
  if (user.role !== "user" && user.role !== "supervisor" && user.role !== "admin") {
    return { status: "redirect", href: `/giris?next=${DASHBOARD_BASE}` };
  }
  return {
    status: "ready",
    user,
    nav: getDashboardNavForUser(user),
  };
}

/** Dashboard rotası aside menüsünde tanımlı mı */
export function canAccessDashboardRoute(
  pathname: string,
  nav: DashboardNavItem[]
): boolean {
  if (pathname === DASHBOARD_BASE || pathname === `${DASHBOARD_BASE}/`) {
    return true;
  }
  if (!pathname.startsWith(`${DASHBOARD_BASE}/`)) {
    return false;
  }
  return nav.some((item) => {
    if (item.external) return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
}
