"use server";

import { headers } from "next/headers";
import {
  createRateLimiter,
  enforceRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

// Guests can import, so these are limited by IP rather than by user.
const importRateLimiter = createRateLimiter({
  name: "import",
  limit: 20,
  windowSeconds: 3600,
});

async function enforceImportLimit(): Promise<void> {
  await enforceRateLimit(importRateLimiter, getClientIp(await headers()));
}

type GitHubUser = {
  login: string;
  name: string | null;
  email: string | null;
  location: string | null;
  blog: string | null;
  html_url: string;
  bio: string | null;
};

type GitHubRepo = {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
};

type ImportSource = "github" | "linkedin" | "behance" | "forg";
export type ImportConfidence = "confirmed" | "inferred";
export type ImportPersonalFieldKey =
  | "fullName"
  | "email"
  | "location"
  | "website"
  | "linkedin"
  | "github"
  | "summary";

export type ImportedProjectDraft = {
  name: string;
  description: string;
  url: string;
  githubUrl: string;
  websiteUrl: string;
  technologies: string[];
  highlights: string[];
};

export type ImportedSkillCategoryDraft = {
  category: string;
  items: string[];
};

export type ImportedExperienceDraft = {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights: string[];
};

export type ImportedCertificationDraft = {
  name: string;
  issuer: string;
  date: string;
  url?: string;
};

export type SocialImportResult = {
  source: ImportSource;
  username: string;
  personalInfo: {
    fullName?: string;
    email?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github: string;
    summary?: string;
  };
  projects: ImportedProjectDraft[];
  skills: ImportedSkillCategoryDraft[];
  experience: ImportedExperienceDraft[];
  certifications: ImportedCertificationDraft[];
  confidence: {
    personal: Partial<Record<ImportPersonalFieldKey, ImportConfidence>>;
    skills: ImportConfidence;
    projects: ImportConfidence;
    experience: ImportConfidence;
    certifications: ImportConfidence;
  };
};

function parseGitHubUsername(input: string): string {
  const raw = input.trim();
  if (!raw) {
    throw new Error("GitHub username or profile URL is required");
  }

  const cleaned = raw.replace(/^@/, "");

  if (!cleaned.includes("/")) {
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/.test(cleaned)) {
      throw new Error("Invalid GitHub username format");
    }
    return cleaned;
  }

  let parsed: URL;
  try {
    parsed = new URL(
      cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
    );
  } catch {
    throw new Error("Invalid GitHub URL");
  }

  if (!parsed.hostname.toLowerCase().includes("github.com")) {
    throw new Error("Please provide a valid github.com profile URL");
  }

  const [username] = parsed.pathname.split("/").filter(Boolean);
  if (!username || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/.test(username)) {
    throw new Error("Could not extract a valid GitHub username from URL");
  }

  return username;
}

function parseLinkedInHandle(input: string): string {
  const raw = input.trim();
  if (!raw) {
    throw new Error("LinkedIn username or profile URL is required");
  }

  const cleaned = raw.replace(/^@/, "");
  if (!cleaned.includes("/")) {
    if (!/^[a-zA-Z0-9-._]{3,100}$/.test(cleaned)) {
      throw new Error("Invalid LinkedIn handle format");
    }
    return cleaned;
  }

  let parsed: URL;
  try {
    parsed = new URL(
      cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
    );
  } catch {
    throw new Error("Invalid LinkedIn URL");
  }

  if (!parsed.hostname.toLowerCase().includes("linkedin.com")) {
    throw new Error("Please provide a valid linkedin.com URL");
  }

  const [section, handle] = parsed.pathname.split("/").filter(Boolean);
  if (!section || !handle || section.toLowerCase() !== "in") {
    throw new Error("LinkedIn URL must look like linkedin.com/in/your-handle");
  }

  return handle;
}

function parseBehanceHandle(input: string): string {
  const raw = input.trim();
  if (!raw) {
    throw new Error("Behance username or profile URL is required");
  }

  const cleaned = raw.replace(/^@/, "");
  if (!cleaned.includes("/")) {
    if (!/^[a-zA-Z0-9-._]{2,100}$/.test(cleaned)) {
      throw new Error("Invalid Behance handle format");
    }
    return cleaned;
  }

  let parsed: URL;
  try {
    parsed = new URL(
      cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
    );
  } catch {
    throw new Error("Invalid Behance URL");
  }

  if (!parsed.hostname.toLowerCase().includes("behance.net")) {
    throw new Error("Please provide a valid behance.net URL");
  }

  const [handle] = parsed.pathname.split("/").filter(Boolean);
  if (!handle) {
    throw new Error("Could not extract a Behance handle from URL");
  }

  return handle;
}

