"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, X } from "lucide-react";
import { useCurrentUser } from "@/lib/store";
import { DASHBOARD_BASE } from "@/lib/dashboard/navigation";
import { cn } from "@/lib/utils";

const VAR_NAME = "--phone-reminder-banner-h";

export type ProfileCompletionBannerVariant = "site" | "dashboard";

const surfaceClass = cn(
  "border-b border-amber-300/65 border-l-4 border-l-amber-500",
  "bg-gradient-to-r from-amber-50/[0.97] via-amber-50/80 to-clinical-white/95 backdrop-blur-sm text-neutral-800"
);

function PhoneReminderInfoBlock({
  profilHref,
  onDismiss,
  paddingClass,
}: {
  profilHref: string;
  onDismiss: () => void;
  paddingClass?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-3.5",
        paddingClass
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-400/35 sm:mt-0">
          <Info className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
          <span className="inline-flex w-fit shrink-0 items-center rounded-md bg-amber-400/35 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 ring-1 ring-amber-500/25">
            Hatırlatma
          </span>
          <p className="min-w-0 text-[13px] leading-snug text-neutral-800 sm:text-[15px]">
            <span className="font-semibold text-neutral-900">
              Randevu ve iletişim için telefon numaranızı profilde kaydedin.
            </span>{" "}
            <span className="hidden text-neutral-600 md:inline">
              Bunu zamanınız olduğunda birkaç dakikada tamamlayabilirsiniz.
            </span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-stretch gap-2 sm:items-center sm:self-center">
        <Link
          href={profilHref}
          className={cn(
            "inline-flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-amber-600/35",
            "bg-white px-4 py-2 text-center text-xs font-semibold text-amber-950 shadow-sm ring-1 ring-amber-500/15",
            "transition hover:border-amber-600/55 hover:bg-amber-50/90 hover:text-neutral-950",
            "sm:flex-initial sm:min-h-10 sm:px-5 sm:text-[13px]"
          )}
        >
          Profilde düzenle
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDismiss();
          }}
          className={cn(
            "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-300/90 bg-white/90",
            "text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          )}
          aria-label="Bildirimi bu sayfada kapat"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

export function ProfileCompletionBanner({
  variant = "site",
  onDashboardAlertVisibleChange,
}: {
  variant?: ProfileCompletionBannerVariant;
  onDashboardAlertVisibleChange?: (visible: boolean) => void;
}) {
  const user = useCurrentUser();
  const pathname = usePathname();
  const [dismissedOnPage, setDismissedOnPage] = useState(false);
  const siteBannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDismissedOnPage(false);
  }, [pathname]);

  const needsPhone = !!user && !user.phone?.trim();
  const visible = needsPhone && !dismissedOnPage;

  useEffect(() => {
    if (variant !== "dashboard" || !onDashboardAlertVisibleChange) return;
    onDashboardAlertVisibleChange(visible);
    return () => onDashboardAlertVisibleChange(false);
  }, [variant, visible, onDashboardAlertVisibleChange]);

  useLayoutEffect(() => {
    if (variant !== "site") return;
    const root = document.documentElement;

    function applyHeight() {
      const el = siteBannerRef.current;
      if (!el) return;
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty(VAR_NAME, `${h}px`);
    }

    function clearHeight() {
      root.style.setProperty(VAR_NAME, "0px");
    }

    if (!visible || typeof window === "undefined") {
      clearHeight();
      return undefined;
    }

    applyHeight();
    const ro = new ResizeObserver(applyHeight);
    const el = siteBannerRef.current;
    if (el) ro.observe(el);
    window.addEventListener("resize", applyHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyHeight);
      clearHeight();
    };
  }, [visible, variant, pathname]);

  if (!visible) return null;

  const profilHref = `${DASHBOARD_BASE}/profil`;
  const dismiss = () => setDismissedOnPage(true);

  if (variant === "dashboard") {
    return (
      <div role="status" aria-live="polite" aria-label="Profil bilgilendirmesi" className={cn("shrink-0", surfaceClass)}>
        <PhoneReminderInfoBlock
          profilHref={profilHref}
          onDismiss={dismiss}
          paddingClass="px-4 sm:px-6 lg:px-8"
        />
      </div>
    );
  }

  return (
    <div
      ref={siteBannerRef}
      role="banner"
      aria-label="Profil bilgilendirmesi"
      className={cn("fixed inset-x-0 top-0 z-[100] w-full shadow-sm", surfaceClass)}
    >
      <div className="container-wide">
        <PhoneReminderInfoBlock profilHref={profilHref} onDismiss={dismiss} />
      </div>
    </div>
  );
}
