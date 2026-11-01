"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createResumeVersion,
  getResumeVersions,
  restoreResumeVersion,
  updateResumeVersionLabel,
} from "@/actions/resume-version";
import { useResumeStore } from "@/store/resume-store";
import type { ResumeData, ResumeVersion } from "@/db/schema";

type VersionFilter = "all" | "autosave" | "manual" | "ai";

type DiffRow = {
  label: string;
  current: string;
  snapshot: string;
  changed: boolean;
};

type TextDiffPart = {
  type: "equal" | "added" | "removed";
  text: string;
};

type LongFieldDiff = {
  label: string;
  snapshotText: string;
  currentText: string;
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function sourceLabel(source: string) {
  switch (source) {
    case "autosave":
      return "Auto";
    case "manual":
      return "Manual";
    case "ai-tailor":
      return "AI tailor";
    default:
      return source.toUpperCase();
  }
}

function toDisplay(value: string | number | undefined) {
  if (value === undefined) return "-";
  if (typeof value === "number") return String(value);
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "-";
}

function totalSkillItems(data: ResumeData) {
  return data.skills.reduce((sum, group) => sum + group.items.length, 0);
}

function buildDiffRows(
  currentData: ResumeData,
  snapshotData: ResumeData,
): DiffRow[] {
  const rows: DiffRow[] = [
    {
      label: "Full Name",
      current: toDisplay(currentData.personalInfo.fullName),
      snapshot: toDisplay(snapshotData.personalInfo.fullName),
      changed:
        currentData.personalInfo.fullName !==
        snapshotData.personalInfo.fullName,
    },
    {
      label: "Email",
      current: toDisplay(currentData.personalInfo.email),
      snapshot: toDisplay(snapshotData.personalInfo.email),
      changed:
        currentData.personalInfo.email !== snapshotData.personalInfo.email,
    },
    {
      label: "Summary",
      current: toDisplay(currentData.personalInfo.summary ?? ""),
      snapshot: toDisplay(snapshotData.personalInfo.summary ?? ""),
      changed:
        (currentData.personalInfo.summary ?? "") !==
        (snapshotData.personalInfo.summary ?? ""),
    },
    {
      label: "Experience Entries",
      current: toDisplay(currentData.experience.length),
      snapshot: toDisplay(snapshotData.experience.length),
      changed: currentData.experience.length !== snapshotData.experience.length,
    },
    {
      label: "Education Entries",
      current: toDisplay(currentData.education.length),
      snapshot: toDisplay(snapshotData.education.length),
      changed: currentData.education.length !== snapshotData.education.length,
    },
    {
      label: "Skill Items",
      current: toDisplay(totalSkillItems(currentData)),
      snapshot: toDisplay(totalSkillItems(snapshotData)),
      changed: totalSkillItems(currentData) !== totalSkillItems(snapshotData),
    },
    {
      label: "Projects",
      current: toDisplay(currentData.projects.length),
      snapshot: toDisplay(snapshotData.projects.length),
      changed: currentData.projects.length !== snapshotData.projects.length,
    },
    {
      label: "Certifications",
      current: toDisplay(currentData.certifications.length),
      snapshot: toDisplay(snapshotData.certifications.length),
      changed:
        currentData.certifications.length !==
        snapshotData.certifications.length,
    },
    {
      label: "Languages",
      current: toDisplay(currentData.languages.length),
      snapshot: toDisplay(snapshotData.languages.length),
      changed: currentData.languages.length !== snapshotData.languages.length,
    },
  ];

  return rows;
}

function matchesFilter(source: string, filter: VersionFilter) {
  if (filter === "all") return true;
  if (filter === "ai") return source.startsWith("ai");
  return source === filter;
}

function tokenizeWords(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) ?? [];
}

function buildWordDiff(fromText: string, toText: string): TextDiffPart[] {
  const a = tokenizeWords(fromText);
  const b = tokenizeWords(toText);

  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const parts: TextDiffPart[] = [];
  let i = 0;
  let j = 0;

  const pushPart = (type: TextDiffPart["type"], text: string) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last && last.type === type) {
      last.text += text;
      return;
    }
    parts.push({ type, text });
  };

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pushPart("equal", a[i]);
      i++;
      j++;
      continue;
    }

    if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushPart("removed", a[i]);
      i++;
    } else {
      pushPart("added", b[j]);
      j++;
    }
  }

  while (i < a.length) {
    pushPart("removed", a[i]);
    i++;
  }
  while (j < b.length) {
    pushPart("added", b[j]);
    j++;
  }

  return parts;
}

