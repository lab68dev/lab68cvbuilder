"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";

export function SkillsForm() {
  const { data, setData } = useResumeStore();
  const { skills } = data;
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const addSkillCategory = () => {
    const newCategory: ResumeData["skills"][0] = {
      id: crypto.randomUUID(),
      category: "",
      items: [],
    };

    setData({
      ...data,
      skills: [...skills, newCategory],
    });
  };

  const removeSkillCategory = (id: string) => {
    setData({
      ...data,
      skills: skills.filter((cat) => cat.id !== id),
    });
    // Clean up input state
    setInputValues((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const moveSkillCategory = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= skills.length) return;
    const next = [...skills];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, skills: next });
  };

  const updateCategory = (
    id: string,
    updates: Partial<ResumeData["skills"][0]>,
  ) => {
    setData({
      ...data,
      skills: skills.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat,
      ),
    });
  };

  const addSkillItem = (categoryId: string, item: string) => {
    const category = skills.find((cat) => cat.id === categoryId);
    if (!category || !item.trim()) return;

    updateCategory(categoryId, {
      items: [...category.items, item.trim()],
    });
  };

  const removeSkillItem = (categoryId: string, itemIndex: number) => {
    const category = skills.find((cat) => cat.id === categoryId);
    if (!category) return;

    updateCategory(categoryId, {
      items: category.items.filter((_, idx) => idx !== itemIndex),
    });
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    categoryId: string,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValues[categoryId] || "";
      if (value.trim()) {
        addSkillItem(categoryId, value);
        setInputValues((prev) => ({ ...prev, [categoryId]: "" }));
      }
    } else if (e.key === "Backspace" && !inputValues[categoryId]) {
      // Remove last item if input is empty
      const category = skills.find((cat) => cat.id === categoryId);
      if (category && category.items.length > 0) {
        removeSkillItem(categoryId, category.items.length - 1);
      }
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">SECTION_04 // SKILLS</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Technical Skills
        </h2>
        <p className="text-sm text-gray-600">
          Categorized list of your technical and professional skills
        </p>
      </div>

      <div className="space-y-6">
        {skills.map((category, index) => (
          <div key={category.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="label-mono">
                CATEGORY_{String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveSkillCategory(index, "up")}
                  disabled={index === 0}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSkillCategory(index, "down")}
                  disabled={index === skills.length - 1}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeSkillCategory(category.id)}
                  className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-mono block mb-2">CATEGORY_NAME *</label>
                <input
                  type="text"
                  value={category.category}
                  onChange={(e) =>
                    updateCategory(category.id, { category: e.target.value })
                  }
                  placeholder="Programming Languages"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>

              <div>
                <label className="label-mono block mb-2">SKILLS *</label>
                <div className="border border-gray-400 bg-transparent focus-within:border-black transition-all duration-150">
                  <div className="flex flex-wrap gap-2 p-2">
                    {category.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 border border-black bg-black text-white px-2 py-1 text-sm"
                      >
                        {item}
                        <button
                          onClick={() => removeSkillItem(category.id, idx)}
                          className="ml-1 hover:text-red-400 transition-colors"
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={inputValues[category.id] || ""}
                      onChange={(e) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => handleInputKeyDown(e, category.id)}
                      placeholder="Type and press Enter or comma"
                      className="flex-1 min-w-50 bg-transparent px-1 py-1 outline-none"
                    />
                  </div>
                </div>
                <span className="label-mono text-gray-500 text-xs block mt-2">
                  Press ENTER or comma to add • Backspace to remove
                </span>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addSkillCategory}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Skill Category
        </button>
      </div>
    </div>
  );
}
