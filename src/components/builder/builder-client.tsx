"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resume-store";
import { updateResume } from "@/actions/resume";
import { useDebounce } from "@/hooks/use-debounce";
import type { Resume } from "@/db/schema";
import { BuilderForm } from "./builder-form";
import { BuilderPreview } from "./builder-preview";
import { BuilderHeader } from "./builder-header";

interface BuilderClientProps {
  resume: Resume;
}

export function BuilderClient({ resume }: BuilderClientProps) {
  const { setResume, data, title, templateId, fontFamily, isDirty, setIsSaving, markSaved } =
    useResumeStore();

  const [isMobilePreview, setIsMobilePreview] = useState(false);

  // Initialize store with resume data
  useEffect(() => {
    setResume(resume.id, resume.title, resume.templateId, resume.fontFamily ?? "inter", resume.data);
  }, [resume, setResume]);

  // Auto-save function
  const saveResume = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await updateResume(resume.id, {
        title,
        templateId,
        fontFamily,
        data,
      });
      markSaved();
    } catch (error) {
      console.error("Failed to save resume:", error);
      setIsSaving(false);
    }
  };

  // Debounced save (2 seconds after last change)
  const debouncedSave = useDebounce(saveResume, 2000);

  // Trigger auto-save when data changes
  useEffect(() => {
    if (isDirty) {
      debouncedSave();
    }
  }, [isDirty, debouncedSave]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <BuilderHeader
        resumeId={resume.id}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
      />

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto border-r border-black ${
            isMobilePreview ? "hidden lg:block" : "block"
          }`}
        >
          <BuilderForm />
        </div>

        {/* Right Panel - Preview */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto bg-gray-50 ${
            isMobilePreview ? "block" : "hidden lg:block"
          }`}
        >
          <BuilderPreview />
        </div>
      </div>
    </div>
  );
}
