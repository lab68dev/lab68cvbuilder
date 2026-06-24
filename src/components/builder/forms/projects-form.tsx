"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";
import { improveBullet, improveDescription } from "@/actions/ai";
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
import { GithubSyncModal } from "./github-sync-modal";
import { Github } from "lucide-react";

export function ProjectsForm() {
  const { data, setData } = useResumeStore();
  const { projects } = data;
  const [techInputValues, setTechInputValues] = useState<
    Record<string, string>
  >({});
  const [improvingBullet, setImprovingBullet] = useState<string | null>(null);
  const [improvingDescription, setImprovingDescription] = useState<
    string | null
  >(null);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

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
    projId: string,
    idx: number,
    text: string,
    projectName: string,
  ) => {
    if (!text.trim() || improvingBullet) return;
    const key = `${projId}-${idx}`;
    setImprovingBullet(key);
    try {
      const { result } = await improveBullet(text, { position: projectName });
      updateHighlight(projId, idx, result);
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingBullet(null);
    }
  };

  const handleImproveDescription = async (
    projId: string,
    text: string,
    projectName: string,
  ) => {
    if (!text.trim() || improvingDescription) return;
    setImprovingDescription(projId);
    try {
      const { result } = await improveDescription(text, { title: projectName });
      updateProject(projId, {
        description: result.slice(0, MAX_DESCRIPTION_LENGTH),
      });
    } catch (err: unknown) {
      alert((err as Error).message || "AI improvement failed.");
    } finally {
      setImprovingDescription(null);
    }
  };

  const MAX_DESCRIPTION_LENGTH = 500;

  const addProject = () => {
    const newProject: ResumeData["projects"][0] = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      url: "",
      technologies: [],
      highlights: [],
    };

    setData({
      ...data,
      projects: [...projects, newProject],
    });
  };

  const removeProject = (id: string) => {
    setData({
      ...data,
      projects: projects.filter((proj) => proj.id !== id),
    });
    // Clean up input state
    setTechInputValues((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return;
    const next = [...projects];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, projects: next });
  };

  const updateProject = (
    id: string,
    updates: Partial<ResumeData["projects"][0]>,
  ) => {
    setData({
      ...data,
      projects: projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj,
      ),
    });
  };

  const addTechnology = (projectId: string, tech: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !tech.trim()) return;

    updateProject(projectId, {
      technologies: [...project.technologies, tech.trim()],
    });
  };

  const removeTechnology = (projectId: string, techIndex: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    updateProject(projectId, {
      technologies: project.technologies.filter((_, idx) => idx !== techIndex),
    });
  };

  const handleTechInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    projectId: string,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = techInputValues[projectId] || "";
      if (value.trim()) {
        addTechnology(projectId, value);
        setTechInputValues((prev) => ({ ...prev, [projectId]: "" }));
      }
    } else if (e.key === "Backspace" && !techInputValues[projectId]) {
      const project = projects.find((p) => p.id === projectId);
      if (project && project.technologies.length > 0) {
        removeTechnology(projectId, project.technologies.length - 1);
      }
    }
  };

  const updateHighlight = (projId: string, index: number, value: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    const newHighlights = [...proj.highlights];
    newHighlights[index] = value;
    updateProject(projId, { highlights: newHighlights });
  };

  const addHighlight = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    updateProject(projId, { highlights: [...proj.highlights, ""] });
  };

  const removeHighlight = (projId: string, index: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    updateProject(projId, {
      highlights: proj.highlights.filter((_, i) => i !== index),
    });
  };

  const handleDragEnd = (projId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;

    const oldIndex = proj.highlights.indexOf(active.id.toString());
    const newIndex = proj.highlights.indexOf(over.id.toString());

    if (oldIndex !== -1 && newIndex !== -1) {
      const newHighlights = arrayMove(proj.highlights, oldIndex, newIndex);
      updateProject(projId, { highlights: newHighlights });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="label-mono block">SECTION_05 // PROJECTS</span>
          <button
            onClick={() => setIsGithubModalOpen(true)}
            className="flex items-center gap-2 border border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
          >
            <Github className="w-4 h-4" />
            Auto-Sync GitHub
          </button>
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-2">Projects</h2>
        <p className="text-sm text-gray-600">
          Notable projects, open-source contributions, or side work
        </p>
      </div>

      <GithubSyncModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
      />

      <div className="space-y-8">
        {projects.map((project, index) => (
          <div key={project.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="label-mono">
                PROJECT_{String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveProject(index, "up")}
                  disabled={index === 0}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveProject(index, "down")}
                  disabled={index === projects.length - 1}
                  className="border border-gray-400 px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeProject(project.id)}
                  className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-mono block mb-2">PROJECT_NAME *</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) =>
                    updateProject(project.id, { name: e.target.value })
                  }
                  placeholder="E-Commerce Platform"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label-mono block mb-2">PROJECT_URL</label>
                  <input
                    type="url"
                    value={project.url || ""}
                    onChange={(e) =>
                      updateProject(project.id, { url: e.target.value })
                    }
                    placeholder="https://myproject.com"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">GITHUB_URL</label>
                  <input
                    type="url"
                    value={project.githubUrl || ""}
                    onChange={(e) =>
                      updateProject(project.id, { githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/you/repo"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">WEBSITE_URL</label>
                  <input
                    type="url"
                    value={project.websiteUrl || ""}
                    onChange={(e) =>
                      updateProject(project.id, { websiteUrl: e.target.value })
                    }
                    placeholder="https://myproject.vercel.app"
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
                        project.id,
                        project.description,
                        project.name,
                      )
                    }
                    disabled={
                      !project.description.trim() || !!improvingDescription
                    }
                    className="label-mono text-[10px] border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {improvingDescription === project.id ? "..." : "✦"}
                  </button>
                </div>
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                      updateProject(project.id, {
                        description: e.target.value,
                      });
                    }
                  }}
                  placeholder="A full-stack e-commerce platform built with modern technologies..."
                  rows={3}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150 resize-none"
                />
                <span className="label-mono text-gray-400 text-[10px] block mt-1 text-right">
                  {project.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <div>
                <label className="label-mono block mb-2">TECHNOLOGIES</label>
                <div className="border border-gray-400 bg-transparent focus-within:border-black transition-all duration-150">
                  <div className="flex flex-wrap gap-2 p-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 border border-black bg-black text-white px-2 py-1 text-sm"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(project.id, idx)}
                          className="ml-1 hover:text-red-400 transition-colors"
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={techInputValues[project.id] || ""}
                      onChange={(e) =>
                        setTechInputValues((prev) => ({
                          ...prev,
                          [project.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => handleTechInputKeyDown(e, project.id)}
                      placeholder="Type and press Enter or comma"
                      className="flex-1 min-w-50 bg-transparent px-1 py-1 outline-none"
                    />
                  </div>
                </div>
                <span className="label-mono text-gray-500 text-xs block mt-2">
                  Press ENTER or comma to add • Backspace to remove
                </span>
              </div>

              <div>
                <label className="label-mono block mb-2">KEY_FEATURES</label>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(project.id, event)}
                >
                  <SortableContext
                    items={project.highlights}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-3">
                      {project.highlights.map((highlight, idx) => {
                        const key = `${project.id}-${idx}`;
                        const isImproving = improvingBullet === key;
                        return (
                          <SortableItem key={highlight || idx} id={highlight}>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={highlight}
                                onChange={(e) =>
                                  updateHighlight(
                                    project.id,
                                    idx,
                                    e.target.value,
                                  )
                                }
                                placeholder="Built scalable microservices architecture..."
                                className="flex-1 border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                              />
                              <button
                                onClick={() =>
                                  handleImproveBullet(
                                    project.id,
                                    idx,
                                    highlight,
                                    project.name,
                                  )
                                }
                                disabled={isImproving || !highlight.trim()}
                                title="Improve with AI"
                                className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-30"
                              >
                                {isImproving ? "..." : "✦"}
                              </button>
                              <button
                                onClick={() => removeHighlight(project.id, idx)}
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
                  onClick={() => addHighlight(project.id)}
                  className="border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Project
        </button>
      </div>
    </div>
  );
}
