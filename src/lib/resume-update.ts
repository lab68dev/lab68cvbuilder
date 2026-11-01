import type { ResumeData } from "@/db/schema";
import { TEMPLATES } from "@/lib/constants";
import { CV_FONTS } from "@/lib/fonts";

export type ResumeUpdate = Partial<{
  title: string;
  data: ResumeData;
  templateId: string;
  fontFamily: string;
}>;

const LIST_SECTIONS = [
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
] as const;

function isResumeData(value: unknown): value is ResumeData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.personalInfo === "object" &&
    data.personalInfo !== null &&
    LIST_SECTIONS.every((section) => Array.isArray(data[section]))
  );
}

/**
 * Keep only the columns a client may change. The request body is untrusted, and
 * anything else in it (userId, id, isPublic) must never reach the database.
 */
export function pickResumeUpdate(input: unknown): ResumeUpdate {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid resume update");
  }

  const { title, data, templateId, fontFamily } = input as Record<
    string,
    unknown
  >;
  const update: ResumeUpdate = {};

  if (title !== undefined) {
    if (typeof title !== "string") throw new Error("Invalid resume title");
    update.title = title;
  }

  if (data !== undefined) {
    if (!isResumeData(data)) throw new Error("Invalid resume data");
    update.data = data;
  }

  // Older resumes may hold retired ids, so an unknown id is ignored, not an error:
  // rejecting it would make every autosave of those resumes fail.
  if (TEMPLATES.some((template) => template.id === templateId)) {
    update.templateId = templateId as string;
  }

  if (CV_FONTS.some((font) => font.id === fontFamily)) {
    update.fontFamily = fontFamily as string;
  }

  return update;
}
