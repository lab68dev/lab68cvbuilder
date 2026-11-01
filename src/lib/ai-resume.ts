import type { ResumeData } from "@/db/schema";

type AiRecord = Record<string, unknown>;

function asRecord(value: unknown): AiRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as AiRecord)
    : null;
}

/** Copy reworded text onto the original, leaving every other field alone. */
function mergeFields<T extends object>(
  original: T,
  ai: AiRecord,
  textFields: Array<keyof T & string>,
  listFields: Array<keyof T & string> = [],
): T {
  const merged = { ...original };

  for (const field of textFields) {
    const value = ai[field];
    // An empty original stays empty so the AI cannot invent content.
    if (original[field] && typeof value === "string" && value.trim()) {
      merged[field] = value as T[typeof field];
    }
  }

  for (const field of listFields) {
    const value = ai[field];
    const current = original[field];
    if (
      Array.isArray(value) &&
      Array.isArray(current) &&
      value.length === current.length &&
      value.every((item) => typeof item === "string" && item.trim())
    ) {
      merged[field] = value as T[typeof field];
    }
  }

  return merged;
}

/** Follow the AI's order, but never add an entry or lose one. */
function mergeList<T extends { id: string }>(
  original: T[] | undefined,
  ai: unknown,
  textFields: Array<keyof T & string>,
  listFields?: Array<keyof T & string>,
): T[] {
  const remaining = new Map((original ?? []).map((item) => [item.id, item]));
  const merged: T[] = [];

  for (const value of Array.isArray(ai) ? ai : []) {
    const aiItem = asRecord(value);
    const item = aiItem && remaining.get(String(aiItem.id));
    if (!aiItem || !item) continue;

    remaining.delete(item.id);
    merged.push(mergeFields(item, aiItem, textFields, listFields));
  }

  return [...merged, ...remaining.values()];
}

/**
 * Apply an AI rewrite to a resume. AI output is untrusted: it can drop sections,
 * lose ids or change facts, so it only ever supplies wording. Ids, dates, links,
 * contact details and share settings always come from the original.
 */
export function mergeAiResume(original: ResumeData, ai: unknown): ResumeData {
  const result = asRecord(ai);
  const personalInfo = asRecord(result?.personalInfo);
  if (!result || !personalInfo) {
    throw new Error("AI returned an invalid resume. Please try again.");
  }

  return {
    ...original,
    personalInfo: mergeFields(original.personalInfo, personalInfo, [
      "fullName",
      "location",
      "summary",
    ]),
    experience: mergeList(
      original.experience,
      result.experience,
      ["company", "position", "location", "description"],
      ["highlights"],
    ),
    education: mergeList(
      original.education,
      result.education,
      ["institution", "degree", "field", "location"],
      ["coursework", "highlights"],
    ),
    skills: mergeList(original.skills, result.skills, ["category"], ["items"]),
    projects: mergeList(
      original.projects,
      result.projects,
      ["name", "description"],
      ["technologies", "highlights"],
    ),
    certifications: mergeList(original.certifications, result.certifications, [
      "name",
      "issuer",
    ]),
    languages: mergeList(original.languages, result.languages, ["language"]),
    competitions: mergeList(
      original.competitions,
      result.competitions,
      ["name", "role", "location", "description"],
      ["highlights"],
    ),
  };
}
