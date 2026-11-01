"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as "en" | "vi";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <select
      value={locale}
      onChange={onSelectChange}
      title="Language"
      aria-label="Language"
      className="border border-black bg-white px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer hover:bg-note transition-colors"
    >
      <option value="en">EN</option>
      <option value="vi">VN</option>
    </select>
  );
}
