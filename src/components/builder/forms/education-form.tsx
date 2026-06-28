"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";
import { MonthInput } from "./month-input";

export function EducationForm() {
  const { data, setData } = useResumeStore();
  const { education } = data;
  const [courseworkInputs, setCourseworkInputs] = useState<
    Record<string, string>
  >({});

  const addEducation = () => {
    const newEducation: ResumeData["education"][0] = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      coursework: [],
      highlights: [],
    };

    setData({
      ...data,
      education: [...education, newEducation],
    });
  };

  const removeEducation = (id: string) => {
    setData({
      ...data,
      education: education.filter((edu) => edu.id !== id),
    });

    setCourseworkInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= education.length) return;
    const next = [...education];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, education: next });
  };

  const updateEducation = (
    id: string,
    updates: Partial<ResumeData["education"][0]>,
  ) => {
    setData({
      ...data,
      education: education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu,
      ),
    });
  };

  const addCoursework = (eduId: string, value: string) => {
    const edu = education.find((e) => e.id === eduId);
    const clean = value.trim();
    if (!edu || !clean) return;

    updateEducation(eduId, {
      coursework: [...(edu.coursework ?? []), clean],
    });
  };

  const removeCoursework = (eduId: string, idx: number) => {
    const edu = education.find((e) => e.id === eduId);
    if (!edu) return;

    updateEducation(eduId, {
      coursework: (edu.coursework ?? []).filter((_, i) => i !== idx),
    });
  };

  const handleCourseworkKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    eduId: string,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = courseworkInputs[eduId] || "";
      if (value.trim()) {
        addCoursework(eduId, value);
        setCourseworkInputs((prev) => ({ ...prev, [eduId]: "" }));
      }
    } else if (e.key === "Backspace" && !(courseworkInputs[eduId] || "")) {
      const edu = education.find((item) => item.id === eduId);
      if (edu && (edu.coursework ?? []).length > 0) {
        removeCoursework(eduId, (edu.coursework ?? []).length - 1);
      }
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">SECTION_03 // EDUCATION</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">Education</h2>
        <p className="text-sm text-gray-600">Academic background and degrees</p>
      </div>

      <div className="space-y-8">
        {education.map((edu, index) => (
          <div key={edu.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="label-mono">
                ENTRY_{String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveEducation(index, "up")}
                  disabled={index === 0}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveEducation(index, "down")}
                  disabled={index === education.length - 1}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-mono block mb-2">INSTITUTION *</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(edu.id, { institution: e.target.value })
                  }
                  placeholder="University of California"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">DEGREE *</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, { degree: e.target.value })
                    }
                    placeholder="Bachelor of Science"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">FIELD *</label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) =>
                      updateEducation(edu.id, { field: e.target.value })
                    }
                    placeholder="Computer Science"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="label-mono block mb-2">LOCATION</label>
                  <input
                    type="text"
                    value={edu.location || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { location: e.target.value })
                    }
                    placeholder="Berkeley, CA"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">GPA</label>
                  <input
                    type="text"
                    value={edu.gpa || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { gpa: e.target.value })
                    }
                    placeholder="3.8"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">START_DATE *</label>
                  <MonthInput
                    key={`edu-start-${edu.id}-${edu.startDate || "empty"}`}
                    value={edu.startDate}
                    onChange={(value) =>
                      updateEducation(edu.id, { startDate: value })
                    }
                    required
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">END_DATE</label>
                  <MonthInput
                    key={`edu-end-${edu.id}-${edu.endDate || "empty"}-${edu.current ? "current" : "open"}`}
                    value={edu.endDate || ""}
                    onChange={(value) =>
                      updateEducation(edu.id, { endDate: value })
                    }
                    disabled={edu.current}
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`current-edu-${edu.id}`}
                  checked={edu.current}
                  onChange={(e) =>
                    updateEducation(edu.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : edu.endDate,
                    })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor={`current-edu-${edu.id}`}
                  className="text-sm font-medium"
                >
                  Currently enrolled
                </label>
              </div>

              <div>
                <label className="label-mono block mb-2">
                  RELEVANT_COURSEWORK
                </label>
                <div className="border border-gray-400 bg-transparent p-2 min-h-12">
                  <div className="flex flex-wrap gap-2">
                    {(edu.coursework ?? []).length === 0 && (
                      <span className="text-xs text-gray-500">
                        No coursework added yet.
                      </span>
                    )}
                    {(edu.coursework ?? []).map((course, idx) => (
                      <span
                        key={`${edu.id}-course-${idx}`}
                        className="inline-flex items-center gap-1 border border-black bg-black text-white px-2 py-1 text-sm"
                      >
                        {course}
                        <button
                          type="button"
                          onClick={() => removeCoursework(edu.id, idx)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={courseworkInputs[edu.id] || ""}
                    onChange={(e) =>
                      setCourseworkInputs((prev) => ({
                        ...prev,
                        [edu.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => handleCourseworkKeyDown(e, edu.id)}
                    placeholder="Add a course (e.g. Data Structures)"
                    className="flex-1 border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const value = courseworkInputs[edu.id] || "";
                      if (!value.trim()) return;
                      addCoursework(edu.id, value);
                      setCourseworkInputs((prev) => ({
                        ...prev,
                        [edu.id]: "",
                      }));
                    }}
                    className="border border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
                  >
                    Add
                  </button>
                </div>
                <span className="label-mono text-gray-500 text-xs block mt-2">
                  Optional • Press ENTER or comma to add
                </span>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEducation}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Education
        </button>
      </div>
    </div>
  );
}
