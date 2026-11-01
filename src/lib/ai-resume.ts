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

/** Keep every original entry in its place; the AI can only reword them. */
function mergeList<T extends { id: string }>(
  original: T[] | undefined,
  ai: unknown,
  textFields: Array<keyof T & string>,
  listFields?: Array<keyof T & string>,
): T[] {
  const aiItems = (Array.isArray(ai) ? (ai as unknown[]) : [])
    .map(asRecord)
    .filter((item) => item !== null);

  return (original ?? []).map((item) => {
    const index = aiItems.findIndex((aiItem) => String(aiItem.id) === item.id);
    if (index < 0) return item;

    // Each AI entry is used once, so entries that share an id stay separate.
    const [aiItem] = aiItems.splice(index, 1);
    return mergeFields(item, aiItem, textFields, listFields);
  });
}

/**
 * Apply an AI rewrite to a resume. AI output is untrusted: it can drop sections,
 * lose ids or change facts, so it only supplies sentences: the summary,
 * descriptions and highlights. Names, job titles, places, skills, dates, links,
 * contact details and share settings are facts and always come from the original.
 */
export function mergeAiResume(original: ResumeData, ai: unknown): ResumeData {
  const result = asRecord(ai);
  const personalInfo = asRecord(result?.personalInfo);
  if (!result || !personalInfo) {
    throw new Error("AI returned an invalid resume. Please try again.");
  }

  return {
    ...original,
    personalInfo: mergeFields(original.personalInfo, personalInfo, ["summary"]),
    experience: mergeList(
      original.experience,
      result.experience,
      ["description"],
      ["highlights"],
    ),
    education: mergeList(
      original.education,
      result.education,
      [],
      ["highlights"],
    ),
    projects: mergeList(
      original.projects,
      result.projects,
      ["description"],
      ["highlights"],
    ),
    competitions: mergeList(
      original.competitions,
      result.competitions,
      ["description"],
      ["highlights"],
    ),
  };
}
