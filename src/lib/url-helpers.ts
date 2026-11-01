/**
 * URL utilities for CV display.
 *
 * Normalises raw URLs into proper hrefs and clean display labels
 * so the CV shows "GitHub", "LinkedIn", "Portfolio" instead of
 * full addresses, while keeping the underlying link clickable.
 */

/** Ensure a URL string has a protocol prefix for linking */
export function ensureHref(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.includes("@")) return `mailto:${url}`;
  return `https://${url}`;
}

/** Only same-site paths are allowed, so a crafted link cannot send users elsewhere */
export function getSafeCallbackUrl(value: string | null): string {
  if (value && /^\/(?!\/)[^\s\\]*$/.test(value)) return value;
  return "/dashboard";
}

/** Clean display label for a website URL → "Portfolio" */
export function websiteLabel(): string {
  return "Portfolio";
}

/** Clean display label for LinkedIn → "LinkedIn" */
export function linkedinLabel(): string {
  return "LinkedIn";
}

/** Clean display label for GitHub → "GitHub" */
export function githubLabel(): string {
  return "GitHub";
}
