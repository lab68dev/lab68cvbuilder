"use client";

import Link from "next/link";
import { useResumeStore } from "@/store/resume-store";
import { TEMPLATES } from "@/lib/constants";
import { CV_FONTS } from "@/lib/fonts";

interface BuilderHeaderProps {
  resumeId: string;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
}

export function BuilderHeader({
  resumeId,
  isMobilePreview,
  onToggleMobilePreview,
}: BuilderHeaderProps) {
  const { title, setTitle, templateId, setTemplateId, fontFamily, setFontFamily, isSaving, lastSavedAt } =
    useResumeStore();

  return (
    <header className="border-b border-black bg-white">
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="border border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
            >
              ← Back
            </Link>
            <span className="label-mono">BUILDER_MODE</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Save status */}
            <div className="hidden md:flex items-center gap-2">
              {isSaving ? (
                <span className="label-mono text-gray-500">SAVING...</span>
              ) : lastSavedAt ? (
                <span className="label-mono text-green-600">
                  SAVED {lastSavedAt.toLocaleTimeString()}
                </span>
              ) : null}
            </div>

            {/* Mobile preview toggle */}
            <button
              onClick={onToggleMobilePreview}
              className="lg:hidden border border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
            >
              {isMobilePreview ? "Edit" : "Preview"}
            </button>

            {/* Export button */}
            <Link
              href={`/api/export/${resumeId}`}
              target="_blank"
              className="border border-black bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-150"
            >
              Export PDF
            </Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Title input */}
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resume Title"
              className="w-full border border-gray-300 bg-transparent px-3 py-2 text-lg font-bold focus:border-black focus:bg-black focus:text-white transition-all duration-150"
            />
          </div>

          {/* Template selector */}
          <div className="flex items-center gap-2">
            <span className="label-mono">TEMPLATE:</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="border border-black bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-wider focus:bg-black focus:text-white transition-all duration-150"
            >
              {TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Font selector */}
          <div className="flex items-center gap-2">
            <span className="label-mono">FONT:</span>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="border border-black bg-transparent px-3 py-2 text-xs font-bold tracking-wider focus:bg-black focus:text-white transition-all duration-150"
            >
              {CV_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
