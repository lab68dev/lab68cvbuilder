"use client";

import { useEffect, useRef, useState } from "react";

interface PdfPreviewModalProps {
  pdfUrl: string;
  filename: string;
  onClose: () => void;
}

export function PdfPreviewModal({
  pdfUrl,
  filename,
  onClose,
}: PdfPreviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [showDonation, setShowDonation] = useState(false);

  const zoomScaleClass: Record<number, string> = {
    50: "scale-50",
    75: "scale-75",
    100: "scale-100",
    125: "scale-125",
    150: "scale-150",
    175: "scale-[1.75]",
    200: "scale-200",
  };

  const zoomViewportClass: Record<number, string> = {
    50: "w-[200%] h-[200%]",
    75: "w-[133.3333%] h-[133.3333%]",
    100: "w-full h-full",
    125: "w-[80%] h-[80%]",
    150: "w-[66.6667%] h-[66.6667%]",
    175: "w-[57.1429%] h-[57.1429%]",
    200: "w-[50%] h-[50%]",
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const zoomReset = () => setZoom(100);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const executeDownloadAndClose = () => {
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onClose();
  };

  const handleInitialDownloadClick = () => {
    setShowDonation(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
    >
      {/* Modal container */}
      <div className="relative flex flex-col bg-white border border-black w-[min(900px,95vw)] h-[min(90vh,95vh)]">
        {showDonation ? (
          <div className="flex flex-col items-center justify-center h-full p-8 md:p-16 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                ></path>
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Support the Project
            </h2>
            <p className="text-gray-600 max-w-lg mb-8 text-sm md:text-base leading-relaxed">
              resume.build() is completely free and open-source. If this tool
              helped you land a job or structure your career, consider
              supporting the development to keep the servers running.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <a
                href="https://ko-fi.com/lab68dev"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-black bg-black text-white px-8 py-4 font-black hover:bg-yellow-400 hover:text-black hover:border-black transition-all duration-200"
                onClick={() => {
                  // Optionally allow them to download immediately after clicking support
                  setTimeout(executeDownloadAndClose, 1000);
                }}
              >
                Buy me a coffee ☕
              </a>
              <button
                onClick={executeDownloadAndClose}
                className="border-2 border-gray-300 bg-white text-gray-500 px-8 py-4 font-bold hover:border-black hover:text-black hover:bg-gray-50 transition-all duration-200"
              >
                Maybe Later (Download)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black px-4 py-3 bg-white shrink-0 gap-3">
              <div className="flex items-center gap-3">
                <span className="label-mono text-xs hidden sm:inline-block">
                  PDF preview
                </span>
                <span className="text-xs font-bold sm:font-normal sm:text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                  {filename}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button
                  onClick={handleInitialDownloadClick}
                  className="flex-1 sm:flex-none justify-center border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150"
                >
                  ↓ Download
                </button>
                <button
                  onClick={onClose}
                  className="border border-black px-3 py-2 text-xs font-bold hover:bg-note transition-colors duration-150"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-2 border-b border-gray-200 px-4 py-2 bg-gray-50 shrink-0">
              <button
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="border border-gray-400 px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150 disabled:opacity-30"
              >
                −
              </button>
              <button
                onClick={zoomReset}
                className="border border-gray-400 px-3 py-1 text-xs font-mono tabular-nums hover:bg-note transition-colors duration-150 min-w-16 text-center"
              >
                {zoom}%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="border border-gray-400 px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150 disabled:opacity-30"
              >
                +
              </button>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <div
                className={`origin-top mx-auto ${zoomScaleClass[zoom]} ${zoomViewportClass[zoom]}`}
              >
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
