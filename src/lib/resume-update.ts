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

const SHARE_FLAGS = ["shareEmail", "sharePhone", "shareLocation"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isResumeData(value: unknown): value is ResumeData {
  if (!isObject(value) || !isObject(value.personalInfo)) return false;
  const { personalInfo } = value;

  return (
    SHARE_FLAGS.every((flag) =>
      ["undefined", "boolean"].includes(typeof personalInfo[flag]),
    ) &&
    LIST_SECTIONS.every((section) => {
      const list = value[section];
      return Array.isArray(list) && list.every(isObject);
    })
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