function buildLongFieldDiffs(
  currentData: ResumeData,
  snapshotData: ResumeData,
): LongFieldDiff[] {
  const rows: LongFieldDiff[] = [];

  const currentSummary = (currentData.personalInfo.summary ?? "").trim();
  const snapshotSummary = (snapshotData.personalInfo.summary ?? "").trim();
  if (currentSummary || snapshotSummary) {
    rows.push({
      label: "Summary",
      currentText: currentSummary,
      snapshotText: snapshotSummary,
    });
  }

  const maxExperience = Math.max(
    currentData.experience.length,
    snapshotData.experience.length,
  );
  for (let idx = 0; idx < Math.min(maxExperience, 2); idx++) {
    const currentExp = currentData.experience[idx];
    const snapshotExp = snapshotData.experience[idx];
    const currentText = (currentExp?.description ?? "").trim();
    const snapshotText = (snapshotExp?.description ?? "").trim();
    if (!currentText && !snapshotText) continue;
    rows.push({
      label: `Experience Description ${idx + 1}`,
      currentText,
      snapshotText,
    });
  }

  const maxProjects = Math.max(
    currentData.projects.length,
    snapshotData.projects.length,
  );
  for (let idx = 0; idx < Math.min(maxProjects, 2); idx++) {
    const currentProject = currentData.projects[idx];
    const snapshotProject = snapshotData.projects[idx];
    const currentText = (currentProject?.description ?? "").trim();
    const snapshotText = (snapshotProject?.description ?? "").trim();
    if (!currentText && !snapshotText) continue;
    rows.push({
      label: `Project Description ${idx + 1}`,
      currentText,
      snapshotText,
    });
  }

  return rows;
}

function InlineTextDiff({
  snapshotText,
  currentText,
}: {
  snapshotText: string;
  currentText: string;
}) {
  const parts = buildWordDiff(snapshotText, currentText);

  if (parts.length === 0) {
    return <span className="text-gray-500">No text changes.</span>;
  }

  return (
    <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.type === "equal") {
          return <span key={index}>{part.text}</span>;
        }

        if (part.type === "added") {
          return (
            <span key={index} className="bg-green-100 text-green-900">
              {part.text}
            </span>
          );
        }

        return (
          <span key={index} className="bg-red-100 text-red-700 line-through">
            {part.text}
          </span>
        );
      })}
    </p>
  );
}

