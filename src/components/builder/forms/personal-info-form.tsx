"use client";

import { useRef, useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import { useTranslations } from "next-intl";
import { generateSummary } from "@/actions/ai";
import { trackUsageEvent } from "@/actions/usage-event";
import {
  importFromBehance,
  importFromGitHub,
  type SocialImportResult,
} from "@/actions/import";
import { getForgProductOptions, importFromForg } from "@/actions/forg";
import type { ForgProductOption } from "@/actions/import";
import { parseLinkedInZip } from "@/lib/linkedin-zip-parser";
import type { ResumeData } from "@/db/schema";
import {
  ImportPreviewModal,
  type ImportSelection,
} from "@/components/builder/import-preview-modal";
import { USAGE_EVENTS } from "@/lib/usage-events";

// ── Validation Helpers ────────────────────────────────────────
const MAX_NAME_LENGTH = 100;
const MAX_SUMMARY_LENGTH = 500;
const MAX_PHONE_LENGTH = 20;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d\s\-().]*$/;

type PersonalFieldKey = keyof ImportSelection["personal"];

const createEmptySelection = (): ImportSelection => ({
  personal: {
    fullName: false,
    email: false,
    location: false,
    website: false,
    linkedin: false,
    github: false,
    summary: false,
  },
  skills: false,
  projects: false,
  experience: false,
  certifications: false,
  skillsMode: "merge",
  projectsMode: "merge",
  experienceMode: "merge",
  certificationsMode: "merge",
});

/** Strip HTML tags to prevent XSS in rendered output */
function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

