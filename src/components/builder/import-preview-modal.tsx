"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import type {
  ImportConfidence,
  ImportPersonalFieldKey,
  SocialImportResult,
} from "@/actions/import";

export type ImportSelection = {
  personal: Record<ImportPersonalFieldKey, boolean>;
  skills: boolean;
  projects: boolean;
  experience: boolean;
  certifications: boolean;
  skillsMode: "merge" | "replace";
  projectsMode: "merge" | "replace";
  experienceMode: "merge" | "replace";
  certificationsMode: "merge" | "replace";
};

interface ImportPreviewModalProps {
  draft: SocialImportResult;
  selection: ImportSelection;
  onChangeSelection: (next: ImportSelection) => void;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
}

const PERSONAL_FIELD_LABEL_KEYS: Record<ImportPersonalFieldKey, string> = {
  fullName: "fields.fullName",
  email: "fields.email",
  location: "fields.location",
  website: "fields.website",
  linkedin: "fields.linkedin",
  github: "fields.github",
  summary: "fields.summary",
};

export function ImportPreviewModal({
  draft,
  selection,
  onChangeSelection,
  onClose,
  onApply,
  isApplying,
}: ImportPreviewModalProps) {
  const t = useTranslations("BuilderImport");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const personalEntries = useMemo(
    () =>
      Object.entries(draft.personalInfo)
        .filter(
          ([key, value]) =>
            key !== "" && Boolean((value ?? "").toString().trim()),
        )
        .map(([key, value]) => ({
          key: key as ImportPersonalFieldKey,
          value: (value ?? "").toString(),
        })),
    [draft.personalInfo],
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const togglePersonal = (field: ImportPersonalFieldKey) => {
    onChangeSelection({
      ...selection,
      personal: {
        ...selection.personal,
        [field]: !selection.personal[field],
      },
    });
  };

  const canApply =
    Object.values(selection.personal).some(Boolean) ||
    selection.skills ||
    selection.projects ||
    selection.experience ||
    selection.certifications;

  const confidenceLabel = (confidence: ImportConfidence) =>
    confidence === "confirmed"
      ? t("confidenceConfirmed")
      : t("confidenceInferred");

  const confidenceClass = (confidence: ImportConfidence) =>
    confidence === "confirmed"
      ? "border-green-700 text-green-700 bg-green-50"
      : "border-amber-700 text-amber-700 bg-amber-50";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <div className="w-[min(760px,94vw)] max-h-[90vh] bg-white border border-black flex flex-col">
        <div className="flex items-center justify-between border-b border-black px-4 py-3">
          <div>
            <span className="label-mono block text-xs">
              {t("previewLabel")}
            </span>
            <h3 className="text-lg font-black tracking-tight">
              {`${draft.source.toUpperCase()} @${draft.username}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border border-black px-3 py-2 text-xs font-bold hover:bg-note transition-colors duration-150"
          >
            {t("close")}
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-5">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="label-mono">{t("personalFields")}</h4>
            </div>
            <div className="space-y-2">
              {personalEntries.length === 0 ? (
                <p className="text-sm text-gray-500">{t("noPersonalFields")}</p>
              ) : (
                personalEntries.map((entry) => (
                  <label
                    key={entry.key}
                    className="flex items-start gap-3 border border-gray-300 px-3 py-2 hover:border-black"
                  >
                    <input
                      type="checkbox"
                      checked={selection.personal[entry.key]}
                      onChange={() => togglePersonal(entry.key)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-bold text-gray-600">
                          {t(PERSONAL_FIELD_LABEL_KEYS[entry.key])}
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 border ${confidenceClass(
                            draft.confidence.personal[entry.key] ?? "inferred",
                          )}`}
                        >
                          {confidenceLabel(
                            draft.confidence.personal[entry.key] ?? "inferred",
                          )}
                        </span>
                      </div>
                      <div className="text-sm wrap-break-word mt-1">
                        {entry.value}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="label-mono">{t("sections")}</h4>
            <div className="border border-gray-300 px-3 py-2">
              <label className="flex items-start gap-3 hover:border-black">
                <input
                  type="checkbox"
                  checked={selection.skills}
                  onChange={() =>
                    onChangeSelection({
                      ...selection,
                      skills: !selection.skills,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-gray-600">
                      {t("skills")}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 border ${confidenceClass(
                        draft.confidence.skills,
                      )}`}
                    >
                      {confidenceLabel(draft.confidence.skills)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {draft.skills.length > 0
                      ? t("skillsFound", { count: draft.skills.length })
                      : t("noSkills")}
                  </div>
                </div>
              </label>
              {selection.skills && (
                <div className="mt-3 ml-7 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="skills-mode"
                      checked={selection.skillsMode === "merge"}
                      onChange={() =>
                        onChangeSelection({ ...selection, skillsMode: "merge" })
                      }
                    />
                    <span>{t("mergeMode")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="skills-mode"
                      checked={selection.skillsMode === "replace"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          skillsMode: "replace",
                        })
                      }
                    />
                    <span>{t("replaceMode")}</span>
                  </label>
                </div>
              )}
            </div>

            <div className="border border-gray-300 px-3 py-2">
              <label className="flex items-start gap-3 hover:border-black">
                <input
                  type="checkbox"
                  checked={selection.projects}
                  onChange={() =>
                    onChangeSelection({
                      ...selection,
                      projects: !selection.projects,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-gray-600">
                      {t("projects")}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 border ${confidenceClass(
                        draft.confidence.projects,
                      )}`}
                    >
                      {confidenceLabel(draft.confidence.projects)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {draft.projects.length > 0
                      ? t("projectsFound", { count: draft.projects.length })
                      : t("noProjects")}
                  </div>
                </div>
              </label>
              {selection.projects && (
                <div className="mt-3 ml-7 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="projects-mode"
                      checked={selection.projectsMode === "merge"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          projectsMode: "merge",
                        })
                      }
                    />
                    <span>{t("mergeMode")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="projects-mode"
                      checked={selection.projectsMode === "replace"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          projectsMode: "replace",
                        })
                      }
                    />
                    <span>{t("replaceMode")}</span>
                  </label>
                </div>
              )}
            </div>

            <div className="border border-gray-300 px-3 py-2">
              <label className="flex items-start gap-3 hover:border-black">
                <input
                  type="checkbox"
                  checked={selection.experience}
                  onChange={() =>
                    onChangeSelection({
                      ...selection,
                      experience: !selection.experience,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-gray-600">
                      {t("experience")}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 border ${confidenceClass(
                        draft.confidence.experience,
                      )}`}
                    >
                      {confidenceLabel(draft.confidence.experience)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {draft.experience.length > 0
                      ? t("experienceFound", { count: draft.experience.length })
                      : t("noExperience")}
                  </div>
                </div>
              </label>
              {selection.experience && (
                <div className="mt-3 ml-7 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="experience-mode"
                      checked={selection.experienceMode === "merge"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          experienceMode: "merge",
                        })
                      }
                    />
                    <span>{t("mergeMode")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="experience-mode"
                      checked={selection.experienceMode === "replace"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          experienceMode: "replace",
                        })
                      }
                    />
                    <span>{t("replaceMode")}</span>
                  </label>
                </div>
              )}
            </div>

            <div className="border border-gray-300 px-3 py-2">
              <label className="flex items-start gap-3 hover:border-black">
                <input
                  type="checkbox"
                  checked={selection.certifications}
                  onChange={() =>
                    onChangeSelection({
                      ...selection,
                      certifications: !selection.certifications,
                    })
                  }
                  className="mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-gray-600">
                      {t("certifications")}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 border ${confidenceClass(
                        draft.confidence.certifications,
                      )}`}
                    >
                      {confidenceLabel(draft.confidence.certifications)}
                    </span>
                  </div>
                  <div className="text-sm">
                    {draft.certifications.length > 0
                      ? t("certificationsFound", {
                          count: draft.certifications.length,
                        })
                      : t("noCertifications")}
                  </div>
                </div>
              </label>
              {selection.certifications && (
                <div className="mt-3 ml-7 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="certifications-mode"
                      checked={selection.certificationsMode === "merge"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          certificationsMode: "merge",
                        })
                      }
                    />
                    <span>{t("mergeMode")}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="radio"
                      name="certifications-mode"
                      checked={selection.certificationsMode === "replace"}
                      onChange={() =>
                        onChangeSelection({
                          ...selection,
                          certificationsMode: "replace",
                        })
                      }
                    />
                    <span>{t("replaceMode")}</span>
                  </label>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-black p-4 flex items-center justify-between">
          <span className="text-xs text-gray-600">{t("selectHint")}</span>
          <button
            onClick={onApply}
            disabled={!canApply || isApplying}
            className="border border-black px-4 py-2 text-xs font-bold bg-black text-white hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-40"
          >
            {isApplying ? t("applying") : t("applySelected")}
          </button>
        </div>
      </div>
    </div>
  );
}
