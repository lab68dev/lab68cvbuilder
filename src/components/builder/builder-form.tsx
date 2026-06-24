"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useResumeStore } from "@/store/resume-store";
import { PersonalInfoForm } from "./forms/personal-info-form";
import { ExperienceForm } from "./forms/experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { ProjectsForm } from "./forms/projects-form";
import { CertificationsForm } from "./forms/certifications-form";
import { CompetitionsForm } from "./forms/competitions-form";
import { LanguagesForm } from "./forms/languages-form";
import { ResumeScorePanel, scoreResume } from "./resume-score";
import { AISuggestionsPanel } from "./ai-suggestions";
import { VersionHistoryPanel } from "./version-history-panel";

const SECTIONS = [
  { id: "personal", label: "Personal Info", component: PersonalInfoForm },
  { id: "experience", label: "Experience", component: ExperienceForm },
  { id: "education", label: "Education", component: EducationForm },
  { id: "skills", label: "Skills", component: SkillsForm },
  { id: "projects", label: "Projects", component: ProjectsForm },
  {
    id: "certifications",
    label: "Certifications",
    component: CertificationsForm,
  },
  { id: "competitions", label: "Competitions", component: CompetitionsForm },
  { id: "languages", label: "Languages", component: LanguagesForm },
  { id: "versions", label: "Versions", component: VersionHistoryPanel },
  { id: "score", label: "Score", component: ResumeScorePanel },
  { id: "suggestions", label: "Tips", component: AISuggestionsPanel },
] as const;

