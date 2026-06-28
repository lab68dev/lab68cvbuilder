"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";
import { improveBullet, improveDescription } from "@/actions/ai";
import { MonthInput } from "./month-input";

export function CompetitionsForm() {
  const { data, setData } = useResumeStore();
  const { competitions = [] } = data; // Default fallback for older resumes
  const [improvingBullet, setImprovingBullet] = useState<string | null>(null);
  const [improvingDescription, setImprovingDescription] = useState<
    string | null
  >(null);

  const handleImproveBullet = async (
    compId: string,
    idx: number,
    text: string,
    compName: string,
    role: string,
  ) => {
    if (!text.trim() || improvingBullet) return;
    const key = `${compId}-${idx}`;
    setImprovingBullet(key);
    try {
      const positionContext = role ? `${role} at ${compName}` : compName;
      const { result } = await improveBullet(text, {
        position: positionContext,
      });
      updateHighlight(compId, idx, result);
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingBullet(null);
    }
  };

  const handleImproveDescription = async (
    compId: string,
    text: string,
    compName: string,
    role: string,
  ) => {
    if (!text.trim() || improvingDescription) return;
    setImprovingDescription(compId);
    try {
      const titleContext = role ? `${role} at ${compName}` : compName;
      const { result } = await improveDescription(text, {
        title: titleContext,
      });
      updateCompetition(compId, {
        description: result.slice(0, MAX_DESCRIPTION_LENGTH),
      });
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingDescription(null);
    }
  };

  const MAX_DESCRIPTION_LENGTH = 500;

  const addCompetition = () => {
    const newCompetition: ResumeData["competitions"][0] = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      date: "",
      location: "",
      url: "",
      description: "",
      highlights: [],
    };

    setData({
      ...data,
      competitions: [...competitions, newCompetition],
    });
  };

  const removeCompetition = (id: string) => {
    setData({
      ...data,
      competitions: competitions.filter((comp) => comp.id !== id),
    });
  };

  const moveCompetition = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= competitions.length) return;
    const next = [...competitions];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, competitions: next });
  };

  const updateCompetition = (
    id: string,
    updates: Partial<ResumeData["competitions"][0]>,
  ) => {
    setData({
      ...data,
      competitions: competitions.map((comp) =>
        comp.id === id ? { ...comp, ...updates } : comp,
      ),
    });
  };

  const updateHighlight = (compId: string, index: number, value: string) => {
    const comp = competitions.find((c) => c.id === compId);
    if (!comp) return;

    const newHighlights = [...comp.highlights];
    newHighlights[index] = value;
    updateCompetition(compId, { highlights: newHighlights });
  };

  const addHighlight = (compId: string) => {
    const comp = competitions.find((c) => c.id === compId);
    if (!comp) return;

    updateCompetition(compId, { highlights: [...comp.highlights, ""] });
  };

  const removeHighlight = (compId: string, index: number) => {
    const comp = competitions.find((c) => c.id === compId);
    if (!comp) return;

    updateCompetition(compId, {
      highlights: comp.highlights.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">
          SECTION_OPT // COMPETITIONS
        </span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Competitions
        </h2>
        <p className="text-sm text-gray-600">
          Hackathons, case studies, academic or professional competitions
        </p>
      </div>

      <div className="space-y-8">
        {competitions.map((comp, index) => (
          <div key={comp.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="label-mono">
                COMP_{String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveCompetition(index, "up")}
                  disabled={index === 0}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCompetition(index, "down")}
                  disabled={index === competitions.length - 1}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeCompetition(comp.id)}
                  className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">
                    COMPETITION_NAME *
                  </label>
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) =>
                      updateCompetition(comp.id, { name: e.target.value })
                    }
                    placeholder="Global AI Hackathon 2026"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">ROLE / AWARD</label>
                  <input
                    type="text"
                    value={comp.role || ""}
                    onChange={(e) =>
                      updateCompetition(comp.id, { role: e.target.value })
                    }
                    placeholder="1st Place, Team Lead"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-mono block mb-2">DATE *</label>
                  <MonthInput
                    key={`comp-date-${comp.id}-${comp.date || "empty"}`}
                    value={comp.date}
                    onChange={(newDate) => {
                      updateCompetition(comp.id, { date: newDate });
                    }}
                    required
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">LOCATION</label>
                  <input
                    type="text"
                    value={comp.location || ""}
                    onChange={(e) =>
                      updateCompetition(comp.id, { location: e.target.value })
                    }
                    placeholder="San Francisco, CA"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">URL</label>
                  <input
                    type="url"
                    value={comp.url || ""}
                    onChange={(e) =>
                      updateCompetition(comp.id, { url: e.target.value })
                    }
                    placeholder="https://devpost.com/..."
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-mono">DESCRIPTION *</label>
                  <button
                    type="button"
                    onClick={() =>
                      handleImproveDescription(
                        comp.id,
                        comp.description,
                        comp.name,
                        comp.role || "",
                      )
                    }
                    disabled={
                      !comp.description.trim() || !!improvingDescription
                    }
                    className="label-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {improvingDescription === comp.id ? "..." : "✦"}
                  </button>
                </div>
                <textarea
                  value={comp.description}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                      updateCompetition(comp.id, {
                        description: e.target.value,
                      });
                    }
                  }}
                  placeholder="Built an AI-powered agent to automate tasks within 48 hours..."
                  rows={3}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150 resize-none"
                />
                <span className="label-mono text-gray-400 text-[10px] block mt-1 text-right">
                  {comp.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <div>
                <label className="label-mono block mb-2">KEY_HIGHLIGHTS</label>
                <div className="space-y-2 mb-3">
                  {comp.highlights.map((highlight, idx) => {
                    const key = `${comp.id}-${idx}`;
                    const isImproving = improvingBullet === key;
                    return (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) =>
                            updateHighlight(comp.id, idx, e.target.value)
                          }
                          placeholder="Awarded best technical implementation by judges..."
                          className="flex-1 border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                        />
                        <button
                          onClick={() =>
                            handleImproveBullet(
                              comp.id,
                              idx,
                              highlight,
                              comp.name,
                              comp.role || "",
                            )
                          }
                          disabled={isImproving || !highlight.trim()}
                          title="Improve with AI"
                          className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-30"
                        >
                          {isImproving ? "..." : "✦"}
                        </button>
                        <button
                          onClick={() => removeHighlight(comp.id, idx)}
                          className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-red-600 hover:text-red-600 transition-colors duration-150"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => addHighlight(comp.id)}
                  className="border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
                >
                  + Add Highlight
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addCompetition}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Competition
        </button>
      </div>
    </div>
  );
}
