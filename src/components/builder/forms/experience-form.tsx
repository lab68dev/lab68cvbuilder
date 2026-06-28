"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";
import { improveBullet, improveDescription } from "@/actions/ai";
import { MonthInput } from "./month-input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";

function isEndBeforeStart(start: string, end: string): boolean {
  if (!start || !end) return false;
  return end < start; // "YYYY-MM" strings compare lexicographically correctly
}

export function ExperienceForm() {
  const { data, setData } = useResumeStore();
  const { experience } = data;
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [improvingBullet, setImprovingBullet] = useState<string | null>(null);
  const [improvingDescription, setImprovingDescription] = useState<
    string | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleImproveBullet = async (
    expId: string,
    idx: number,
    text: string,
    position: string,
    company: string,
  ) => {
    if (!text.trim() || improvingBullet) return;
    const key = `${expId}-${idx}`;
    setImprovingBullet(key);
    try {
      const { result } = await improveBullet(text, { position, company });
      updateHighlight(expId, idx, result);
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingBullet(null);
    }
  };

  const handleImproveDescription = async (
    expId: string,
    text: string,
    position: string,
    company: string,
  ) => {
    if (!text.trim() || improvingDescription) return;
    setImprovingDescription(expId);
    try {
      const { result } = await improveDescription(text, {
        title: position,
        company,
      });
      updateExperience(expId, {
        description: result.slice(0, MAX_DESCRIPTION_LENGTH),
      });
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingDescription(null);
    }
  };

  const MAX_DESCRIPTION_LENGTH = 500;

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

  const moveExperience = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= experience.length) return;
    const next = [...experience];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, experience: next });
  };

  const updateExperience = (
    id: string,
    updates: Partial<ResumeData["experience"][0]>,
  ) => {
    setData({
      ...data,
      experience: experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp,
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

  const handleDragEnd = (expId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const exp = experience.find((e) => e.id === expId);
    if (!exp) return;

    const oldIndex = exp.highlights.indexOf(active.id.toString());
    const newIndex = exp.highlights.indexOf(over.id.toString());

    if (oldIndex !== -1 && newIndex !== -1) {
      const newHighlights = arrayMove(exp.highlights, oldIndex, newIndex);
      updateExperience(expId, { highlights: newHighlights });
    }
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveExperience(index, "up")}
                  disabled={index === 0}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveExperience(index, "down")}
                  disabled={index === experience.length - 1}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
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
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
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
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
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
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">START_DATE *</label>
                  <MonthInput
                    key={`exp-start-${exp.id}-${exp.startDate || "empty"}`}
                    value={exp.startDate}
                    onChange={(newStart) => {
                      if (isEndBeforeStart(newStart, exp.endDate || "")) {
                        setDateErrors((prev) => ({
                          ...prev,
                          [exp.id]: "End date cannot be before start date.",
                        }));
                      } else {
                        setDateErrors((prev) => {
                          const next = { ...prev };
                          delete next[exp.id];
                          return next;
                        });
                      }
                      updateExperience(exp.id, { startDate: newStart });
                    }}
                    required
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">END_DATE</label>
                  <MonthInput
                    key={`exp-end-${exp.id}-${exp.endDate || "empty"}-${exp.current ? "current" : "open"}`}
                    value={exp.endDate || ""}
                    onChange={(newEnd) => {
                      if (isEndBeforeStart(exp.startDate, newEnd)) {
                        setDateErrors((prev) => ({
                          ...prev,
                          [exp.id]: "End date cannot be before start date.",
                        }));
                        return; // block storing an invalid end date
                      }
                      setDateErrors((prev) => {
                        const next = { ...prev };
                        delete next[exp.id];
                        return next;
                      });
                      updateExperience(exp.id, { endDate: newEnd });
                    }}
                    disabled={exp.current}
                    className={`w-full border bg-transparent px-3 py-2 focus:border-black  transition-all duration-150 disabled:opacity-50 ${
                      dateErrors[exp.id] ? "border-red-500" : "border-gray-400"
                    }`}
                  />
                </div>
              </div>
              {dateErrors[exp.id] && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {dateErrors[exp.id]}
                </p>
              )}

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
                <div className="flex items-center justify-between mb-2">
                  <label className="label-mono">DESCRIPTION</label>
                  <button
                    type="button"
                    onClick={() =>
                      handleImproveDescription(
                        exp.id,
                        exp.description,
                        exp.position,
                        exp.company,
                      )
                    }
                    disabled={!exp.description.trim() || !!improvingDescription}
                    className="label-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {improvingDescription === exp.id ? "..." : "✦"}
                  </button>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                      updateExperience(exp.id, { description: e.target.value });
                    }
                  }}
                  placeholder="Brief description of your role and responsibilities..."
                  rows={3}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150 resize-none"
                />
                <span className="label-mono text-gray-400 text-[10px] block mt-1 text-right">
                  {exp.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              {/* Highlights */}
              <div>
                <label className="label-mono block mb-2">
                  KEY_ACHIEVEMENTS
                </label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(exp.id, event)}
                >
                  <SortableContext
                    items={exp.highlights}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-3">
                      {exp.highlights.map((highlight, idx) => {
                        const key = `${exp.id}-${idx}`;
                        const isImproving = improvingBullet === key;
                        return (
                          <SortableItem key={highlight || idx} id={highlight}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={highlight}
                                onChange={(e) =>
                                  updateHighlight(exp.id, idx, e.target.value)
                                }
                                placeholder="Increased revenue by 40%..."
                                className="flex-1 border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                              />
                              <button
                                onClick={() =>
                                  handleImproveBullet(
                                    exp.id,
                                    idx,
                                    highlight,
                                    exp.position,
                                    exp.company,
                                  )
                                }
                                disabled={isImproving || !highlight.trim()}
                                title="Improve with AI"
                                className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-30"
                              >
                                {isImproving ? "..." : "✦"}
                              </button>
                              <button
                                onClick={() => removeHighlight(exp.id, idx)}
                                className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-red-600 hover:text-red-600 transition-colors duration-150"
                              >
                                ×
                              </button>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
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
