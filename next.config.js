/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/adminpanel/giris", destination: "/giris?next=/dashboard", permanent: false },
      { source: "/panelim", destination: "/dashboard", permanent: false },
      { source: "/panelim/:path*", destination: "/dashboard/:path*", permanent: false },
      { source: "/adminpanel", destination: "/dashboard", permanent: false },
      { source: "/adminpanel/:path*", destination: "/dashboard/:path*", permanent: false },
      { source: "/dashboard/musaitlik", destination: "/dashboard/takvim", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  /**
   * Aynı projede birden fazla `next dev` veya `.next` silinirken sunucu açıksa
   * webpack disk önbelleği tutarsız kalabiliyor (Cannot find module './707.js',
   * clientModules undefined). Geliştirmede kalıcı cache'i kapatıyoruz.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
