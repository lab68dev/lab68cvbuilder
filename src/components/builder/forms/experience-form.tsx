"use client";

import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";

export function ExperienceForm() {
  const { data, setData } = useResumeStore();
  const { experience } = data;

  const addExperience = () => {
    const newExperience: ResumeData["experience"][0] = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    };

    setData({
      ...data,
      experience: [...experience, newExperience],
    });
  };

  const removeExperience = (id: string) => {
    setData({
      ...data,
      experience: experience.filter((exp) => exp.id !== id),
    });
  };

  const updateExperience = (
    id: string,
    updates: Partial<ResumeData["experience"][0]>
  ) => {
    setData({
      ...data,
      experience: experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    });
  };

  const updateHighlight = (expId: string, index: number, value: string) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;

    updateExperience(expId, { highlights: newHighlights });
  };

  const addHighlight = (expId: string) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    updateExperience(expId, { highlights: [...exp.highlights, ""] });
  };

  const removeHighlight = (expId: string, index: number) => {
    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    updateExperience(expId, {
      highlights: exp.highlights.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">SECTION_02 // EXPERIENCE</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Work Experience
        </h2>
        <p className="text-sm text-gray-600">
          Professional experience and achievements
        </p>
      </div>

      <div className="space-y-8">
        {experience.map((exp, index) => (
          <div key={exp.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="label-mono">
                ENTRY_{String(index + 1).padStart(2, "0")}
              </span>
              <button
                onClick={() => removeExperience(exp.id)}
                className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              {/* Position */}
              <div>
                <label className="label-mono block mb-2">POSITION *</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(exp.id, { position: e.target.value })
                  }
                  placeholder="Senior Software Engineer"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150"
                />
              </div>

              {/* Company */}
              <div>
                <label className="label-mono block mb-2">COMPANY *</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, { company: e.target.value })
                  }
                  placeholder="Tech Corp Inc."
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150"
                />
              </div>

              {/* Location */}
              <div>
                <label className="label-mono block mb-2">LOCATION</label>
                <input
                  type="text"
                  value={exp.location || ""}
                  onChange={(e) =>
                    updateExperience(exp.id, { location: e.target.value })
                  }
                  placeholder="New York, NY"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">START_DATE *</label>
                  <input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, { startDate: e.target.value })
                    }
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">END_DATE</label>
                  <input
                    type="month"
                    value={exp.endDate || ""}
                    onChange={(e) =>
                      updateExperience(exp.id, { endDate: e.target.value })
                    }
                    disabled={exp.current}
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Current role */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current}
                  onChange={(e) =>
                    updateExperience(exp.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : exp.endDate,
                    })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor={`current-${exp.id}`}
                  className="text-sm font-medium"
                >
                  Currently working here
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="label-mono block mb-2">DESCRIPTION</label>
                <textarea
                  value={exp.description}
                  onChange={(e) =>
                    updateExperience(exp.id, { description: e.target.value })
                  }
                  placeholder="Brief description of your role and responsibilities..."
                  rows={3}
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150 resize-none"
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="label-mono block mb-2">
                  KEY_ACHIEVEMENTS
                </label>
                <div className="space-y-2 mb-3">
                  {exp.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) =>
                          updateHighlight(exp.id, idx, e.target.value)
                        }
                        placeholder="Increased revenue by 40%..."
                        className="flex-1 border border-gray-400 bg-transparent px-3 py-2 focus:border-black focus:bg-black focus:text-white transition-all duration-150"
                      />
                      <button
                        onClick={() => removeHighlight(exp.id, idx)}
                        className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-red-600 hover:text-red-600 transition-colors duration-150"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addHighlight(exp.id)}
                  className="border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
                >
                  + Add Achievement
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new button */}
        <button
          onClick={addExperience}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Work Experience
        </button>
      </div>
    </div>
  );
}
