import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "buildinprocess.com",
      },
      {
        protocol: "https",
        hostname: "unikorn.vn",
      },
    ],
  },
  async headers() {
    return [
      // Long-lived cache for public assets (logo, favicon, etc.)
      {
        source: "/design-mode/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // DNS prefetch for external services
      {
        source: "/(.*)",
        headers: [{ key: "X-DNS-Prefetch-Control", value: "on" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
