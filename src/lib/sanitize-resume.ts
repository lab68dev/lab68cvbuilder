import type { ResumeData } from "@/db/schema";

/**
 * Normalize resume data before it is stored: cap the bullet symbol, make share
 * settings explicit and fill in fields that older resumes may lack.
 *
 * Text is kept exactly as typed. React and the PDF renderer both print it as
 * plain text, and values like `List<String>` or `<200ms` must survive saving.
 */
export function sanitizeResumeData(data: ResumeData): ResumeData {
  return {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      bulletSymbol: (data.personalInfo.bulletSymbol ?? "").slice(0, 3),
      shareEmail: data.personalInfo.shareEmail !== false,
      sharePhone: data.personalInfo.sharePhone !== false,
      shareLocation: data.personalInfo.shareLocation !== false,
    },
    education: data.education.map((edu) => ({
      ...edu,
      coursework: edu.coursework ?? [],
    })),
    competitions: data.competitions ?? [],
  };
}
