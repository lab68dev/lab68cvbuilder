import type { ResumeData } from "@/db/schema";

/**
 * Empty resume data template — used when creating new resumes.
 */
export const EMPTY_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
    bulletSymbol: "•",
    shareEmail: true,
    sharePhone: true,
    shareLocation: true,
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  competitions: [],
};

/**
 * Available templates
 */
export const TEMPLATES = [
  {
    id: "harvard",
    name: "Harvard Style",
    description: "Modern tech style. Elegant and academic.",
    category: "professional",
  },
  {
    id: "creative",
    name: "Creative / Portfolio",
    description: "Visually distinct. Stand out with style.",
    category: "creative",
  },
  {
    id: "ats",
    name: "ATS-Optimized",
    description: "Plain text focus. Maximum parsing compatibility.",
    category: "ats",
  },
  {
    id: "executive",
    name: "Executive / Leadership",
    description: "Clean top-down structure. Boardroom ready.",
    category: "professional",
  },
  {
    id: "minimal",
    name: "Minimal / Classic",
    description: "Quiet typography for concise professional profiles.",
    category: "professional",
  },
  {
    id: "modern",
    name: "Modern / Hybrid",
    description: "Balanced modern hierarchy with executive clarity.",
    category: "professional",
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

/**
 * localStorage key for unauthenticated resume draft persistence.
 */
export const GUEST_STORAGE_KEY = "lab68_guest_resume";

/**
 * localStorage key for guest journey metadata used during login migration.
 */
export const GUEST_MIGRATION_META_KEY = "lab68_guest_migration_meta";

/**
 * Query param on the dashboard that tells it to import the guest draft.
 */
export const GUEST_MIGRATION_PARAM = "migrateGuest";
