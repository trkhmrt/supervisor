"use client";

import Link from "next/link";
import { Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  const settings = useAppStore((s) => s.settings);

  return (
    <footer className="bg-navy-900 text-clinical-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 h-full w-1/4 -z-0 translate-x-1/2 skew-x-12 bg-[#d1f90b]/20" />
      
      <div className="container-wide relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 mb-20">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-clinical-white rounded-premium flex items-center justify-center text-navy-900">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold tracking-tight text-clinical-white leading-none">
                  {settings.siteName}
                </span>
                <span className="mt-1 inline-block rounded-sm bg-[#d1f90b] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Clinical Platform
                </span>
              </div>
            </Link>
            <p className="text-navy-200 text-sm leading-relaxed max-w-sm mb-10">
              {settings.tagline} Ruh sağlığı profesyonelleri için etik ve bilimsel 
              temelli süpervizyon çözümleri.
            </p>
            <div className="flex gap-4">
              <SocialLink href={settings.socials.instagram} Icon={Instagram} />
              <SocialLink href={settings.socials.twitter} Icon={Twitter} />
              <SocialLink href={settings.socials.linkedin} Icon={Linkedin} />
              <SocialLink href={settings.socials.youtube} Icon={Youtube} />
            </div>
          </div>

          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-12">
            <FooterNav title="Hizmetler">
              <FooterNavLink href="/hizmetler/bireysel-supervizyon">Bireysel Süpervizyon</FooterNavLink>
              <FooterNavLink href="/hizmetler/grup-supervizyonu">Grup Süpervizyonu</FooterNavLink>
              <FooterNavLink href="/hizmetler/akran-supervizyonu">Akran Süpervizyonu</FooterNavLink>
              <FooterNavLink href="/hizmetler/gorusme-simulasyonu">Görüşme Simülasyonu</FooterNavLink>
            </FooterNav>
            
            <FooterNav title="Kurumsal">
              <FooterNavLink href="/hakkimizda">Hakkımızda</FooterNavLink>
              <FooterNavLink href="/supervizorler">Süpervizörler</FooterNavLink>
              <FooterNavLink href="/blog">Blog & Yayınlar</FooterNavLink>
              <FooterNavLink href="/iletisim">İletişim</FooterNavLink>
              <FooterNavLink href="/dashboard">Yönetim Paneli</FooterNavLink>
            </FooterNav>

            <FooterNav title="İletişim">
              <li className="flex items-center gap-3 text-navy-200 text-sm">
                <Mail className="h-4 w-4 text-navy-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-3 text-navy-200 text-sm">
                <Phone className="h-4 w-4 text-navy-400" />
                {settings.phone}
              </li>
              <li className="flex items-start gap-3 text-navy-200 text-sm">
                <MapPin className="h-4 w-4 text-navy-400 mt-1 shrink-0" />
                <span>{settings.address}</span>
              </li>
            </FooterNav>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 border-y border-white/10">
           <div>
              <h4 className="text-xl font-display font-bold mb-2">Bültene Abone Olun</h4>
              <p className="text-navy-300 text-sm">Makaleler ve etkinliklerden ilk siz haberdar olun.</p>
           </div>
           <NewsletterForm />
        </div>

          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-clinical-white/70 font-bold uppercase tracking-widest">
          <div>© {new Date().getFullYear()} {settings.siteName}. All Rights Reserved.</div>
          <div className="flex gap-8">
            <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik</Link>
            <Link href="/kosullar" className="hover:text-white transition-colors">Koşullar</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, Icon }: { href?: string; Icon: any }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-premium border border-clinical-white/20 text-clinical-white/80 transition-all duration-300 hover:bg-[#d1f90b] hover:text-black"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

function FooterNav({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-navy-400 mb-6">{title}</h4>
      <ul className="space-y-4">{children}</ul>
    </div>
  );
}

function FooterNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-navy-200 text-sm hover:text-white transition-colors flex items-center gap-2 group">
        <div className="w-1 h-1 bg-navy-600 rounded-full group-hover:bg-white transition-colors" />
        {children}
      </Link>
    </li>
  );
}
