"use client";

import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";

type Severity = "error" | "warning" | "tip";

interface Suggestion {
  section: string;
  severity: Severity;
  message: string;
}

function analyzeResume(data: ResumeData): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const p = data.personalInfo;

  // Personal info
  if (!p.fullName.trim()) {
    suggestions.push({
      section: "Personal",
      severity: "error",
      message: "Add your full name — it's the first thing recruiters see.",
    });
  }
  if (!p.email.trim()) {
    suggestions.push({
      section: "Personal",
      severity: "error",
      message: "Add an email address so employers can contact you.",
    });
  }
  if (!(p.phone ?? "").trim()) {
    suggestions.push({
      section: "Personal",
      severity: "warning",
      message: "Consider adding a phone number for quicker recruiter contact.",
    });
  }
  if (!(p.location ?? "").trim()) {
    suggestions.push({
      section: "Personal",
      severity: "tip",
      message: "Adding a location helps with geography-based job matching.",
    });
  }
  const summary = (p.summary ?? "").trim();
  if (!summary) {
    suggestions.push({
      section: "Personal",
      severity: "warning",
      message:
        "Write a professional summary — a 2-3 sentence elevator pitch increases engagement.",
    });
  } else if (summary.length < 50) {
    suggestions.push({
      section: "Personal",
      severity: "tip",
      message:
        "Your summary is rather short. Aim for 50-200 characters with key strengths.",
    });
  } else if (summary.length > 300) {
    suggestions.push({
      section: "Personal",
      severity: "tip",
      message:
        "Your summary is quite long. Keep it concise — 2-3 impactful sentences work best.",
    });
  }
  if (
    !(p.linkedin ?? "").trim() &&
    !(p.github ?? "").trim() &&
    !(p.website ?? "").trim()
  ) {
    suggestions.push({
      section: "Personal",
      severity: "tip",
      message:
        "Add at least one professional link (LinkedIn, GitHub, or portfolio).",
    });
  }

  // Experience
  if (data.experience.length === 0) {
    suggestions.push({
      section: "Experience",
      severity: "warning",
      message:
        "Add work experience — it's the most important section for most roles.",
    });
  }
  for (const exp of data.experience) {
    if (!exp.position.trim() || !exp.company.trim()) {
      suggestions.push({
        section: "Experience",
        severity: "error",
        message: `Fill in position and company for all experience entries.`,
      });
      break;
    }
  }
  for (const exp of data.experience) {
    if (!exp.description.trim()) {
      suggestions.push({
        section: "Experience",
        severity: "warning",
        message: `Add a description for "${exp.position || "untitled role"}" — explain what you did.`,
      });
    }
  }
  const noHighlights = data.experience.filter(
    (e) => e.highlights.filter((h) => h.trim()).length === 0,
  );
  if (noHighlights.length > 0 && data.experience.length > 0) {
    suggestions.push({
      section: "Experience",
      severity: "tip",
      message:
        "Add bullet-point highlights with quantifiable achievements (e.g., 'Increased sales by 30%').",
    });
  }
  const hasNumbers = data.experience.some((e) =>
    /\d+%|\$\d|[0-9]+[xX]/.test(e.description + e.highlights.join(" ")),
  );
  if (data.experience.length > 0 && !hasNumbers) {
    suggestions.push({
      section: "Experience",
      severity: "tip",
      message:
        "Use numbers and metrics in your experience (e.g., 'managed team of 8', 'reduced costs by 20%').",
    });
  }
  const hasActionVerbs = data.experience.some((e) =>
    /^(Led|Built|Developed|Managed|Designed|Implemented|Created|Launched|Improved|Reduced|Increased|Achieved)/m.test(
      e.highlights.join("\n"),
    ),
  );
  if (data.experience.length > 0 && !hasActionVerbs) {
    suggestions.push({
      section: "Experience",
      severity: "tip",
      message:
        "Start highlight bullets with strong action verbs: Led, Built, Improved, Reduced, etc.",
    });
  }

  // Education
  if (data.education.length === 0) {
    suggestions.push({
      section: "Education",
      severity: "warning",
      message:
        "Add your education background — most employers expect at least one entry.",
    });
  }
  for (const edu of data.education) {
    if (!edu.institution.trim() || !edu.degree.trim()) {
      suggestions.push({
        section: "Education",
        severity: "error",
        message: "Fill in institution and degree for all education entries.",
      });
      break;
    }
  }

  // Skills
  if (data.skills.length === 0) {
    suggestions.push({
      section: "Skills",
      severity: "warning",
      message: "Add skill categories — ATS systems scan for specific keywords.",
    });
  }
  const emptyCategories = data.skills.filter((s) => s.items.length === 0);
  if (emptyCategories.length > 0) {
    suggestions.push({
      section: "Skills",
      severity: "warning",
      message:
        "Some skill categories are empty — add items or remove the category.",
    });
  }

  // Projects
  if (data.projects.length === 0 && data.experience.length < 2) {
    suggestions.push({
      section: "Projects",
      severity: "tip",
      message:
        "With limited experience, adding projects helps demonstrate your abilities.",
    });
  }

  // General length
  const totalHighlights = data.experience.reduce(
    (n, e) => n + e.highlights.filter((h) => h.trim()).length,
    0,
  );
  if (totalHighlights > 20) {
    suggestions.push({
      section: "General",
      severity: "tip",
      message:
        "You have many highlights. Keep your resume to 1-2 pages for best results.",
    });
  }

  return suggestions;
}

const severityStyles: Record<
  Severity,
  { dot: string; text: string; bg: string }
> = {
  error: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  warning: {
    dot: "bg-yellow-500",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  tip: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
};

export function AISuggestionsPanel() {
  const { data } = useResumeStore();
  const suggestions = analyzeResume(data);

  const errors = suggestions.filter((s) => s.severity === "error");
  const warnings = suggestions.filter((s) => s.severity === "warning");
  const tips = suggestions.filter((s) => s.severity === "tip");

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">Suggestions</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Smart Suggestions
        </h2>
        <p className="text-sm text-gray-600">
          Actionable tips to make your resume stronger
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="border border-green-600 bg-green-50 p-6 text-center">
          <p className="text-2xl font-black text-green-700 mb-2">
            ✓ Looking Great!
          </p>
          <p className="text-sm text-green-600">
            No issues found. Your resume is well-structured.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 text-xs font-bold ">
            {errors.length > 0 && (
              <span className="text-red-600">{errors.length} critical</span>
            )}
            {warnings.length > 0 && (
              <span className="text-yellow-600">
                {warnings.length} warnings
              </span>
            )}
            {tips.length > 0 && (
              <span className="text-blue-600">{tips.length} tips</span>
            )}
          </div>

          <div className="border border-black divide-y divide-gray-200">
            {suggestions.map((s, i) => {
              const style = severityStyles[s.severity];
              return (
                <div key={i} className={`px-4 py-3 ${style.bg}`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`}
                    />
                    <div>
                      <span className="label-mono text-gray-400 mr-2">
                        {s.section}
                      </span>
                      <span className={`text-sm ${style.text}`}>
                        {s.message}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