export function VersionHistoryPanel() {
  const {
    resumeId,
    title,
    templateId,
    fontFamily,
    data,
    isDirty,
    setResume,
    markSaved,
  } = useResumeStore();

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [labelingId, setLabelingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<VersionFilter>("all");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredVersions = versions.filter((version) =>
    matchesFilter(version.source, activeFilter),
  );

  const previewVersion =
    versions.find((version) => version.id === previewVersionId) ?? null;
  const diffRows = previewVersion
    ? buildDiffRows(data, previewVersion.data)
    : [];
  const longFieldDiffs = previewVersion
    ? buildLongFieldDiffs(data, previewVersion.data)
    : [];

  const loadVersions = useCallback(async () => {
    if (!resumeId) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const list = await getResumeVersions(resumeId);
      setVersions(list);
    } catch (error) {
      setMessage((error as Error).message || "Failed to load version history");
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state for this fetch
    loadVersions();
  }, [loadVersions]);

  const handleCreateSnapshot = async () => {
    if (!resumeId || isSavingSnapshot) return;
    setIsSavingSnapshot(true);
    setMessage(null);

    try {
      await createResumeVersion({
        resumeId,
        title,
        templateId,
        fontFamily,
        data,
        source: "manual",
        changeSummary: "Manual snapshot from version panel",
      });
      setMessage("Snapshot created.");
      await loadVersions();
    } catch (error) {
      setMessage((error as Error).message || "Failed to create snapshot");
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  const handleRestore = async (version: ResumeVersion) => {
    if (!resumeId || restoringId) return;

    if (isDirty) {
      const shouldContinue = window.confirm(
        "You have unsaved changes. Restore this version anyway?",
      );
      if (!shouldContinue) return;
    }

    setRestoringId(version.id);
    setMessage(null);

    try {
      const restored = await restoreResumeVersion(resumeId, version.id);
      setResume(
        restored.id,
        restored.title,
        restored.templateId,
        restored.fontFamily,
        restored.data,
      );
      markSaved();
      setMessage("Version restored to editor.");
      await loadVersions();
    } catch (error) {
      setMessage((error as Error).message || "Failed to restore version");
    } finally {
      setRestoringId(null);
    }
  };

  const handleLabel = async (version: ResumeVersion) => {
    if (labelingId) return;

    const nextLabel = window.prompt(
      "Label this snapshot (empty clears label):",
      version.changeSummary ?? "",
    );

    if (nextLabel === null) return;

    setLabelingId(version.id);
    setMessage(null);
    try {
      await updateResumeVersionLabel(version.id, nextLabel);
      setMessage("Snapshot label updated.");
      await loadVersions();
    } catch (error) {
      setMessage((error as Error).message || "Failed to update snapshot label");
    } finally {
      setLabelingId(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <span className="label-mono block mb-4">Version history</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Version History
        </h2>
        <p className="text-sm text-gray-600">
          Review snapshots and restore previous resume states.
        </p>
      </div>

      <div className="sketch-card p-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleCreateSnapshot}
          disabled={!resumeId || isSavingSnapshot}
          className="border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-50"
        >
          {isSavingSnapshot ? "Saving Snapshot..." : "Save Snapshot"}
        </button>

        <button
          type="button"
          onClick={loadVersions}
          disabled={!resumeId || isLoading}
          className="border border-black px-4 py-2 text-xs font-bold hover:bg-note transition-colors duration-150 disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>

        {isDirty && (
          <span className="label-mono text-orange-600">
            Unsaved edits present
          </span>
        )}
      </div>

      <div className="sketch-card p-4 flex flex-wrap items-center gap-2">
        <span className="label-mono text-gray-500">Filter source:</span>
        {(
          [
            ["all", "All"],
            ["autosave", "Auto"],
            ["manual", "Manual"],
            ["ai", "AI"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            className={`border px-3 py-1 text-[11px] font-bold transition-colors duration-150 ${
              activeFilter === value
                ? "border-black bg-black text-white"
                : "border-gray-400 text-gray-700 hover:border-black hover:bg-note"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {message && <p className="text-xs font-bold text-gray-600">{message}</p>}

      {isLoading ? (
        <div className="sketch-card p-6 text-sm text-gray-600">
          Loading versions...
        </div>
      ) : filteredVersions.length === 0 ? (
        <div className="sketch-card p-6 text-sm text-gray-600">
          No snapshots match this filter.
        </div>
      ) : (
        <div className="border border-black divide-y divide-gray-200">
          {filteredVersions.map((version) => (
            <div
              key={version.id}
              className="p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="label-mono text-gray-500">
                    {sourceLabel(version.source)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-bold ">{version.title}</p>
                <p className="text-xs text-gray-500">
                  Template: {version.templateId} | Font: {version.fontFamily}
                </p>
                {version.changeSummary ? (
                  <p className="text-xs text-gray-600">
                    {version.changeSummary}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewVersionId(version.id)}
                  className={`border px-3 py-2 text-xs font-bold transition-colors duration-150 ${
                    previewVersionId === version.id
                      ? "border-black bg-black text-white"
                      : "border-gray-400 hover:border-black hover:bg-note"
                  }`}
                >
                  Diff
                </button>

                <button
                  type="button"
                  onClick={() => handleLabel(version)}
                  disabled={labelingId !== null}
                  className="border border-gray-400 px-3 py-2 text-xs font-bold hover:border-black hover:bg-note transition-colors duration-150 disabled:opacity-50"
                >
                  {labelingId === version.id ? "Saving..." : "Label"}
                </button>

                <button
                  type="button"
                  onClick={() => handleRestore(version)}
                  disabled={restoringId !== null}
                  className="border border-black px-3 py-2 text-xs font-bold hover:bg-note transition-colors duration-150 disabled:opacity-50"
                >
                  {restoringId === version.id ? "Restoring..." : "Restore"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewVersion && (
        <div className="space-y-4">
          <div className="border border-black">
            <div className="px-4 py-3 border-b border-black flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold ">Side-by-Side Diff Preview</p>
                <p className="text-xs text-gray-500">
                  Snapshot: {formatDate(previewVersion.createdAt)} |{" "}
                  {sourceLabel(previewVersion.source)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVersionId(null)}
                className="border border-black px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-b border-black bg-gray-50">
              <p className="px-4 py-2 text-[11px] font-bold border-b md:border-b-0 md:border-r border-gray-200">
                Field
              </p>
              <p className="px-4 py-2 text-[11px] font-bold border-b md:border-b-0 md:border-r border-gray-200">
                Current Draft
              </p>
              <p className="px-4 py-2 text-[11px] font-bold ">
                Selected Snapshot
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {diffRows.map((row) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-1 md:grid-cols-3 ${row.changed ? "bg-yellow-50" : "bg-white"}`}
                >
                  <p className="px-4 py-3 text-xs font-bold md:border-r border-gray-200">
                    {row.label}
                  </p>
                  <p className="px-4 py-3 text-sm md:border-r border-gray-200 wrap-break-word">
                    {row.current}
                  </p>
                  <p className="px-4 py-3 text-sm wrap-break-word">
                    {row.snapshot}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black">
            <div className="px-4 py-3 border-b border-black bg-gray-50">
              <p className="text-xs font-bold ">Visual Text Diff Mode</p>
              <p className="text-xs text-gray-500">
                Inline additions are green, removals are red + struck through.
              </p>
            </div>

            {longFieldDiffs.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No long-text fields found to compare.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {longFieldDiffs.map((item) => (
                  <div key={item.label} className="p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-600">
                      {item.label}
                    </p>
                    <div className="border border-gray-200 p-3 bg-white">
                      <InlineTextDiff
                        snapshotText={item.snapshotText}
                        currentText={item.currentText}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