type ForgTarget =
  | { kind: "product"; id: string }
  | { kind: "profile"; handle: string; profileUrl: string };

type ForgStats = {
  upvotes?: number;
};

type ForgSocialLink = {
  platform?: string;
  url?: string;
};

type ForgSkill = {
  name?: string;
};

type ForgUser = {
  displayName?: string;
  location?: string;
  website?: string;
  bio?: string;
  tagline?: string;
  skills?: ForgSkill[];
  socialLinks?: ForgSocialLink[];
};

type ForgProduct = {
  _id?: string;
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  website?: string;
  stats?: ForgStats;
};

type ForgWorkExperience = {
  company?: string;
  role?: string;
  primaryRole?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
};

type ForgCertification = {
  name?: string;
  issuedBy?: string;
  issuedDate?: string;
  certificateUrl?: string;
};

type ForgProfileResponse = {
  user?: ForgUser;
  products?: ForgProduct[];
  workExperience?: ForgWorkExperience[];
  certifications?: ForgCertification[];
};

async function fetchForgAPI<T>(path: string): Promise<T> {
  const apiKey = process.env.FORG_API_KEY;
  if (!apiKey) {
    throw new Error("Forg API key not configured");
  }
  const res = await fetch(`https://forg.to/api${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Forg API error: ${res.status}`);
  }
  return (await res.json()) as T;
}

function isValidForgProductId(value: string): boolean {
  return /^[a-zA-Z0-9-]{2,120}$/.test(value);
}

export type ForgProductOption = {
  id: string;
  title: string;
  score: number;
};

async function doGetForgProductOptions(forgInput: string): Promise<{
  target: "profile" | "product";
  username: string;
  options: ForgProductOption[];
}> {
  const target = parseForgTarget(forgInput);

  if (target.kind === "product") {
    try {
      const prod = await fetchForgAPI<ForgProduct>(`/products/${target.id}`);
      return {
        target: "product",
        username: target.id,
        options: [
          {
            id: prod.slug || target.id,
            title: prod.name || target.id,
            score: 1000,
          },
        ],
      };
    } catch {
      return {
        target: "product",
        username: target.id,
        options: [
          {
            id: target.id,
            title: target.id.replace(/-/g, " "),
            score: 1000,
          },
        ],
      };
    }
  }

  const data = await fetchForgAPI<ForgProfileResponse>(
    `/users/${target.handle}`,
  );
  const products = data.products ?? [];

  const options = products
    .map((p): ForgProductOption | null => {
      const id = p.slug ?? p._id;
      if (!id) return null;
      return {
        id,
        title: p.name || id,
        score: p.stats?.upvotes || 100,
      };
    })
    .filter((option): option is ForgProductOption => option !== null)
    .sort((a, b) => b.score - a.score);

  return {
    target: "profile",
    username: `@${target.handle}`,
    options,
  };
}

function parseForgTarget(input: string): ForgTarget {
  const raw = input.trim();
  if (!raw) {
    throw new Error("forg.to ID or URL is required");
  }

  if (/^@[a-zA-Z0-9_.-]{2,120}$/.test(raw)) {
    const handle = raw.slice(1);
    return {
      kind: "profile",
      handle,
      profileUrl: `https://forg.to/@${handle}`,
    };
  }

  if (!raw.includes("/")) {
    if (!/^[a-zA-Z0-9-]{2,120}$/.test(raw)) {
      throw new Error("Invalid forg.to ID format");
    }
    return { kind: "product", id: raw };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    throw new Error("Invalid forg.to URL");
  }

  if (!parsed.hostname.toLowerCase().includes("forg.to")) {
    throw new Error("Please provide a valid forg.to URL");
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  const decodedParts = parts.map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });

  if (
    decodedParts.length >= 2 &&
    decodedParts[0].toLowerCase() === "products"
  ) {
    const id = decodedParts[1];
    if (!id || !/^[a-zA-Z0-9-]{2,120}$/.test(id)) {
      throw new Error("Could not extract a valid forg.to product ID");
    }
    return { kind: "product", id };
  }

  if (decodedParts.length >= 1 && decodedParts[0].startsWith("@")) {
    const handle = decodedParts[0].slice(1);
    if (!handle || !/^[a-zA-Z0-9_.-]{2,120}$/.test(handle)) {
      throw new Error("Could not extract a valid forg.to profile handle");
    }
    return {
      kind: "profile",
      handle,
      profileUrl: `https://forg.to/@${handle}`,
    };
  }

  const id = decodedParts[decodedParts.length - 1];

  if (!id || !/^[a-zA-Z0-9-]{2,120}$/.test(id)) {
    throw new Error("Could not extract a valid forg.to product ID");
  }

  return { kind: "product", id };
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "lab68cvbuilder-importer",
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error("GitHub user not found");
  }

  if (!res.ok) {
    throw new Error("GitHub API request failed. Please try again.");
  }

  return (await res.json()) as T;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "lab68cvbuilder-importer",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unable to fetch public profile page");
  }

  return res.text();
}

