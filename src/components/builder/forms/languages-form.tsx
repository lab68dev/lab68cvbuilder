"use client";

import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";

const PROFICIENCY_LEVELS: ResumeData["languages"][0]["proficiency"][] = [
  "native",
  "fluent",
  "advanced",
  "intermediate",
  "beginner",
];

const PROFICIENCY_LABELS: Record<
  ResumeData["languages"][0]["proficiency"],
  string
> = {
  native: "Native",
  fluent: "Fluent",
  advanced: "Advanced",
  intermediate: "Intermediate",
  beginner: "Beginner",
};

export function LanguagesForm() {
  const { data, setData } = useResumeStore();
  const { languages } = data;

  const addLanguage = () => {
    const newLang: ResumeData["languages"][0] = {
      id: crypto.randomUUID(),
      language: "",
      proficiency: "intermediate",
    };
    setData({ ...data, languages: [...languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    setData({
      ...data,
      languages: languages.filter((l) => l.id !== id),
    });
  };

  const updateLanguage = (
    id: string,
    updates: Partial<ResumeData["languages"][0]>,
  ) => {
    setData({
      ...data,
      languages: languages.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">SECTION_07 // LANGUAGES</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">Languages</h2>
        <p className="text-sm text-gray-600">
          Languages you speak and your proficiency level
        </p>
      </div>

      <div className="space-y-4">
        {languages.map((lang, index) => (
          <div
            key={lang.id}
            className="border border-black p-6 flex flex-col sm:flex-row gap-4 items-start"
          >
            <span className="label-mono shrink-0 pt-2">
              LANG_{String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="label-mono block mb-2">LANGUAGE *</label>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) =>
                    updateLanguage(lang.id, { language: e.target.value })
                  }
                  placeholder="English"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>
              <div>
                <label className="label-mono block mb-2">PROFICIENCY</label>
                <select
                  value={lang.proficiency}
                  title="Language proficiency level"
                  onChange={(e) =>
                    updateLanguage(lang.id, {
                      proficiency: e.target
                        .value as ResumeData["languages"][0]["proficiency"],
                    })
                  }
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {PROFICIENCY_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => removeLanguage(lang.id)}
              className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150 shrink-0"
            >
              ×
            </button>
          </div>
        ))}

        <button
          onClick={addLanguage}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Language
        </button>
      </div>
    </div>
  );
}
