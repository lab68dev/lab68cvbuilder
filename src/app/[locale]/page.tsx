import { Link } from "@/i18n/routing";
import { DoodleArrow, ScribbleUnderline } from "@/components/doodles";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";

// Sponsor data. Leave array empty [] to show the fallback "Be the first" UI,
// or fill with { name, url, logoUrl } to populate the grid.
const SPONSORS: Array<{ name: string; url: string; logoUrl: string }> = [];

// Cache this fully-static page for 24 hours (ISR)
export const revalidate = 86400;

export default function HomePage() {
  const t = useTranslations("Index");

  return (
    <>
      <Header />
      <main className="bg-white text-black w-full overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8 pt-22">
          <div className="max-w-2xl w-full">
            <span className="label-mono block mb-4">{t("label")}</span>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
              {t("title")}
            </h1>
            <ScribbleUnderline className="w-full h-5 mb-8" />
            <p className="text-base md:text-lg max-w-xl mb-12 leading-relaxed">
              {t.rich("description", {
                b: (chunks) => (
                  <span className="font-bold underline decoration-2">
                    {chunks}
                  </span>
                ),
              })}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="border border-black px-8 py-3 text-sm font-bold hover:bg-note"
              >
                {t("enterLab")}
              </Link>
              <Link
                href="/try"
                className="border border-black px-8 py-3 text-sm font-bold bg-note"
              >
                {t("tryFree")}
              </Link>
              <a
                href="#templates"
                className="border border-gray-400 px-8 py-3 text-sm font-bold text-gray-600 hover:border-black hover:text-black"
              >
                {t("viewTemplates")}
              </a>
            </div>
            <div className="hidden md:flex items-start gap-1 mt-3 ml-52">
              <DoodleArrow className="w-14 -rotate-[100deg]" />
              <p className="font-hand text-gray-700 mt-5">{t("tryHint")}</p>
            </div>
          </div>
        </section>

        {/* FEATURED IN */}
        <section className="relative z-10 border-t border-black bg-gray-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="shrink-0 border-b md:border-b-0 md:border-r border-black px-8 md:px-12 py-5 md:py-6">
              <span className="text-[0.6rem] font-bold text-gray-400">
                Featured In
              </span>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto px-8 py-5 md:py-6 scrollbar-none flex-nowrap w-full">
              <a
                href="https://forg.to/products/lab68-cv-builder"
                target="_blank"
                rel="noopener"
                title="Upvote lab68-cv-builder on Forg"
                aria-label="Upvote lab68-cv-builder on Forg"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://forg.to/api/badges/upvote/lab68-cv-builder?theme=dark&shape=square"
                  alt="lab68-cv-builder - Upvote on Forg"
                  width={160}
                  height={48}
                  style={{ width: 160, height: 48, objectFit: "contain" }}
                  unoptimized
                />
              </a>
              <a
                href="https://unikorn.vn/p/lab68dev-cv-builder?ref=embed"
                target="_blank"
                rel="noopener noreferrer"
                title="lab68CV Builder trên Unikorn.vn"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://unikorn.vn/api/widgets/badge/lab68dev-cv-builder?theme=dark"
                  alt="lab68CV Builder trên Unikorn.vn"
                  width={160}
                  height={36}
                  style={{ width: 160, height: 36, objectFit: "contain" }}
                  unoptimized
                />
              </a>
              <a
                href="https://www.producthunt.com/products/lab68dev-cv-builder/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-lab68dev-cv-builder"
                target="_blank"
                rel="noopener noreferrer"
                title="Review on Product Hunt"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1177121&theme=dark"
                  alt="Product Hunt Review"
                  width={160}
                  height={36}
                  style={{ width: 160, height: 36, objectFit: "contain" }}
                  unoptimized
                />
              </a>
              <a
                href="https://www.producthunt.com/products/lab68dev-cv-builder?utm_source=badge-follow&utm_medium=badge&utm_source=badge-lab68dev-cv-builder"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on Product Hunt"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/follow.svg?product_id=1177121&theme=dark"
                  alt="Follow on Product Hunt"
                  width={160}
                  height={36}
                  style={{ width: 160, height: 36, objectFit: "contain" }}
                  unoptimized
                />
              </a>
              <a
                href="https://www.producthunt.com/products/lab68dev-cv-builder?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-lab68dev-cv-builder"
                target="_blank"
                rel="noopener noreferrer"
                title="Featured on Product Hunt"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1093292&theme=dark&t=1773130393873"
                  alt="Featured on Product Hunt"
                  width={160}
                  height={36}
                  style={{ width: 160, height: 36, objectFit: "contain" }}
                  unoptimized
                />
              </a>
              <a
                href="https://marketingdb.live"
                target="_blank"
                rel="noopener noreferrer"
                title="Listed on MarketingDB"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src="https://marketingdb.live/badge.svg"
                  alt="Listed on MarketingDB"
                  width={190}
                  height={44}
                  style={{ width: 220, height: 44, objectFit: "contain" }}
                  unoptimized
                />
              </a>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section className="relative z-10 border-t border-black bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y divide-black md:divide-y-0 md:divide-x">
            <div className="p-8 md:p-10 flex items-center">
              <div>
                <span className="label-mono block mb-3">
                  {t("Achievements.label")}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-tight">
                  {t("Achievements.title")}
                </h2>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-gray-50">
              <p className="text-[10px] font-bold text-gray-500 mb-4">
                Unikorn
              </p>
              <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                {t("Achievements.unikornRank")}
              </p>
            </div>

            <div className="p-8 md:p-10 bg-black text-white">
              <p className="text-[10px] font-bold text-white/60 mb-4">Forg</p>
              <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                {t("Achievements.forgRank")}
              </p>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="relative z-10 border-t border-black bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-black p-8 md:p-16 flex items-start">
              <h2 className="text-3xl font-black tracking-tight ">
                {t("Features.title")}
              </h2>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2">
              <div className="p-8 md:p-12 border-r border-b border-black">
                <h3 className="text-sm font-bold mb-4">
                  01. {t("Features.pdfTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {t("Features.pdfDesc")}
                </p>
              </div>
              <div className="p-8 md:p-12 border-r border-b border-black sm:border-r-0">
                <h3 className="text-sm font-bold mb-4">
                  02. {t("Features.atsTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {t("Features.atsDesc")}
                </p>
              </div>
              <div className="p-8 md:p-12 border-r border-b border-black sm:border-b-0">
                <h3 className="text-sm font-bold mb-4">
                  03. {t("Features.templatesTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {t("Features.templatesDesc")}
                </p>
              </div>
              <div className="p-8 md:p-12 border-r border-b border-black sm:border-r-0 sm:border-b-0">
                <h3 className="text-sm font-bold mb-4">
                  04. {t("Features.freeTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light">
                  {t("Features.freeDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROFILE IMPORT */}
        <section className="relative z-10 border-t border-black bg-gray-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-black p-8 md:p-16 flex items-start">
              <div>
                <span className="label-mono block mb-4">
                  {t("Import.label")}
                </span>
                <h2 className="text-3xl font-black tracking-tight ">
                  {t("Import.title")}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed font-light mt-4 max-w-xs">
                  {t("Import.subtitle")}
                </p>
              </div>
            </div>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3">
              <div className="p-8 md:p-10 border-b sm:border-b-0 sm:border-r border-black bg-white">
                <div className="label-mono text-[10px] text-gray-500 mb-3">
                  1. GitHub
                </div>
                <h3 className="text-sm font-bold mb-3">
                  {t("Import.githubTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light mb-6">
                  {t("Import.githubDesc")}
                </p>
                <Link
                  href="/try"
                  className="inline-block border border-black px-4 py-2 text-[10px] font-bold hover:bg-note transition-colors duration-150"
                >
                  {t("Import.cta")}
                </Link>
              </div>

              <div className="p-8 md:p-10 border-b sm:border-b-0 sm:border-r border-black bg-white">
                <div className="label-mono text-[10px] text-gray-500 mb-3">
                  2. LinkedIn
                </div>
                <h3 className="text-sm font-bold mb-3">
                  {t("Import.linkedinTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light mb-6">
                  {t("Import.linkedinDesc")}
                </p>
                <Link
                  href="/try"
                  className="inline-block border border-black px-4 py-2 text-[10px] font-bold hover:bg-note transition-colors duration-150"
                >
                  {t("Import.cta")}
                </Link>
              </div>

              <div className="p-8 md:p-10 bg-white">
                <div className="label-mono text-[10px] text-gray-500 mb-3">
                  3. Behance
                </div>
                <h3 className="text-sm font-bold mb-3">
                  {t("Import.behanceTitle")}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-light mb-6">
                  {t("Import.behanceDesc")}
                </p>
                <Link
                  href="/try"
                  className="inline-block border border-black px-4 py-2 text-[10px] font-bold hover:bg-note transition-colors duration-150"
                >
                  {t("Import.cta")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AI WRITING ASSISTANT */}
        <section className="relative z-10 border-t border-black bg-black text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
            {/* Left label panel */}
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-white/20 p-8 md:p-16 flex flex-col justify-between gap-8">
              <div>
                <span className="label-mono block text-white/40 mb-4 text-xs ">
                  {t("AI.label")}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-tight">
                  {t("AI.title")}
                </h2>
                <p className="text-sm text-white/60 font-light leading-relaxed mt-4">
                  {t("AI.subtitle")}
                </p>
              </div>
              <Link
                href="/try"
                className="self-start border border-white px-8 py-3 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150"
              >
                {t("AI.cta")}
              </Link>
            </div>
            {/* Right features */}
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3">
              <div className="p-8 md:p-12 border-b sm:border-b-0 sm:border-r border-white/20">
                <div className="w-8 h-8 border border-white/40 flex items-center justify-center mb-6">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-4">
                  01. {t("AI.feature1Title")}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  {t("AI.feature1Desc")}
                </p>
              </div>
              <div className="p-8 md:p-12 border-b sm:border-b-0 sm:border-r border-white/20">
                <div className="w-8 h-8 border border-white/40 flex items-center justify-center mb-6">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-4">
                  02. {t("AI.feature2Title")}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  {t("AI.feature2Desc")}
                </p>
              </div>
              <div className="p-8 md:p-12">
                <div className="w-8 h-8 border border-white/40 flex items-center justify-center mb-6">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold mb-4">
                  03. {t("AI.feature3Title")}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed font-light">
                  {t("AI.feature3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES SHOWCASE */}
        <section
          id="templates"
          className="relative z-10 border-t border-black bg-gray-50"
        >
          <div className="max-w-7xl mx-auto p-8 md:p-16">
            <h2 className="text-3xl font-black tracking-tight pb-8 border-b border-black mb-12 text-center md:text-left">
              {t("Templates.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Executive */}
              <div className="group cursor-default">
                <div className="aspect-[1/1.4] w-full sketch-card bg-white mb-4 p-4 shadow-[4px_4px_0_#000] group-hover:shadow-[8px_8px_0_#000] group-hover:-translate-y-1 transition-all flex flex-col">
                  {/* Wireframe representation */}
                  <div className="w-full h-8 bg-black mb-4"></div>
                  <div className="flex gap-4">
                    <div className="w-1/3 space-y-2">
                      <div className="w-full h-2 bg-gray-200"></div>
                      <div className="w-full h-2 bg-gray-200"></div>
                      <div className="w-2/3 h-2 bg-gray-200"></div>
                    </div>
                    <div className="w-2/3 space-y-4">
                      <div className="w-full h-4 bg-gray-300"></div>
                      <div className="w-full h-12 bg-gray-100 border border-dashed border-gray-300"></div>
                      <div className="w-full h-12 bg-gray-100 border border-dashed border-gray-300"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-2">
                  {t("Templates.executiveTitle")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Templates.executiveDesc")}
                </p>
              </div>

              {/* Harvard */}
              <div className="group cursor-default">
                <div className="aspect-[1/1.4] w-full sketch-card bg-white mb-4 p-4 shadow-[4px_4px_0_#000] group-hover:shadow-[8px_8px_0_#000] group-hover:-translate-y-1 transition-all flex flex-col items-center">
                  {/* Wireframe representation */}
                  <div className="w-2/3 h-6 bg-black mb-2"></div>
                  <div className="w-full h-px bg-black mb-4"></div>
                  <div className="w-full space-y-3">
                    <div className="w-1/3 h-3 bg-gray-300 mx-auto"></div>
                    <div className="w-full h-8 bg-gray-100 border border-dashed border-gray-300"></div>
                    <div className="w-full h-8 bg-gray-100 border border-dashed border-gray-300"></div>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-2">
                  {t("Templates.harvardTitle")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Templates.harvardDesc")}
                </p>
              </div>

              {/* Creative */}
              <div className="group cursor-default">
                <div className="aspect-[1/1.4] w-full border border-black bg-white mb-4 shadow-[4px_4px_0_#000] group-hover:shadow-[8px_8px_0_#000] group-hover:-translate-y-1 transition-all flex">
                  {/* Wireframe representation */}
                  <div className="w-1/3 h-full bg-black p-2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-white mb-4 cursor-default"></div>
                    <div className="w-full h-1 bg-gray-700 mb-1"></div>
                    <div className="w-2/3 h-1 bg-gray-700"></div>
                  </div>
                  <div className="w-2/3 p-4 space-y-4">
                    <div className="w-2/3 h-6 bg-gray-300"></div>
                    <div className="w-full h-8 bg-gray-100 border border-dashed border-gray-300"></div>
                    <div className="w-full h-8 bg-gray-100 border border-dashed border-gray-300"></div>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-2">
                  {t("Templates.creativeTitle")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Templates.creativeDesc")}
                </p>
              </div>

              {/* ATS */}
              <div className="group cursor-default">
                <div className="aspect-[1/1.4] w-full sketch-card bg-white mb-4 p-4 shadow-[4px_4px_0_#000] group-hover:shadow-[8px_8px_0_#000] group-hover:-translate-y-1 transition-all flex flex-col">
                  {/* Wireframe representation */}
                  <div className="w-1/2 h-5 bg-black mb-4"></div>
                  <div className="w-full space-y-2">
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-2/3 h-1 bg-gray-200 mb-4"></div>
                    <div className="w-1/3 h-3 bg-gray-300"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-2">
                  {t("Templates.atsTitle")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Templates.atsDesc")}
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/login"
                className="inline-block border border-black bg-white px-8 py-3 text-xs font-bold hover:bg-note transition-colors duration-150"
              >
                {t("enterLab")}
              </Link>
            </div>
          </div>
        </section>

        {/* SPONSORS */}
        <section className="relative z-10 border-t border-black bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
            {/* Left label panel */}
            <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-black p-8 md:p-16 flex flex-col justify-between gap-8 bg-black text-white">
              <div>
                <span className="label-mono block text-white/50 mb-4 text-[10px] ">
                  {t("Sponsors.label")}
                </span>
                <h2 className="text-3xl font-black tracking-tight leading-tight">
                  {t("Sponsors.title")}
                </h2>
                <p className="text-sm text-gray-400 font-light leading-relaxed mt-4">
                  {t("Sponsors.subtitle")}
                </p>
              </div>
              <a
                href="https://github.com/sponsors/lab68dev"
                target="_blank"
                rel="noopener noreferrer"
                className="self-start border border-white px-8 py-3 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150 flex items-center gap-2"
              >
                {t("Sponsors.cta")}
              </a>
            </div>

            {/* Right Sponsors Grid */}
            <div className="md:w-2/3 bg-gray-50 flex flex-col">
              {SPONSORS.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 h-full">
                  {SPONSORS.map((sponsor, index) => (
                    <a
                      key={index}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`border-black flex items-center justify-center p-8 hover:bg-white transition-colors duration-200 ${
                        index % 3 !== 2 ? "border-r" : "" // No right border on last item of row
                      } ${
                        index < SPONSORS.length - 3 ? "border-b" : "" // No bottom border on last row
                      }`}
                      title={`Sponsored by ${sponsor.name}`}
                    >
                      {/* Using unoptimized Image or img tag depending on implementation, 
                          fallback to alt text if logo fails to load */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="max-h-12 max-w-30 object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-75">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    {t("Sponsors.emptyTitle")}
                  </h3>
                  <p className="text-sm text-gray-500 font-light max-w-sm leading-relaxed">
                    {t("Sponsors.emptyDesc")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ECOSYSTEM / LAUNCH ON FORG */}
        <section className="relative z-10 border-t border-black bg-black text-white p-8 md:p-14 lg:p-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <span className="label-mono block text-white/50 mb-4">
                {t("Ecosystem.label")}
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 ">
                {t("Ecosystem.title")}
              </h2>
              <p className="text-lg text-gray-400 font-light leading-relaxed mb-10 max-w-xl">
                {t("Ecosystem.subtitle")}
              </p>
              <a
                href="https://forg.to/ref/duongphudong"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-white bg-white text-black px-10 py-4 text-sm font-bold hover:bg-transparent hover:text-white transition-all duration-150"
              >
                {t("Ecosystem.cta")}
              </a>
            </div>
            <div className="md:w-1/2 flex justify-center w-full">
              <div className="relative w-full aspect-video border-2 border-white/20 bg-gray-900 group overflow-hidden max-w-lg">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-32 h-32" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                  </svg>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white text-black border-2 border-black translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[8px_8px_0_#fff]">
                  <p className="label-mono text-[10px] mb-2 text-gray-400">
                    Target: forg.to
                  </p>
                  <p className="font-bold text-sm tracking-tight ">
                    Ready to launch your project?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative z-10 border-t border-black bg-white">
          <div className="max-w-7xl mx-auto p-8 md:p-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-8 border-b border-black mb-12 gap-4">
              <h2 className="text-3xl font-black tracking-tight ">
                {t("Testimonials.title")}
              </h2>
              <p className="text-xs text-gray-500 font-light ">
                {t("Testimonials.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border-l border-t border-black">
              {/* Testimonial 1 */}
              <div className="border-r border-b border-black p-8 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-black"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-1">
                    {t("Testimonials.review1Title")}
                  </p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {t("Testimonials.review1Body")}
                  </p>
                </div>
                <p className="text-xs font-bold mt-auto pt-4 border-t border-gray-200">
                  {t("Testimonials.review1Author")}
                </p>
              </div>
              {/* Testimonial 2 */}
              <div className="border-r border-b border-black p-8 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-black"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-1">
                    {t("Testimonials.review2Title")}
                  </p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {t("Testimonials.review2Body")}
                  </p>
                </div>
                <p className="text-xs font-bold mt-auto pt-4 border-t border-gray-200">
                  {t("Testimonials.review2Author")}
                </p>
              </div>
              {/* Testimonial 3 */}
              <div className="border-r border-b border-black p-8 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-black"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-1">
                    {t("Testimonials.review3Title")}
                  </p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {t("Testimonials.review3Body")}
                  </p>
                </div>
                <p className="text-xs font-bold mt-auto pt-4 border-t border-gray-200">
                  {t("Testimonials.review3Author")}
                </p>
              </div>
              {/* Testimonial 4 */}
              <div className="border-r border-b border-black p-8 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-black"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-1">
                    {t("Testimonials.review4Title")}
                  </p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {t("Testimonials.review4Body")}
                  </p>
                </div>
                <p className="text-xs font-bold mt-auto pt-4 border-t border-gray-200">
                  {t("Testimonials.review4Author")}
                </p>
              </div>
              {/* Testimonial 5 */}
              <div className="border-r border-b border-black p-8 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3.5 h-3.5 fill-black"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-1">
                    {t("Testimonials.review5Title")}
                  </p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {t("Testimonials.review5Body")}
                  </p>
                </div>
                <p className="text-xs font-bold mt-auto pt-4 border-t border-gray-200">
                  {t("Testimonials.review5Author")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="relative z-10 border-t border-black bg-black text-white p-8 md:p-24 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              {t("CTA.title")}
            </h2>
            <p className="text-sm font-light text-gray-400 mb-10 ">
              {t("CTA.subtitle")}
            </p>
            <Link
              href="/login"
              className="border border-white bg-white text-black px-10 py-4 text-sm font-bold hover:bg-transparent hover:text-white transition-all duration-150"
            >
              {t("enterLab")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