export function PersonalInfoForm() {
  const t = useTranslations("BuilderImport");
  const { resumeId, data, updatePersonalInfo, setData } = useResumeStore();
  const { personalInfo } = data;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkedinZipRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsingLinkedinZip, setIsParsingLinkedinZip] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isImportingGithub, setIsImportingGithub] = useState(false);
  const [isImportingBehance, setIsImportingBehance] = useState(false);
  const [isImportingForg, setIsImportingForg] = useState(false);
  const [isApplyingPreview, setIsApplyingPreview] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [behanceInput, setBehanceInput] = useState("");
  const [forgInput, setForgInput] = useState("");
  const [forgOptions, setForgOptions] = useState<ForgProductOption[]>([]);
  const [selectedForgProductId, setSelectedForgProductId] = useState("");
  const [importStatus, setImportStatus] = useState<string>("");
  const [previewDraft, setPreviewDraft] = useState<SocialImportResult | null>(
    null,
  );
  const [previewSelection, setPreviewSelection] = useState<ImportSelection>(
    createEmptySelection(),
  );

  const trackImport = (
    eventName:
      | typeof USAGE_EVENTS.IMPORT_STARTED
      | typeof USAGE_EVENTS.IMPORT_PREVIEW_READY
      | typeof USAGE_EVENTS.IMPORT_APPLIED,
    source: string,
    extra: Record<string, unknown> = {},
  ) => {
    void trackUsageEvent(eventName, {
      source,
      resumeId: resumeId ?? "guest",
      ...extra,
    });
  };

  const mergeImportedSkills = (
    currentSkills: ResumeData["skills"],
    importedSkills: Array<{ category: string; items: string[] }>,
  ): ResumeData["skills"] => {
    const next = [...currentSkills];

    for (const imported of importedSkills) {
      if (!imported.items.length) continue;

      const matchIndex = next.findIndex(
        (skill) =>
          skill.category.trim().toLowerCase() ===
          imported.category.trim().toLowerCase(),
      );

      if (matchIndex >= 0) {
        const mergedItems = [...next[matchIndex].items];
        for (const item of imported.items) {
          if (
            !mergedItems.some(
              (existing) => existing.toLowerCase() === item.toLowerCase(),
            )
          ) {
            mergedItems.push(item);
          }
        }

        next[matchIndex] = {
          ...next[matchIndex],
          items: mergedItems,
        };
      } else {
        next.push({
          id: crypto.randomUUID(),
          category: imported.category,
          items: [...imported.items],
        });
      }
    }

    return next;
  };

  const mapImportedSkills = (
    importedSkills: Array<{ category: string; items: string[] }>,
  ): ResumeData["skills"] =>
    importedSkills
      .filter((skill) => skill.items.length > 0)
      .map((skill) => ({
        id: crypto.randomUUID(),
        category: skill.category,
        items: [...skill.items],
      }));

  const mergeImportedProjects = (
    currentProjects: ResumeData["projects"],
    importedProjects: Array<{
      name: string;
      description: string;
      url: string;
      githubUrl: string;
      websiteUrl: string;
      technologies: string[];
      highlights: string[];
    }>,
  ): ResumeData["projects"] => {
    const existingProjectKeys = new Set(
      currentProjects
        .map((project) =>
          (project.githubUrl || project.url || project.name)
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    );

    const newProjects = importedProjects
      .filter((project) => {
        const key = (project.githubUrl || project.url || project.name)
          .trim()
          .toLowerCase();
        return key ? !existingProjectKeys.has(key) : true;
      })
      .map((project) => ({
        id: crypto.randomUUID(),
        name: project.name,
        description: project.description,
        url: project.url,
        githubUrl: project.githubUrl,
        websiteUrl: project.websiteUrl,
        technologies: project.technologies,
        highlights: project.highlights,
      }));

    return [...currentProjects, ...newProjects];
  };

  const mapImportedProjects = (
    importedProjects: Array<{
      name: string;
      description: string;
      url: string;
      githubUrl: string;
      websiteUrl: string;
      technologies: string[];
      highlights: string[];
    }>,
  ): ResumeData["projects"] =>
    importedProjects.map((project) => ({
      id: crypto.randomUUID(),
      name: project.name,
      description: project.description,
      url: project.url,
      githubUrl: project.githubUrl,
      websiteUrl: project.websiteUrl,
      technologies: project.technologies,
      highlights: project.highlights,
    }));

  const mergeImportedExperience = (
    currentExperience: ResumeData["experience"],
    importedExperience: SocialImportResult["experience"],
  ): ResumeData["experience"] => {
    const existingKeys = new Set(
      currentExperience
        .map((exp) =>
          `${exp.company}|${exp.position}|${exp.startDate}`.toLowerCase(),
        )
        .filter(Boolean),
    );

    const next = [...currentExperience];
    for (const exp of importedExperience) {
      const key =
        `${exp.company}|${exp.position}|${exp.startDate}`.toLowerCase();
      if (existingKeys.has(key)) continue;
      next.push({
        id: crypto.randomUUID(),
        company: exp.company,
        position: exp.position,
        location: exp.location || "",
        startDate: exp.startDate,
        endDate: exp.endDate || "",
        current: exp.current,
        description: exp.description,
        highlights: exp.highlights,
      });
    }

    return next;
  };

  const mapImportedExperience = (
    importedExperience: SocialImportResult["experience"],
  ): ResumeData["experience"] =>
    importedExperience.map((exp) => ({
      id: crypto.randomUUID(),
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      current: exp.current,
      description: exp.description,
      highlights: exp.highlights,
    }));

  const mergeImportedCertifications = (
    currentCertifications: ResumeData["certifications"],
    importedCertifications: SocialImportResult["certifications"],
  ): ResumeData["certifications"] => {
    const existingKeys = new Set(
      currentCertifications
        .map((cert) => `${cert.name}|${cert.issuer}|${cert.date}`.toLowerCase())
        .filter(Boolean),
    );

    const next = [...currentCertifications];
    for (const cert of importedCertifications) {
      const key = `${cert.name}|${cert.issuer}|${cert.date}`.toLowerCase();
      if (existingKeys.has(key)) continue;
      next.push({
        id: crypto.randomUUID(),
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        url: cert.url || "",
      });
    }

    return next;
  };

  const mapImportedCertifications = (
    importedCertifications: SocialImportResult["certifications"],
  ): ResumeData["certifications"] =>
    importedCertifications.map((cert) => ({
      id: crypto.randomUUID(),
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.url || "",
    }));

  const updateField = (field: keyof typeof personalInfo, value: string) => {
    // Sanitize all text input
    const clean = sanitize(value);

    // Clear any error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    // Use functional update to avoid stale closure over `data`
    updatePersonalInfo({ [field]: clean });
  };

  // ── Field-level validation on blur ──────────────────────────
  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "fullName":
        if (!value.trim()) error = "Name is required";
        else if (value.length > MAX_NAME_LENGTH)
          error = `Max ${MAX_NAME_LENGTH} characters`;
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!EMAIL_REGEX.test(value))
          error = "Enter a valid email address";
        break;
      case "phone":
        if (value && !PHONE_REGEX.test(value))
          error = "Use digits, spaces, +, -, or parentheses only";
        break;
    }

    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB.");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      updateField("avatarUrl", url);
    } catch (err: unknown) {
      alert(
        (err as Error).message || "Failed to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAvatar = () => {
    updateField("avatarUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerateSummary = async () => {
    if (isGeneratingSummary) return;
    setIsGeneratingSummary(true);
    try {
      const skills = data.skills.flatMap((s) => s.items);
      const jobTitle = data.experience[0]?.position || "";
      const { result } = await generateSummary({
        fullName: personalInfo.fullName,
        jobTitle,
        skills,
      });
      updateField("summary", result.slice(0, MAX_SUMMARY_LENGTH));
    } catch (err: unknown) {
      alert((err as Error).message || "AI generation failed.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const buildInitialSelection = (
    draft: SocialImportResult,
  ): ImportSelection => {
    const next = createEmptySelection();

    const personalKeys = Object.keys(next.personal) as PersonalFieldKey[];
    for (const key of personalKeys) {
      const value = (draft.personalInfo[key] ?? "").toString().trim();
      next.personal[key] = Boolean(value);
    }

    next.skills = draft.skills.length > 0;
    next.projects = draft.projects.length > 0;
    next.experience = draft.experience.length > 0;
    next.certifications = draft.certifications.length > 0;
    return next;
  };

  const openPreview = (draft: SocialImportResult) => {
    setPreviewDraft(draft);
    setPreviewSelection(buildInitialSelection(draft));
  };

  const handleImportGithub = async () => {
    if (isImportingGithub) return;

    if (!githubInput.trim()) {
      setImportStatus(t("githubMissingInput"));
      return;
    }

    setIsImportingGithub(true);
    setImportStatus("");
    trackImport(USAGE_EVENTS.IMPORT_STARTED, "github");

    try {
      const result = await importFromGitHub(githubInput.trim());
      if (!result.success) throw new Error(result.error);
      const imported = result.data;
      openPreview(imported);
      trackImport(USAGE_EVENTS.IMPORT_PREVIEW_READY, "github", {
        username: imported.username,
      });
      setImportStatus(
        t("previewReady", { source: "GitHub", username: imported.username }),
      );
    } catch (err: unknown) {
      setImportStatus((err as Error).message || t("githubFailed"));
    } finally {
      setIsImportingGithub(false);
    }
  };

  const handleLinkedInZipImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setImportStatus(t("linkedinZipInvalidFile"));
      return;
    }

    setIsParsingLinkedinZip(true);
    setImportStatus("");
    trackImport(USAGE_EVENTS.IMPORT_STARTED, "linkedin_zip");

    try {
      const imported = await parseLinkedInZip(file);
      openPreview(imported);
      trackImport(USAGE_EVENTS.IMPORT_PREVIEW_READY, "linkedin_zip", {
        username: imported.username,
      });
      setImportStatus(
        t("previewReady", { source: "LinkedIn", username: imported.username }),
      );
    } catch (err: unknown) {
      setImportStatus((err as Error).message || t("linkedinZipFailed"));
    } finally {
      setIsParsingLinkedinZip(false);
      if (linkedinZipRef.current) linkedinZipRef.current.value = "";
    }
  };

  const handleImportBehance = async () => {
    if (isImportingBehance) return;

    const input = behanceInput.trim();
    if (!input) {
      setImportStatus(t("behanceMissingInput"));
      return;
    }

    setIsImportingBehance(true);
    setImportStatus("");
    trackImport(USAGE_EVENTS.IMPORT_STARTED, "behance");

    try {
      const result = await importFromBehance(input);
      if (!result.success) throw new Error(result.error);
      const imported = result.data;
      openPreview(imported);
      trackImport(USAGE_EVENTS.IMPORT_PREVIEW_READY, "behance", {
        username: imported.username,
      });
      setImportStatus(
        t("previewReady", { source: "Behance", username: imported.username }),
      );
    } catch (err: unknown) {
      setImportStatus((err as Error).message || t("behanceFailed"));
    } finally {
      setIsImportingBehance(false);
    }
  };

  const handleImportForg = async () => {
    if (isImportingForg) return;

    const input = forgInput.trim();
    if (!input) {
      setImportStatus(t("forgMissingInput"));
      return;
    }

    setIsImportingForg(true);
    setImportStatus("");
    trackImport(USAGE_EVENTS.IMPORT_STARTED, "forg");
    setForgOptions([]);
    setSelectedForgProductId("");

    try {
      const resOptions = await getForgProductOptions(input);
      if (!resOptions.success) throw new Error(resOptions.error);
      const optionsResult = resOptions.data;

      if (
        optionsResult.target === "profile" &&
        optionsResult.options.length > 1
      ) {
        setForgOptions(optionsResult.options);
        setSelectedForgProductId(optionsResult.options[0].id);
        setImportStatus(
          t("forgMultiFound", { username: optionsResult.username }),
        );
        return;
      }

      const pickedId = optionsResult.options[0]?.id;
      const resImport = await importFromForg(input, pickedId);
      if (!resImport.success) throw new Error(resImport.error);
      const imported = resImport.data;
      openPreview(imported);
      trackImport(USAGE_EVENTS.IMPORT_PREVIEW_READY, "forg", {
        username: imported.username,
      });
      setImportStatus(
        t("previewReady", { source: "Forg", username: imported.username }),
      );
    } catch (err: unknown) {
      setImportStatus((err as Error).message || t("forgFailed"));
    } finally {
      setIsImportingForg(false);
    }
  };

  const handleImportSelectedForgProduct = async () => {
    if (isImportingForg || !forgInput.trim() || !selectedForgProductId) return;

    setIsImportingForg(true);
    setImportStatus("");
    trackImport(USAGE_EVENTS.IMPORT_STARTED, "forg", {
      selectedProductId: selectedForgProductId,
    });
    try {
      const result = await importFromForg(
        forgInput.trim(),
        selectedForgProductId,
      );
      if (!result.success) throw new Error(result.error);
      const imported = result.data;
      openPreview(imported);
      trackImport(USAGE_EVENTS.IMPORT_PREVIEW_READY, "forg", {
        username: imported.username,
        selectedProductId: selectedForgProductId,
      });
      setImportStatus(
        t("previewReady", { source: "Forg", username: imported.username }),
      );
      setForgOptions([]);
      setSelectedForgProductId("");
    } catch (err: unknown) {
      setImportStatus((err as Error).message || t("forgFailed"));
    } finally {
      setIsImportingForg(false);
    }
  };

  const handleApplyPreview = () => {
    if (!previewDraft) return;

    setIsApplyingPreview(true);

    const nextPersonalInfo: ResumeData["personalInfo"] = {
      ...data.personalInfo,
    };

    const selectedKeys = Object.keys(
      previewSelection.personal,
    ) as PersonalFieldKey[];
    for (const key of selectedKeys) {
      if (!previewSelection.personal[key]) continue;
      const incoming = (previewDraft.personalInfo[key] ?? "").toString().trim();
      if (!incoming) continue;
      nextPersonalInfo[key] = incoming;
    }

    const nextSkills = previewSelection.skills
      ? previewSelection.skillsMode === "replace"
        ? mapImportedSkills(previewDraft.skills)
        : mergeImportedSkills(data.skills, previewDraft.skills)
      : data.skills;

    const nextProjects = previewSelection.projects
      ? previewSelection.projectsMode === "replace"
        ? mapImportedProjects(previewDraft.projects)
        : mergeImportedProjects(data.projects, previewDraft.projects)
      : data.projects;

    const nextExperience = previewSelection.experience
      ? previewSelection.experienceMode === "replace"
        ? mapImportedExperience(previewDraft.experience)
        : mergeImportedExperience(data.experience, previewDraft.experience)
      : data.experience;

    const nextCertifications = previewSelection.certifications
      ? previewSelection.certificationsMode === "replace"
        ? mapImportedCertifications(previewDraft.certifications)
        : mergeImportedCertifications(
            data.certifications,
            previewDraft.certifications,
          )
      : data.certifications;

    setData({
      ...data,
      personalInfo: nextPersonalInfo,
      skills: nextSkills,
      projects: nextProjects,
      experience: nextExperience,
      certifications: nextCertifications,
    });

    setImportStatus(
      t("mergedSelected", {
        source: previewDraft.source.toUpperCase(),
        username: previewDraft.username,
      }),
    );
    trackImport(USAGE_EVENTS.IMPORT_APPLIED, previewDraft.source, {
      username: previewDraft.username,
    });
    setPreviewDraft(null);
    setIsApplyingPreview(false);
  };

  /** Helper: input class with error state */
  const inputClass = (field: string) =>
    `w-full border bg-transparent px-4 py-3 transition-all duration-150 ${
      errors[field]
        ? "border-red-500 focus:bg-red-50 focus:text-red-900"
        : "border-black focus:border-black"
    }`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <span className="label-mono block mb-4">SECTION_01 // PERSONAL</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600">
          Basic contact details and professional links
        </p>
      </div>

      <div className="border-t border-black pt-6 space-y-6">
        {/* ── Import Profile ─────────────────────────────── */}
        <div className="border border-dashed border-gray-300 p-4 space-y-4">
          <div>
            <span className="label-mono block mb-1">
              {t("importSectionTitle")}
            </span>
            <p className="text-xs text-gray-500">{t("importSectionHint")}</p>
          </div>

          {/* LinkedIn ZIP */}
          <div className="flex items-center gap-3">
            <span className="label-mono w-20 shrink-0 text-[11px]">
              LINKEDIN
            </span>
            <button
              onClick={() => linkedinZipRef.current?.click()}
              disabled={isParsingLinkedinZip}
              className="border border-gray-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
            >
              {isParsingLinkedinZip
                ? t("linkedinZipParsing")
                : t("linkedinZipButton")}
            </button>
            <span className="text-[10px] text-gray-400 hidden sm:block">
              {t("linkedinZipHint")}
            </span>
          </div>
          <input
            ref={linkedinZipRef}
            type="file"
            aria-label="Upload LinkedIn data export ZIP"
            accept=".zip"
            onChange={handleLinkedInZipImport}
            className="hidden"
          />

          {/* GitHub */}
          <div className="flex items-center gap-3">
            <span className="label-mono w-20 shrink-0 text-[11px]">GITHUB</span>
            <input
              type="text"
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              placeholder={t("githubPlaceholder")}
              className="flex-1 min-w-0 border border-black bg-transparent px-3 py-1.5 text-sm focus:border-black transition-all duration-150"
            />
            <button
              onClick={handleImportGithub}
              disabled={isImportingGithub}
              className="shrink-0 border border-gray-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
            >
              {isImportingGithub ? t("importing") : t("previewImport")}
            </button>
          </div>

          {/* Behance */}
          <div className="flex items-center gap-3">
            <span className="label-mono w-20 shrink-0 text-[11px]">
              BEHANCE
            </span>
            <input
              type="text"
              value={behanceInput}
              onChange={(e) => setBehanceInput(e.target.value)}
              placeholder={t("behancePlaceholder")}
              className="flex-1 min-w-0 border border-black bg-transparent px-3 py-1.5 text-sm focus:border-black transition-all duration-150"
            />
            <button
              onClick={handleImportBehance}
              disabled={isImportingBehance}
              className="shrink-0 border border-gray-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
            >
              {isImportingBehance ? t("importing") : t("previewImport")}
            </button>
          </div>

          {/* Forg */}
          <div className="flex items-center gap-3">
            <span className="label-mono w-20 shrink-0 text-[11px]">FORG</span>
            <input
              type="text"
              value={forgInput}
              onChange={(e) => {
                setForgInput(e.target.value);
                if (forgOptions.length > 0) {
                  setForgOptions([]);
                  setSelectedForgProductId("");
                }
              }}
              placeholder={t("forgPlaceholder")}
              className="flex-1 min-w-0 border border-black bg-transparent px-3 py-1.5 text-sm focus:border-black transition-all duration-150"
            />
            <button
              onClick={handleImportForg}
              disabled={isImportingForg}
              className="shrink-0 border border-gray-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
            >
              {isImportingForg ? t("importing") : t("previewImport")}
            </button>
          </div>

          <p className="text-[11px] text-amber-700">{t("forgDevNotice")}</p>

          {forgOptions.length > 1 && (
            <div className="flex flex-col gap-2 border border-gray-300 p-3 bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {t("forgPickerTitle")}
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedForgProductId}
                  onChange={(e) => setSelectedForgProductId(e.target.value)}
                  className="flex-1 min-w-0 border border-black bg-white px-3 py-1.5 text-sm"
                  aria-label="Select Forg product"
                >
                  {forgOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title} ({option.id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleImportSelectedForgProduct}
                  disabled={isImportingForg || !selectedForgProductId}
                  className="shrink-0 border border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
                >
                  {isImportingForg ? t("importing") : t("forgUseSelected")}
                </button>
              </div>
              <p className="text-[11px] text-gray-500">{t("forgPickerHint")}</p>
            </div>
          )}

          {importStatus && (
            <p className="text-xs text-gray-700 mt-1">{importStatus}</p>
          )}
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="label-mono block mb-3">AVATAR_PHOTO</label>
          <p className="text-xs text-gray-500 mb-3">
            Optional — used in the Creative / Portfolio template
          </p>
          <div className="flex items-center gap-4">
            {personalInfo.avatarUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={personalInfo.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-black"
                />
                <button
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : isUploading ? (
              <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold animate-pulse bg-gray-100">
                UPLOADING
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs">
                No Photo
              </div>
            )}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                  isUploading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-black hover:text-white"
                }`}
              >
                {isUploading
                  ? "Uploading..."
                  : personalInfo.avatarUrl
                    ? "Change Photo"
                    : "Upload Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                aria-label="Upload avatar image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="text-[10px] text-gray-400 mt-1">
                JPG, PNG, WebP • Max 10MB
              </div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="label-mono block mb-2">FULL_NAME *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            onBlur={(e) => validateField("fullName", e.target.value)}
            placeholder="John Doe"
            maxLength={MAX_NAME_LENGTH}
            className={inputClass("fullName")}
          />
          <div className="flex justify-between mt-1">
            {errors.fullName ? (
              <span className="text-xs text-red-500 font-medium">
                {errors.fullName}
              </span>
            ) : (
              <span />
            )}
            <span className="label-mono text-gray-400 text-[10px]">
              {personalInfo.fullName.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="label-mono block mb-2">EMAIL *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
            placeholder="john@example.com"
            className={inputClass("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-500 font-medium mt-1 block">
              {errors.email}
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label-mono block mb-2">PHONE</label>
          <input
            type="tel"
            value={personalInfo.phone || ""}
            onChange={(e) => {
              // Only allow valid phone characters
              if (PHONE_REGEX.test(e.target.value) || e.target.value === "") {
                updateField("phone", e.target.value);
              }
            }}
            onBlur={(e) => validateField("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            maxLength={MAX_PHONE_LENGTH}
            className={inputClass("phone")}
          />
          {errors.phone ? (
            <span className="text-xs text-red-500 font-medium mt-1 block">
              {errors.phone}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 mt-1 block">
              Digits, spaces, +, -, or parentheses
            </span>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="label-mono block mb-2">LOCATION</label>
          <input
            type="text"
            value={personalInfo.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="San Francisco, CA"
            maxLength={100}
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150"
          />
        </div>

        {/* Website */}
        <div>
          <label className="label-mono block mb-2">WEBSITE</label>
          <input
            type="url"
            value={personalInfo.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150"
          />
        </div>

        {/* LinkedIn */}
        {/* LinkedIn URL — shown in CV header */}
        <div>
          <label className="label-mono block mb-1">
            {t("linkedinUrlLabel")}
          </label>
          <p className="text-[10px] text-gray-400 mb-2">
            {t("linkedinUrlHint")}
          </p>
          <input
            type="text"
            value={personalInfo.linkedin || ""}
            onChange={(e) => updateField("linkedin", e.target.value)}
            placeholder={t("linkedinPlaceholder")}
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150"
          />
        </div>

        {/* GitHub */}
        {/* GitHub URL — shown in CV header */}
        <div>
          <label className="label-mono block mb-1">GITHUB URL</label>
          <p className="text-[10px] text-gray-400 mb-2">{t("githubHint")}</p>
          <input
            type="text"
            value={personalInfo.github || ""}
            onChange={(e) => updateField("github", e.target.value)}
            placeholder={t("githubPlaceholder")}
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150"
          />
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-mono">PROFESSIONAL_SUMMARY</label>
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="border border-gray-400 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150 disabled:opacity-40"
            >
              {isGeneratingSummary ? "GENERATING..." : "✦ GENERATE WITH AI"}
            </button>
          </div>
          <textarea
            value={personalInfo.summary || ""}
            onChange={(e) => {
              if (e.target.value.length <= MAX_SUMMARY_LENGTH) {
                updateField("summary", e.target.value);
              }
            }}
            placeholder="A brief professional summary or objective statement..."
            rows={6}
            maxLength={MAX_SUMMARY_LENGTH}
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150 resize-none"
          />
          <span className="label-mono text-gray-500 text-xs block mt-2">
            {personalInfo.summary?.length || 0} / {MAX_SUMMARY_LENGTH}{" "}
            characters
          </span>
        </div>

        <div>
          <label className="label-mono block mb-2">BULLET_SYMBOL</label>
          <input
            type="text"
            value={personalInfo.bulletSymbol || "•"}
            onChange={(e) =>
              updateField("bulletSymbol", e.target.value.slice(0, 3))
            }
            placeholder="•"
            maxLength={3}
            className="w-full border border-black bg-transparent px-4 py-3 focus:border-black transition-all duration-150"
          />
          <span className="text-[10px] text-gray-500 mt-1 block">
            Use any symbol for CV bullets, for example: •, -, ▪, or →
          </span>
        </div>
      </div>

      {previewDraft && (
        <ImportPreviewModal
          draft={previewDraft}
          selection={previewSelection}
          onChangeSelection={setPreviewSelection}
          onClose={() => setPreviewDraft(null)}
          onApply={handleApplyPreview}
          isApplying={isApplyingPreview}
        />
      )}
    </div>
  );
}
