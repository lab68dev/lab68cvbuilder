"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useResumeStore } from "@/store/resume-store";
import { CV_FONTS } from "@/lib/fonts";
import { PDF_LOCALES } from "@/lib/pdf-labels";
import { TEMPLATES } from "@/lib/constants";
import { checkResumeGrammarAndSpelling } from "@/actions/ai";
import { PdfPreviewModal } from "./pdf-preview-modal";
import { TemplatePicker } from "./template-picker";
import { TutorialPopup } from "./tutorial-popup";

interface BuilderHeaderProps {
  resumeId: string;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  saveValidationError?: string | null;
  isGuest?: boolean;
}

export function BuilderHeader({
  resumeId,
  isMobilePreview,
  onToggleMobilePreview,
  saveValidationError,
  isGuest = false,
}: BuilderHeaderProps) {
  const {
    title,
    setTitle,
    templateId,
    setTemplateId,
    fontFamily,
    setFontFamily,
    pdfLocale,
    setPdfLocale,
    isSaving,
    isDirty,
    lastSavedAt,
    data,
    setData,
  } = useResumeStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isCheckingWriting, setIsCheckingWriting] = useState(false);
  const [writingStatus, setWritingStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("resume.pdf");
  const [exportError, setExportError] = useState<string | null>(null);

  // Auto-clear export error once the user fixes the underlying issue
  useEffect(() => {
    if (!exportError) return;
    const validTemplateIds: readonly string[] = TEMPLATES.map((t) => t.id);
    if (
      validTemplateIds.includes(templateId) &&
      data.personalInfo.fullName.trim() &&
      data.personalInfo.email.trim()
    ) {
      setExportError(null);
    }
  }, [
    exportError,
    templateId,
    data.personalInfo.fullName,
    data.personalInfo.email,
  ]);

  useEffect(() => {
    if (!writingStatus) return;
    const timer = window.setTimeout(() => {
      setWritingStatus(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [writingStatus]);

  const handlePreviewPdf = async () => {
    // Prevent concurrent exports and re-generation while modal is open
    if (isExporting || previewPdfUrl) return;

    const validTemplateIds: readonly string[] = TEMPLATES.map((t) => t.id);
    if (!validTemplateIds.includes(templateId)) {
      setExportError("Please select a template before exporting.");
      return;
    }
    if (!data.personalInfo.fullName.trim()) {
      setExportError("Full Name is required before exporting.");
      return;
    }
    if (!data.personalInfo.email.trim()) {
      setExportError("Email is required before exporting.");
      return;
    }
    setExportError(null);

    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/export/${resumeId}?locale=${pdfLocale}`,
      );
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition if available
      const disposition = response.headers.get("Content-Disposition");
      let filename = `${title || "resume"}.pdf`;
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename="([^"]+)"/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }

      setPreviewFilename(filename);
      setPreviewPdfUrl(url);
    } catch (error) {
      console.error("Failed to generate PDF preview:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClosePreview = () => {
    if (previewPdfUrl) {
      window.URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewPdfUrl(null);
  };

  const handleCheckWriting = async () => {
    if (isCheckingWriting) return;
    setIsCheckingWriting(true);
    setWritingStatus(null);
    try {
      const { result } = await checkResumeGrammarAndSpelling(data);
      setData(result);
      setWritingStatus({
        type: "success",
        message: "Grammar & spelling check completed.",
      });
    } catch (error) {
      console.error("Failed to check grammar/spelling:", error);
      setWritingStatus({
        type: "error",
        message:
          (error as Error).message ||
          "Failed to check writing. Please try again.",
      });
    } finally {
      setIsCheckingWriting(false);
    }
  };

  const jumpToSection = (sectionId: string) => {
    if (typeof window === "undefined") return;
    window.location.hash = sectionId;
  };

  const setBulletSymbol = (symbol: string) => {
    const next = symbol.slice(0, 3);
    setData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        bulletSymbol: next,
      },
    });
  };

  const activeBulletSymbol = (data.personalInfo.bulletSymbol || "•").slice(
    0,
    3,
  );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black bg-white shadow-sm lg:static lg:shadow-none">
        <div className="p-4">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href={isGuest ? "/" : "/dashboard"}
                className="border border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                ← {isGuest ? "Home" : "Back"}
              </Link>
              <span className="label-mono">
                {isGuest ? "GUEST_MODE" : "BUILDER_MODE"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Save status */}
              <div className="hidden md:flex items-center gap-2">
                {isGuest ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                    <span className="label-mono text-gray-500">
                      NOT SAVED · GUEST
                    </span>
                  </>
                ) : saveValidationError ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    <span className="label-mono text-red-500 text-[10px]">
                      {saveValidationError}
                    </span>
                  </>
                ) : isSaving ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="label-mono text-yellow-600">
                      SAVING...
                    </span>
                  </>
                ) : isDirty ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                    <span className="label-mono text-orange-500">UNSAVED</span>
                  </>
                ) : lastSavedAt ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    <span className="label-mono text-green-600">
                      SAVED {lastSavedAt.toLocaleTimeString()}
                    </span>
                  </>
                ) : null}
              </div>

              {/* Mobile preview toggle */}
              <button
                onClick={onToggleMobilePreview}
                className="lg:hidden border border-black px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                {isMobilePreview ? "Edit" : "Preview"}
              </button>

              {/* Grammar + Export actions */}
              <div className="flex flex-col items-end gap-1">
                {isGuest ? (
                  <div className="flex flex-wrap justify-end items-center gap-2">
                    <TutorialPopup
                      isGuest
                      triggerClassName="border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors duration-150"
                    />
                    <Link
                      href="/login"
                      className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-white hover:text-black transition-colors duration-150"
                    >
                      SIGN IN TO EXPORT
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-end items-center gap-2">
                      <TutorialPopup triggerClassName="border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors duration-150" />
                      <button
                        onClick={handleCheckWriting}
                        disabled={isCheckingWriting}
                        className={`border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                          isCheckingWriting
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "hover:border-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {isCheckingWriting ? "CHECKING..." : "CHECK GRAMMAR"}
                      </button>
                      <button
                        onClick={handlePreviewPdf}
                        disabled={isExporting}
                        className={`border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                          isExporting
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-white hover:text-black"
                        }`}
                      >
                        {isExporting ? "GENERATING..." : "EXPORT PDF"}
                      </button>
                    </div>
                    {writingStatus && (
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider max-w-64 text-right ${
                          writingStatus.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {writingStatus.message}
                      </p>
                    )}
                    {exportError && (
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider max-w-48 text-right">
                        {exportError}
                      </p>
                    )}
                  </>
                )}
              </div>
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
                className="w-full border border-gray-300 bg-transparent px-3 py-2 text-lg font-bold focus:border-black transition-all duration-150"
              />
            </div>

            {/* Template selector */}
            <TemplatePicker value={templateId} onChange={setTemplateId} />

            {/* Font selector */}
            <div className="flex items-center gap-2">
              <span className="label-mono">FONT:</span>
              <select
                title="Font family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="border border-black bg-transparent px-3 py-2 text-xs font-bold tracking-wider transition-all duration-150"
              >
                {CV_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PDF Language selector */}
            <div className="flex items-center gap-2">
              <span className="label-mono">LANG:</span>
              <select
                title="PDF language"
                value={pdfLocale}
                onChange={(e) => setPdfLocale(e.target.value)}
                className="border border-black bg-transparent px-3 py-2 text-xs font-bold tracking-wider transition-all duration-150"
              >
                {PDF_LOCALES.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 border-t border-black pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono text-gray-500">QUICK_ACCESS</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                Jump straight to key tools
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => jumpToSection("personal")}
                className="border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                Profile Import
              </button>
              <button
                type="button"
                onClick={() => jumpToSection("versions")}
                className="border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                Version History
              </button>
              <button
                type="button"
                onClick={() => jumpToSection("score")}
                className="border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                Resume Score
              </button>
              <Link
                href={isGuest ? "/login" : "/applications"}
                className="border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                Applications Tracker
              </Link>

              <div className="ml-0 sm:ml-2 flex items-center gap-2 border border-gray-300 bg-white px-2 py-1">
                <span className="label-mono text-gray-500">BULLET</span>
                <input
                  type="text"
                  value={activeBulletSymbol}
                  onChange={(e) => setBulletSymbol(e.target.value)}
                  maxLength={3}
                  aria-label="Bullet symbol"
                  className="w-10 border border-black bg-white px-1 py-0.5 text-center text-xs font-bold transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setBulletSymbol("•")}
                  className="border border-gray-300 px-2 py-0.5 text-[10px] font-bold hover:border-black hover:bg-black hover:text-white transition-colors duration-150"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => setBulletSymbol("-")}
                  className="border border-gray-300 px-2 py-0.5 text-[10px] font-bold hover:border-black hover:bg-black hover:text-white transition-colors duration-150"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setBulletSymbol("→")}
                  className="border border-gray-300 px-2 py-0.5 text-[10px] font-bold hover:border-black hover:bg-black hover:text-white transition-colors duration-150"
                >
                  →
                </button>
              </div>

              <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <span className="label-mono text-emerald-700">LIVE</span>
                <span className="normal-case font-semibold">
                  {activeBulletSymbol} Built scalable checkout flow
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Preview Modal */}
      {previewPdfUrl && (
        <PdfPreviewModal
          pdfUrl={previewPdfUrl}
          filename={previewFilename}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
}
