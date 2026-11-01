"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import { useDebounce } from "@/hooks/use-debounce";
import type { Resume } from "@/db/schema";
import { trackUsageEvent } from "@/actions/usage-event";
import { USAGE_EVENTS } from "@/lib/usage-events";
import { BuilderForm } from "./builder-form";
import { BuilderPreview } from "./builder-preview";
import { BuilderHeader } from "./builder-header";

interface BuilderClientProps {
  resume: Resume;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SAVE_RETRIES = 3;
const SAVE_TIMEOUT_MS = 15_000;

export function BuilderClient({ resume }: BuilderClientProps) {
  const {
    setResume,
    data,
    title,
    templateId,
    fontFamily,
    isDirty,
    setIsSaving,
    markSaved,
  } = useResumeStore();

  const [saveValidationError, setSaveValidationError] = useState<string | null>(
    null,
  );
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [saveRound, setSaveRound] = useState(0);
  const isSaveInFlightRef = useRef(false);
  const failedSavesRef = useRef(0);
  const hasTrackedOpenRef = useRef(false);
  const hasTrackedOnboardingRef = useRef(false);

  // Initialize store with resume data
  useEffect(() => {
    setResume(
      resume.id,
      resume.title,
      resume.templateId,
      resume.fontFamily ?? "inter",
      resume.data,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- must follow the store write above
    setIsStoreReady(true);
  }, [resume, setResume]);

  // ── Unsaved changes warning ────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-save function
  const saveResume = useCallback(async () => {
    if (!isStoreReady) return;
    if (!isDirty) return;
    if (isSaveInFlightRef.current) return; // It re-checks for new edits when it ends.

    // Block save if email is present but malformed — bad data integrity
    if (data.personalInfo.email && !EMAIL_REGEX.test(data.personalInfo.email)) {
      setSaveValidationError("Invalid email — fix before saving.");
      return;
    }
    setSaveValidationError(null);

    const snapshot = { title, templateId, fontFamily, data };
    isSaveInFlightRef.current = true;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resume/${resume.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snapshot),
        // A stalled request must not block every later save.
        signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error("Failed to update resume");
      }

      await response.json();

      // Mark local state clean after server confirms persistence.
      failedSavesRef.current = 0;
      markSaved(snapshot);
      void trackUsageEvent(USAGE_EVENTS.BUILDER_AUTOSAVE_SUCCEEDED, {
        resumeId: resume.id,
      });
      // Show a brief toast notification
      setShowSaveToast(true);
    } catch (error) {
      console.error("Failed to save resume:", error);
      failedSavesRef.current += 1;
      setIsSaving(false);
    } finally {
      isSaveInFlightRef.current = false;
      if (failedSavesRef.current <= MAX_SAVE_RETRIES) {
        setSaveRound((round) => round + 1);
      }
    }
  }, [
    isStoreReady,
    isDirty,
    resume.id,
    title,
    templateId,
    fontFamily,
    data,
    setIsSaving,
    markSaved,
  ]);

  useEffect(() => {
    if (!isStoreReady || hasTrackedOpenRef.current) return;
    hasTrackedOpenRef.current = true;
    void trackUsageEvent(USAGE_EVENTS.BUILDER_OPENED, { resumeId: resume.id });
  }, [isStoreReady, resume.id]);

  useEffect(() => {
    if (!isStoreReady || hasTrackedOnboardingRef.current) return;

    const hasContact = Boolean(
      data.personalInfo.fullName.trim() && data.personalInfo.email.trim(),
    );
    const hasExperience = data.experience.length > 0;
    const hasSkills = data.skills.length > 0;

    if (hasContact && hasExperience && hasSkills) {
      hasTrackedOnboardingRef.current = true;
      void trackUsageEvent(USAGE_EVENTS.BUILDER_ONBOARDING_COMPLETED, {
        resumeId: resume.id,
      });
    }
  }, [isStoreReady, data, resume.id]);

  // Auto-dismiss the toast
  useEffect(() => {
    if (!showSaveToast) return;
    const timer = window.setTimeout(() => setShowSaveToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [showSaveToast]);

  // Keyboard shortcut: Ctrl+S to save immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveResume();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveResume]);

  // Debounced save (2 seconds after last change)
  const debouncedSave = useDebounce(saveResume, 2000);

  // Trigger auto-save when data changes, and after a save that left work to do
  useEffect(() => {
    if (!isStoreReady) return;
    if (isDirty) {
      debouncedSave();
    }
  }, [
    isStoreReady,
    isDirty,
    debouncedSave,
    data,
    title,
    templateId,
    fontFamily,
    saveRound,
  ]);

  if (!isStoreReady) {
    return <div className="h-dvh bg-white" />;
  }

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <BuilderHeader
        resumeId={resume.id}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview((prev) => !prev)}
        saveValidationError={saveValidationError}
      />

      {/* Split View */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Top/Left Panel - Form */}
        <div
          className={`w-full lg:w-1/2 flex-1 lg:flex-none overflow-y-auto overscroll-y-contain border-b lg:border-b-0 lg:border-r border-black relative z-10 bg-white ${isMobilePreview ? "hidden lg:block" : ""}`}
        >
          <BuilderForm />
        </div>

        {/* Bottom/Right Panel - Preview */}
        <div
          className={`w-full lg:w-1/2 h-[45vh] lg:h-auto overflow-y-auto overscroll-y-contain bg-gray-50 shrink-0 ${isMobilePreview ? "block" : "hidden lg:block"}`}
        >
          <BuilderPreview />
        </div>
      </div>

      {/* Save toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none ${
          showSaveToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        <div className="bg-black text-white border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          All changes saved
        </div>
      </div>
    </div>
  );
}
