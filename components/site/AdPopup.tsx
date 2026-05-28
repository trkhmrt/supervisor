"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Advertisement } from "@/lib/types";

const STORAGE_PREFIX = "ad:dismissed:";

export function AdPopup() {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetch("/api/ads/active", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: Advertisement | null) => {
          if (cancelled || !data) return;
          if (typeof window === "undefined") return;
          const dismissed = window.localStorage.getItem(`${STORAGE_PREFIX}${data.id}`);
          if (dismissed) return;
          setAd(data);
          setVisible(true);
        })
        .catch(() => undefined);
    }, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    if (ad && typeof window !== "undefined") {
      window.localStorage.setItem(`${STORAGE_PREFIX}${ad.id}`, "1");
    }
    setVisible(false);
  }

  if (!ad) return null;

  const hasText = ad.displayMode === "IMAGE_WITH_TEXT" && (ad.title || ad.body);
  const innerContent = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-premium bg-clinical-light">
      <Image
        src={ad.imageUrl}
        alt={ad.title}
        fill
        sizes="(max-width: 768px) 90vw, 640px"
        className="object-cover"
        priority
      />
      {hasText && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <h3 className="text-xl font-display font-bold sm:text-2xl">{ad.title}</h3>
            {ad.body && (
              <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">{ad.body}</p>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Reklamı kapat"
            onClick={dismiss}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            className="relative w-full max-w-2xl"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Kapat"
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg ring-1 ring-clinical-border hover:bg-clinical-light"
            >
              <X className="h-4 w-4" />
            </button>
            {ad.linkUrl ? (
              <Link
                href={ad.linkUrl}
                target={ad.linkUrl.startsWith("http") ? "_blank" : undefined}
                rel={ad.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={dismiss}
                className="block"
              >
                {innerContent}
              </Link>
            ) : (
              innerContent
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
