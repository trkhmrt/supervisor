import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { StoreHydration } from "@/components/StoreHydration";

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://supervizyon.com"),
  title: {
    default: "Süpervizyon — Ruh Sağlığı Profesyonelleri için Süpervizyon Platformu",
    template: "%s | Süpervizyon",
  },
  description:
    "Uzman süpervizörlerden bireysel, grup ve akran süpervizyonu ile görüşme simülasyonu hizmetleri. Online randevu, güvenli ödeme, Google Meet entegrasyonu.",
  keywords: [
    "süpervizyon",
    "psikolog süpervizyon",
    "psikoterapi süpervizyonu",
    "grup süpervizyonu",
    "akran süpervizyonu",
    "görüşme simülasyonu",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://supervizyon.com",
    siteName: "Süpervizyon",
    title: "Süpervizyon — Ruh Sağlığı Profesyonelleri için",
    description:
      "Uzman süpervizörlerden bireysel, grup ve akran süpervizyonu ile görüşme simülasyonu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Süpervizyon",
    description: "Ruh sağlığı profesyonelleri için süpervizyon platformu.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-cream antialiased">
        <StoreHydration>{children}</StoreHydration>
      </body>
    </html>
  );
}
