import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getTranslations } from "next-intl/server";
import { ProductsDropdownClient } from "./products-dropdown-client";

export async function Header() {
  const t = await getTranslations("Common");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Announcement Strip */}
      <div className="h-8 bg-black text-white flex items-center justify-center gap-3 px-6">
        <span className="text-[0.6rem] font-bold ">
          ✦ {t("announcementText")}
        </span>
        <Link
          href="/try"
          className="text-[0.6rem] font-bold border-b border-white/40 hover:border-white transition-colors duration-150 pb-px"
        >
          {t("announcementCta")}
        </Link>
      </div>
      {/* Main Nav */}
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-sm font-black ">lab68cv.builder</span>
            </Link>

            {/* Products Dropdown */}
            <div className="hidden sm:block">
              <ProductsDropdownClient />
            </div>
          </div>

          {/* Right: Current product label */}
          <div className="flex items-center gap-4">
            <span className="label-mono hidden sm:block">{t("cvBuilder")}</span>
            <LanguageSwitcher />
            <Link
              href="/login"
              className="border border-black px-4 py-1.5 text-xs font-bold whitespace-nowrap hover:bg-note transition-colors duration-150"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
