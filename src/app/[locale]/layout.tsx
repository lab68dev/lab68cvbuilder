import type { Metadata } from "next";
import { IBM_Plex_Sans, Shantell_Sans } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

// Hand-drawn look with Vietnamese letters, which Kalam and Caveat do not have
const shantellSans = Shantell_Sans({
  variable: "--font-shantell-sans",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lab68cvbuilder.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "lab68cv.builder — Build Your Resume",
    template: "%s | lab68cv.builder",
  },
  description:
    "Friendly, ATS-optimized resumes made for developers and designers. Export pixel-perfect PDFs for free.",
  keywords: [
    "CV builder",
    "resume builder",
    "ATS resume",
    "free resume",
    "PDF resume",
    "developer resume",
    "lab68cv.builder",
  ],
  authors: [{ name: "lab68cv.builder" }],
  creator: "lab68cv.builder",
  openGraph: {
    type: "website",
    siteName: "lab68cv.builder",
    title: "lab68cv.builder — Build Your Resume",
    description:
      "Friendly, ATS-optimized resumes made for developers and designers.",
    locale: "en_US",
    alternateLocale: ["vi_VN"],
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "lab68cv.builder — Build Your Resume",
    description:
      "Friendly, ATS-optimized resumes made for developers and designers.",
    creator: "@lab68dev",
  },
  verification: {
    google: "BuShHiu-1s_TOwKrSW0RlicUZGYeWi-fnYslAIqTcFI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      vi: "/vi",
    },
  },
  icons: {
    icon: [
      { url: "/design-mode/favicon.ico", sizes: "any" },
      { url: "/design-mode/lab68dev_logo.png", type: "image/png" },
    ],
    apple: [{ url: "/design-mode/lab68dev_logo.png", type: "image/png" }],
    shortcut: "/design-mode/favicon.ico",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${ibmPlexSans.variable} ${shantellSans.variable}`}
    >
      <body className="antialiased font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
