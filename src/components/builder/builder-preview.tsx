"use client";

import { useEffect, useState, useRef } from "react";
import { useResumeStore } from "@/store/resume-store";
import { CreativeTemplate } from "./templates/creative-template";
import { ExecutiveTemplate } from "./templates/executive-template";
import { HarvardTemplate } from "./templates/harvard-template";
import { AtsTemplate } from "./templates/ats-template";
import { MinimalTemplate } from "./templates/minimal-template";
import { ModernTemplate } from "./templates/modern-template";
import type { ResumeData } from "@/db/schema";
import type { TemplateId } from "@/lib/constants";
import { ComponentType } from "react";
import { getGoogleFontsCSSUrl, getCSSFontFamily } from "@/lib/fonts";
import { type PdfLabels, getPdfLabels, getDateLocale } from "@/lib/pdf-labels";

const TEMPLATE_COMPONENTS: Record<
  TemplateId,
  ComponentType<{
    data: ResumeData;
    labels?: PdfLabels;
    dateLocale?: string;
    activeSection?: string;
  }>
> = {
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
  harvard: HarvardTemplate,
  ats: AtsTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
};

export function BuilderPreview() {
  const { templateId, fontFamily, data, pdfLocale, activeSection } =
    useResumeStore();
  const Template =
    TEMPLATE_COMPONENTS[templateId as TemplateId] || HarvardTemplate;
  const [darkBg, setDarkBg] = useState(false);

  // Auto-scroll to active section in preview
  useEffect(() => {
    if (!activeSection) return;

    // Give a small delay to ensure the template has rendered the new highlight
    const timer = setTimeout(() => {
      const element = document.getElementById(
        `preview-section-${activeSection}`,
      );
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeSection]);

  // Dynamically load the selected Google Font
  useEffect(() => {
    const linkId = `gfont-${fontFamily}`;
    if (document.getElementById(linkId)) return; // already loaded

    const cssUrl = getGoogleFontsCSSUrl(fontFamily);
    if (!cssUrl) return;

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.head.appendChild(link);
  }, [fontFamily]);

  const cssFontFamily = getCSSFontFamily(fontFamily);

  // Auto-scaling logic to fit the 8.5in (~816px) resume into the viewport
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      // The resume is 8.5in wide -> roughly 816px at 96 DPI
      const RESUME_WIDTH_PX = 816;
      // How much horizontal padding we want around the resume inside its container
      const PADDING_PX = 32;

      const containerWidth = containerRef.current.clientWidth;
      const availableWidth = containerWidth - PADDING_PX;

      if (availableWidth < RESUME_WIDTH_PX) {
        setScale(availableWidth / RESUME_WIDTH_PX);
      } else {
        setScale(1); // Standard scale on Desktop
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [templateId, fontFamily]);

  return (
    <div
      className={`min-h-full p-8 transition-colors duration-300 ${darkBg ? "bg-gray-900" : ""}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span
            className={`label-mono block mb-2 ${darkBg ? "text-gray-400" : ""}`}
          >
            Live preview
          </span>
          <p
            className={`text-xs ${darkBg ? "text-gray-500" : "text-gray-600"}`}
          >
            This is how your resume will appear when exported
          </p>
        </div>
        <button
          onClick={() => setDarkBg(!darkBg)}
          className={`border px-3 py-1.5 text-xs font-bold transition-colors duration-150 ${
            darkBg
              ? "border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
              : "border-gray-400 text-gray-500 hover:bg-note"
          }`}
        >
          {darkBg ? "☀ Light" : "● Dark"}
        </button>
      </div>

      {/* Resume preview container — dynamic scale applied, wrapped in calculating div */}
      <div
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden pb-16"
      >
        <div
          className="cv-sheet bg-white shadow-2xl origin-top"
          style={{
            width: "816px",
            height: "1056px", // 11in standard length for correct scaling calculations
            fontFamily: cssFontFamily,
            transform: `scale(${scale})`,
            // Determine container height based on the scaled element height to prevent clipping
            marginBottom: `-${1056 * (1 - scale)}px`,
          }}
        >
          <Template
            data={data}
            labels={getPdfLabels(pdfLocale)}
            dateLocale={getDateLocale(pdfLocale)}
            activeSection={activeSection}
          />
        </div>
      </div>
    </div>
  );
}