export function BuilderForm() {
  const searchParams = useSearchParams();
  const data = useResumeStore((state) => state.data);
  const activeSection = useResumeStore((state) => state.activeSection);
  const setActiveSection = useResumeStore((state) => state.setActiveSection);
  const hiddenSections = useResumeStore((state) => state.hiddenSections);
  const toggleSectionVisibility = useResumeStore(
    (state) => state.toggleSectionVisibility,
  );
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    SECTIONS.map((s) => s.id),
  );
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const sectionManagerRef = useRef<HTMLDivElement | null>(null);

  // Close section manager when clicking outside
  useEffect(() => {
    if (!showSectionManager) return;
    const handleClick = (e: MouseEvent) => {
      if (
        sectionManagerRef.current &&
        !sectionManagerRef.current.contains(e.target as Node)
      ) {
        setShowSectionManager(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSectionManager]);

  // Sections that the user has *not* hidden
  const visibleSectionIds = sectionOrder.filter(
    (id) => !hiddenSections.includes(id),
  );
  const visibleSections = visibleSectionIds
    .map((id) => SECTIONS.find((s) => s.id === id))
    .filter((section): section is (typeof SECTIONS)[number] =>
      Boolean(section),
    );

  // If the active section gets hidden, jump to the first visible section
  useEffect(() => {
    if (hiddenSections.includes(activeSection) && visibleSections.length > 0) {
      setActiveSection(visibleSections[0].id);
    }
  }, [hiddenSections, activeSection, visibleSections, setActiveSection]);

  const activeIndex = visibleSections.findIndex((s) => s.id === activeSection);

  useEffect(() => {
    if (searchParams.get("entry") === "import") {
      setActiveSection("personal");
    }

    const applyHashSection = () => {
      const raw = window.location.hash.replace("#", "").trim();
      if (!raw) return;
      const exists = visibleSections.some((section) => section.id === raw);
      if (exists) {
        setActiveSection(raw);
      }
    };

    applyHashSection();
    window.addEventListener("hashchange", applyHashSection);
    return () => window.removeEventListener("hashchange", applyHashSection);
  }, [searchParams, visibleSections, setActiveSection]);

  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeTab = tabsContainerRef.current.querySelector(
      `[data-section-id="${activeSection}"]`,
    ) as HTMLElement | null;

    if (!activeTab) return;

    // Keep the selected section tab comfortably visible on narrow screens.
    activeTab.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSection]);

  // ── Move section with visual feedback ────────────────────
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [moveFeedback, setMoveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyMovedId) return;
    const timer = window.setTimeout(() => setRecentlyMovedId(null), 800);
    return () => window.clearTimeout(timer);
  }, [recentlyMovedId]);

  useEffect(() => {
    if (!moveFeedback) return;
    const timer = window.setTimeout(() => setMoveFeedback(null), 2000);
    return () => window.clearTimeout(timer);
  }, [moveFeedback]);

  const moveActiveSection = (direction: "left" | "right") => {
    if (activeIndex < 0) return;
    const target = direction === "left" ? activeIndex - 1 : activeIndex + 1;
    if (target < 0 || target >= visibleSections.length) return;

    const movedSection = visibleSections[activeIndex];

    setSectionOrder((prev) => {
      const next = [...prev];
      const prevIdx = next.indexOf(visibleSections[activeIndex].id);
      const targetIdx = next.indexOf(visibleSections[target].id);
      [next[prevIdx], next[targetIdx]] = [next[targetIdx], next[prevIdx]];
      return next;
    });

    // Trigger visual feedback
    setRecentlyMovedId(movedSection.id);
    const newPosition = target + 1;
    const arrow = direction === "left" ? "←" : "→";
    setMoveFeedback(
      `${arrow} Moved "${movedSection.label}" to position ${newPosition}`,
    );
  };

  const ActiveComponent =
    visibleSections.find((s) => s.id === activeSection)?.component ||
    PersonalInfoForm;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex >= 0 && activeIndex < visibleSections.length - 1;

  const goToAdjacentSection = (direction: "prev" | "next") => {
    if (activeIndex < 0) return;
    const target = direction === "prev" ? activeIndex - 1 : activeIndex + 1;
    if (target < 0 || target >= visibleSections.length) return;
    setActiveSection(visibleSections[target].id);
  };

  const hiddenCount = hiddenSections.length;
  const activeSectionLabel = visibleSections[activeIndex]?.label ?? "Section";

  const getSectionBadge = (id: string) => {
    switch (id) {
      case "personal":
        const hasContact = Boolean(
          data.personalInfo.fullName.trim() && data.personalInfo.email.trim(),
        );
        return hasContact ? (
          <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
            OK
          </span>
        ) : (
          <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            Required
          </span>
        );
      case "experience":
        return data.experience.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {data.experience.length}
          </span>
        ) : null;
      case "education":
        return data.education.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {data.education.length}
          </span>
        ) : null;
      case "skills":
        const skillCount = data.skills.reduce(
          (acc, cat) => acc + cat.items.length,
          0,
        );
        return skillCount > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {skillCount}
          </span>
        ) : null;
      case "projects":
        return data.projects.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {data.projects.length}
          </span>
        ) : null;
      case "certifications":
        return data.certifications.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {data.certifications.length}
          </span>
        ) : null;
      case "competitions":
        return (data.competitions ?? []).length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {(data.competitions ?? []).length}
          </span>
        ) : null;
      case "languages":
        return data.languages.length > 0 ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-800 border border-gray-300">
            {data.languages.length}
          </span>
        ) : null;
      case "score":
        const { total } = scoreResume(data);
        const scoreColor =
          total >= 85
            ? "bg-green-100 text-green-800 border-green-200"
            : total >= 50
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-red-100 text-red-800 border-red-200";
        return (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 border ${scoreColor}`}
          >
            {total}%
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* LEFT SIDEBAR - Desktop (md and up) */}
      <div className="hidden md:flex w-60 border-r border-gray-300 bg-gray-50 flex-col h-full overflow-y-auto shrink-0 z-20">
        <div className="p-4 border-b border-gray-300 sticky top-0 bg-gray-50 z-10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="label-mono text-gray-500">NAVIGATION</p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                Section {Math.max(activeIndex + 1, 1)} of{" "}
                {visibleSections.length}
              </p>
            </div>
            {/* Sections toggle */}
            <div className="relative shrink-0" ref={sectionManagerRef}>
              <button
                type="button"
                onClick={() => setShowSectionManager(!showSectionManager)}
                className={`border px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                  showSectionManager
                    ? "bg-black text-white border-black"
                    : "border-gray-400 text-gray-600 hover:bg-black hover:text-white"
                }`}
                title="Show or hide sections"
              >
                ⚙ Adjust
              </button>

              {showSectionManager && (
                <div className="absolute left-0 top-full mt-2 z-55 border border-black bg-white shadow-lg w-56">
                  <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                    <p className="label-mono text-gray-500 text-[10px]">
                      TOGGLE SECTIONS
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Click to show/hide
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {SECTIONS.map((section) => {
                      const isHidden = hiddenSections.includes(section.id);
                      const isPersonal = section.id === "personal";
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() =>
                            !isPersonal && toggleSectionVisibility(section.id)
                          }
                          disabled={isPersonal}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-100 ${
                            isPersonal
                              ? "text-gray-400 cursor-not-allowed bg-gray-50"
                              : isHidden
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-black hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 border text-center text-[10px] leading-4 font-bold ${
                              isHidden
                                ? "border-gray-300"
                                : "border-black bg-black text-white"
                            }`}
                          >
                            {isHidden ? "" : "✓"}
                          </span>
                          <span className={isHidden ? "line-through" : ""}>
                            {section.label}
                          </span>
                          {isPersonal && (
                            <span className="ml-auto text-[9px] text-gray-400 uppercase">
                              Required
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-2 space-y-1">
          {visibleSections.map((section, index) => {
            const isJustMoved = recentlyMovedId === section.id;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-all duration-150 border ${
                  isJustMoved
                    ? "bg-yellow-400 text-black border-yellow-500 ring-2 ring-yellow-300"
                    : isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="opacity-70 text-[10px] font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{section.label}</span>
                </div>
                {getSectionBadge(section.id)}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with reorder buttons */}
        <div className="p-3 border-t border-gray-300 bg-gray-50 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-1 w-full">
            <button
              type="button"
              onClick={() => moveActiveSection("left")}
              disabled={activeIndex <= 0}
              className="flex-1 border border-gray-400 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 flex items-center justify-center gap-1"
              title={`Move "${activeSectionLabel}" up`}
            >
              <span>↑ Move Up</span>
            </button>
            <button
              type="button"
              onClick={() => moveActiveSection("right")}
              disabled={
                activeIndex < 0 || activeIndex >= visibleSections.length - 1
              }
              className="flex-1 border border-gray-400 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 flex items-center justify-center gap-1"
              title={`Move "${activeSectionLabel}" down`}
            >
              <span>↓ Move Down</span>
            </button>
          </div>
          <div className="text-[9px] text-center text-gray-400 font-bold uppercase truncate px-1">
            Reordering: {activeSectionLabel}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT TABS - Sticky at the top */}
      <div className="md:hidden border-b border-gray-300 bg-white sticky top-0 z-10 w-full shrink-0">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-mono text-gray-500">SECTION NAVIGATION</p>
              <p className="text-xs text-gray-600 mt-1">
                Section {Math.max(activeIndex + 1, 1)} of{" "}
                {visibleSections.length}
                {hiddenCount > 0 && (
                  <span className="text-gray-400"> · {hiddenCount} hidden</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToAdjacentSection("prev")}
                disabled={!hasPrev}
                className="border border-gray-400 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                title="Previous section"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => goToAdjacentSection("next")}
                disabled={!hasNext}
                className="border border-gray-400 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30"
                title="Next section"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-0 py-2">
          <div
            className="flex-1 overflow-x-auto scrollbar-none"
            ref={tabsContainerRef}
          >
            <div className="flex min-w-max gap-2 snap-x snap-mandatory px-4">
              {visibleSections.map((section, index) => {
                const isJustMoved = recentlyMovedId === section.id;
                return (
                  <button
                    key={section.id}
                    data-section-id={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`snap-start px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border flex items-center gap-1.5 ${
                      isJustMoved
                        ? "bg-yellow-400 text-black border-yellow-500 ring-2 ring-yellow-300 scale-105"
                        : activeSection === section.id
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                    aria-current={
                      activeSection === section.id ? "page" : undefined
                    }
                  >
                    <span className="mr-1 opacity-70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{section.label}</span>
                    {getSectionBadge(section.id)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manage Sections toggle - Mobile */}
          <div className="relative shrink-0 px-4" ref={sectionManagerRef}>
            <button
              type="button"
              onClick={() => setShowSectionManager(!showSectionManager)}
              className={`border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                showSectionManager
                  ? "bg-black text-white border-black"
                  : "border-gray-400 text-gray-600 hover:bg-black hover:text-white"
              }`}
              title="Show or hide sections"
            >
              ⚙ Sections
            </button>

            {showSectionManager && (
              <div className="absolute right-4 top-full mt-2 z-50 border border-black bg-white shadow-lg w-56">
                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <p className="label-mono text-gray-500 text-[10px]">
                    TOGGLE SECTIONS
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Click to show/hide
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {SECTIONS.map((section) => {
                    const isHidden = hiddenSections.includes(section.id);
                    const isPersonal = section.id === "personal";
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() =>
                          !isPersonal && toggleSectionVisibility(section.id)
                        }
                        disabled={isPersonal}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-100 ${
                          isPersonal
                            ? "text-gray-400 cursor-not-allowed bg-gray-50"
                            : isHidden
                              ? "text-gray-400 hover:bg-gray-100"
                              : "text-black hover:bg-gray-100"
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 border text-center text-[10px] leading-4 font-bold ${
                            isHidden
                              ? "border-gray-300"
                              : "border-black bg-black text-white"
                          }`}
                        >
                          {isHidden ? "" : "✓"}
                        </span>
                        <span className={isHidden ? "line-through" : ""}>
                          {section.label}
                        </span>
                        {isPersonal && (
                          <span className="ml-auto text-[9px] text-gray-400 uppercase">
                            Required
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col h-full bg-white relative">
        {/* Move feedback toast — appears inside the main area top */}
        {moveFeedback && (
          <div className="absolute top-0 left-0 right-0 z-30 transition-all duration-300 bg-yellow-50 border-b border-yellow-200 shrink-0">
            <div className="flex items-center gap-2 px-6 py-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span className="text-xs font-semibold text-yellow-800">
                {moveFeedback}
              </span>
            </div>
          </div>
        )}
        <div className="max-w-3xl w-full mx-auto md:mx-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