function extractMetaContent(
  html: string,
  propertyOrName: string,
): string | undefined {
  const escaped = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);
  return match?.[1]?.trim();
}

function humanizeHandle(handle: string): string {
  return handle
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = (value ?? "").trim();
    if (!normalized) continue;

    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    output.push(normalized);
  }

  return output;
}

async function doImportFromGitHub(
  githubInput: string,
): Promise<SocialImportResult> {
  const username = parseGitHubUsername(githubInput);

  const [user, repos] = await Promise.all([
    fetchGitHub<GitHubUser>(`/users/${username}`),
    fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?sort=updated&per_page=12`,
    ),
  ]);

  const topRepos = repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4);

  const projects: ImportedProjectDraft[] = topRepos.map((repo) => {
    const technologies = uniqueStrings([
      repo.language,
      ...(repo.topics ?? []),
    ]).slice(0, 8);

    return {
      name: repo.name,
      description:
        repo.description?.trim() || "Open-source project from GitHub profile",
      url: repo.homepage?.trim() || repo.html_url,
      githubUrl: repo.html_url,
      websiteUrl: repo.homepage?.trim() || "",
      technologies,
      highlights: [
        repo.stargazers_count > 0
          ? `Earned ${repo.stargazers_count} GitHub stars`
          : "Published and maintained on GitHub",
      ],
    };
  });

  const languagePool = repos.map((repo) => repo.language);
  const topicPool = repos.flatMap((repo) => repo.topics ?? []);

  const skills: ImportedSkillCategoryDraft[] = [];

  const coreLanguages = uniqueStrings(languagePool).slice(0, 10);
  if (coreLanguages.length > 0) {
    skills.push({
      category: "Programming Languages",
      items: coreLanguages,
    });
  }

  const coreTopics = uniqueStrings(topicPool).slice(0, 12);
  if (coreTopics.length > 0) {
    skills.push({
      category: "Technologies",
      items: coreTopics,
    });
  }

  return {
    source: "github",
    username,
    personalInfo: {
      fullName: user.name || undefined,
      email: user.email || undefined,
      location: user.location || undefined,
      website: user.blog || undefined,
      linkedin: undefined,
      github: user.html_url,
      summary: user.bio || undefined,
    },
    projects,
    skills,
    experience: [],
    certifications: [],
    confidence: {
      personal: {
        fullName: user.name ? "confirmed" : "inferred",
        email: user.email ? "confirmed" : "inferred",
        location: user.location ? "confirmed" : "inferred",
        website: user.blog ? "confirmed" : "inferred",
        github: "confirmed",
        summary: user.bio ? "confirmed" : "inferred",
      },
      skills: "inferred",
      projects: "confirmed",
      experience: "inferred",
      certifications: "inferred",
    },
  };
}

async function doImportFromLinkedIn(
  linkedinInput: string,
): Promise<SocialImportResult> {
  const handle = parseLinkedInHandle(linkedinInput);
  const profileUrl = `https://www.linkedin.com/in/${handle}`;

  let fullName = humanizeHandle(handle);
  let summary: string | undefined;

  try {
    const html = await fetchHtml(profileUrl);
    const ogTitle = extractMetaContent(html, "og:title");
    const ogDescription = extractMetaContent(html, "og:description");

    if (ogTitle) {
      fullName = ogTitle.split("|")[0].trim() || fullName;
    }
    if (ogDescription) {
      summary = ogDescription;
    }
  } catch {
    // Public LinkedIn pages are often restricted; keep inferred fallback values.
  }

  return {
    source: "linkedin",
    username: handle,
    personalInfo: {
      fullName,
      email: undefined,
      location: undefined,
      website: undefined,
      linkedin: profileUrl,
      github: "",
      summary,
    },
    projects: [],
    skills: [],
    experience: [],
    certifications: [],
    confidence: {
      personal: {
        fullName: "inferred",
        linkedin: "confirmed",
        summary: summary ? "inferred" : undefined,
      },
      skills: "inferred",
      projects: "inferred",
      experience: "inferred",
      certifications: "inferred",
    },
  };
}

async function doImportFromBehance(
  behanceInput: string,
): Promise<SocialImportResult> {
  const handle = parseBehanceHandle(behanceInput);
  const profileUrl = `https://www.behance.net/${handle}`;

  let fullName = humanizeHandle(handle);
  let summary: string | undefined;
  const projects: ImportedProjectDraft[] = [];

  try {
    const html = await fetchHtml(profileUrl);
    const ogTitle = extractMetaContent(html, "og:title");
    const ogDescription = extractMetaContent(html, "og:description");

    if (ogTitle) {
      fullName = ogTitle.split("on Behance")[0].trim() || fullName;
    }
    if (ogDescription) {
      summary = ogDescription;
    }

    const galleryMatches = [
      ...html.matchAll(/\/gallery\/(\d+)\/([A-Za-z0-9_%.-]+)/g),
    ]
      .map((m) => ({
        id: m[1],
        slug: decodeURIComponent(m[2].replace(/-/g, " ")),
      }))
      .filter(
        (item, index, arr) => arr.findIndex((a) => a.id === item.id) === index,
      )
      .slice(0, 4);

    for (const item of galleryMatches) {
      projects.push({
        name: item.slug,
        description: "Creative portfolio project imported from Behance",
        url: `https://www.behance.net/gallery/${item.id}/${item.slug.replace(/\s+/g, "-")}`,
        githubUrl: "",
        websiteUrl: `https://www.behance.net/gallery/${item.id}/${item.slug.replace(/\s+/g, "-")}`,
        technologies: ["Design"],
        highlights: ["Published portfolio project on Behance"],
      });
    }
  } catch {
    // Keep minimal import if profile parsing is unavailable.
  }

  return {
    source: "behance",
    username: handle,
    personalInfo: {
      fullName,
      email: undefined,
      location: undefined,
      website: profileUrl,
      linkedin: undefined,
      github: "",
      summary,
    },
    projects,
    skills: [],
    experience: [],
    certifications: [],
    confidence: {
      personal: {
        fullName: "inferred",
        website: "confirmed",
        summary: summary ? "inferred" : "inferred",
      },
      skills: "inferred",
      projects: projects.length > 0 ? "inferred" : "inferred",
      experience: "inferred",
      certifications: "inferred",
    },
  };
}

async function doImportFromForg(
  forgInput: string,
  preferredProductId?: string,
): Promise<SocialImportResult> {
  const target = parseForgTarget(forgInput);

  let id = target.kind === "product" ? target.id : "";
  let productData: ForgProduct | null = null;
  let userData: ForgUser | undefined;

  let profileData: ForgProfileResponse | null = null;

  if (target.kind === "profile") {
    profileData = await fetchForgAPI<ForgProfileResponse>(
      `/users/${target.handle}`,
    );
    userData = profileData.user;
    if (preferredProductId) {
      const normalizedPreferred = preferredProductId.trim();
      if (!isValidForgProductId(normalizedPreferred)) {
        throw new Error("Invalid selected forg.to product ID");
      }
      productData =
        (profileData.products || []).find(
          (p) =>
            p.slug === normalizedPreferred || p._id === normalizedPreferred,
        ) ||
        profileData.products?.[0] ||
        null;
      if (!productData) {
        productData = await fetchForgAPI<ForgProduct>(
          `/products/${normalizedPreferred}`,
        );
      }
    } else {
      productData = profileData.products?.[0] || null;
    }
  } else {
    if (preferredProductId) {
      id = preferredProductId.trim();
    }
    productData = await fetchForgAPI<ForgProduct>(`/products/${id}`);
  }

  const title = productData?.name || id.replace(/-/g, " ");
  const prodSummary = productData?.tagline || "";
  const website = productData?.website
    ? `https://${productData.website.replace(/^https?:\/\//, "")}`
    : `https://forg.to/products/${productData?.slug || id}`;

  const displayName = title.replace(/\s*\|\s*forg.*$/i, "").trim() || id;

  const projects: ImportedProjectDraft[] = [];
  const experience: ImportedExperienceDraft[] = [];
  const certifications: ImportedCertificationDraft[] = [];
  const skills: ImportedSkillCategoryDraft[] = [];

  if (profileData) {
    if (profileData.products && profileData.products.length > 0) {
      for (const p of profileData.products) {
        const pWebsite = p.website
          ? `https://${p.website.replace(/^https?:\/\//, "")}`
          : `https://forg.to/products/${p.slug || p._id}`;
        projects.push({
          name: p.name || "",
          description: p.tagline || p.description || "Product from forg.to",
          url: pWebsite,
          githubUrl: "",
          websiteUrl: pWebsite,
          technologies: ["Product", "Web"],
          highlights: p.stats?.upvotes
            ? [`Received ${p.stats.upvotes} upvotes on forg.to`]
            : [`Published on forg.to`],
        });
      }
    }

    if (profileData.workExperience && profileData.workExperience.length > 0) {
      for (const exp of profileData.workExperience) {
        experience.push({
          company: exp.company || "",
          position: exp.role || exp.primaryRole || "",
          location: exp.location || undefined,
          startDate: exp.startDate
            ? new Date(exp.startDate).toISOString().substring(0, 7)
            : "",
          endDate: exp.endDate
            ? new Date(exp.endDate).toISOString().substring(0, 7)
            : undefined,
          current: exp.isCurrent || false,
          description: exp.description || "",
          highlights: [],
        });
      }
    }

    if (profileData.certifications && profileData.certifications.length > 0) {
      for (const cert of profileData.certifications) {
        certifications.push({
          name: cert.name || "",
          issuer: cert.issuedBy || "",
          date: cert.issuedDate
            ? new Date(cert.issuedDate).toISOString().substring(0, 7)
            : "",
          url: cert.certificateUrl || undefined,
        });
      }
    }

    if (userData?.skills && userData.skills.length > 0) {
      const skillNames = userData.skills
        .map((s) => s.name)
        .filter((name): name is string => Boolean(name));
      skills.push({
        category: "Skills",
        items: skillNames,
      });
    }
  }

  if (projects.length === 0 && productData) {
    projects.push({
      name: displayName,
      description: prodSummary || "Product imported from forg.to",
      url: website,
      githubUrl: "",
      websiteUrl: website,
      technologies: ["Product", "Web"],
      highlights: productData.stats?.upvotes
        ? [`Received ${productData.stats.upvotes} upvotes on forg.to`]
        : [`Published on forg.to`],
    });
  }

  if (skills.length === 0) {
    skills.push({
      category: "Product",
      items: ["Product Development", "Launch", "Portfolio"],
    });
  }

  return {
    source: "forg",
    username: target.kind === "profile" ? `@${target.handle}` : id,
    personalInfo: {
      fullName: userData?.displayName || undefined,
      email: undefined,
      location: userData?.location || undefined,
      website: userData?.website || website,
      linkedin:
        userData?.socialLinks?.find((l) => l.platform === "linkedin")?.url ||
        undefined,
      github:
        userData?.socialLinks?.find((l) => l.platform === "github")?.url || "",
      summary:
        userData?.bio ||
        userData?.tagline ||
        prodSummary ||
        `Built and launched ${displayName} on forg.to`,
    },
    projects,
    skills,
    experience,
    certifications,
    confidence: {
      personal: {
        fullName: userData?.displayName ? "confirmed" : "inferred",
        location: userData?.location ? "confirmed" : "inferred",
        website: "confirmed",
        linkedin: "confirmed",
        github: "confirmed",
        summary: "confirmed",
      },
      skills: userData?.skills?.length ? "confirmed" : "inferred",
      projects: projects.length > 0 ? "confirmed" : "inferred",
      experience: experience.length > 0 ? "confirmed" : "inferred",
      certifications: certifications.length > 0 ? "confirmed" : "inferred",
    },
  };
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function importFromGitHub(
  input: string,
): Promise<ActionResponse<SocialImportResult>> {
  try {
    await enforceImportLimit();
    const data = await doImportFromGitHub(input);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "GitHub import failed.",
    };
  }
}

export async function importFromLinkedIn(
  input: string,
): Promise<ActionResponse<SocialImportResult>> {
  try {
    await enforceImportLimit();
    const data = await doImportFromLinkedIn(input);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "LinkedIn import failed.",
    };
  }
}

export async function importFromBehance(
  input: string,
): Promise<ActionResponse<SocialImportResult>> {
  try {
    await enforceImportLimit();
    const data = await doImportFromBehance(input);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Behance import failed.",
    };
  }
}

export async function importFromForg(
  input: string,
  preferredProductId?: string,
): Promise<ActionResponse<SocialImportResult>> {
  try {
    await enforceImportLimit();
    const data = await doImportFromForg(input, preferredProductId);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Forg import failed.",
    };
  }
}

export async function getForgProductOptions(
  input: string,
): Promise<
  ActionResponse<{
    target: "profile" | "product";
    username: string;
    options: ForgProductOption[];
  }>
> {
  try {
    await enforceImportLimit();
    const data = await doGetForgProductOptions(input);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load Forg products.",
    };
  }
}
