"use client";

import { useMemo, useState } from "react";

const TUTORIAL_STORAGE_KEY = "lab68_builder_tutorial_seen_v1";

interface TutorialPopupProps {
  isGuest?: boolean;
  triggerClassName?: string;
}

export function TutorialPopup({
  isGuest = false,
  triggerClassName,
}: TutorialPopupProps) {
  const steps = useMemo(
    () => [
      {
        title: "Start With Section Tabs",
        description:
          "Use the section tabs at the top of the form to jump quickly between Personal Info, Experience, Education, Skills, and more.",
      },
      {
        title: "Follow Previous / Next",
        description:
          "If you prefer a guided flow, use Previous and Next to move step-by-step without hunting for the right tab.",
      },
      {
        title: "Complete Progress Checklist",
        description:
          "Use FIRST_RESUME_PROGRESS in the header to finish Contact, Experience, Skills, and Projects before export.",
      },
      {
        title: "Edit Left, Preview Right",
        description:
          "Your edits appear instantly in the live preview panel. On mobile, use the Preview button to switch views.",
      },
      {
        title: "Quality And Export",
        description:
          "Run Check Grammar before exporting. Then use Export PDF when your resume details are complete.",
      },
      {
        title: isGuest ? "Save Your Progress" : "Auto-Save Enabled",
        description: isGuest
          ? "You are in guest mode. Sign in when ready to keep your resume permanently and export with full features."
          : "Changes save automatically. You can also press Ctrl+S (or Cmd+S on Mac) for an immediate save.",
      },
    ],
    [isGuest],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [autoDismissed, setAutoDismissed] = useState(false);

  const shouldAutoOpen = (() => {
    if (autoDismissed) return false;
    if (typeof window === "undefined") return false;

    try {
      return localStorage.getItem(TUTORIAL_STORAGE_KEY) !== "1";
    } catch {
      return false;
    }
  })();

  const closeTutorial = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors and keep app usable.
    }
    setAutoDismissed(true);
    setIsOpen(false);
  };

  const openTutorial = () => {
    setIndex(0);
    setIsOpen(true);
  };

  const isLast = index === steps.length - 1;

  return (
    <>
      <button
        type="button"
        onClick={openTutorial}
        className={
          triggerClassName ||
          "border border-gray-400 px-4 py-2 text-xs font-bold hover:border-black hover:bg-note transition-colors duration-150"
        }
      >
        Guide
      </button>

      {(isOpen || shouldAutoOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 sm:p-8">
          <div className="w-full max-w-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto border border-black bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <p className="label-mono">CV builder tutorial</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  {steps[index].title}
                </h2>
                <span className="text-xs font-bold text-gray-500">
                  Step {index + 1}/{steps.length}
                </span>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
                {steps[index].description}
              </p>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                disabled={index === 0}
                className="border border-gray-400 px-3 py-2 text-[10px] font-bold hover:bg-note transition-colors duration-150 disabled:opacity-30"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeTutorial}
                  className="border border-gray-400 px-3 py-2 text-[10px] font-bold hover:bg-gray-100 transition-colors duration-150"
                >
                  Skip
                </button>

                {isLast ? (
                  <button
                    type="button"
                    onClick={closeTutorial}
                    className="border border-black bg-black text-white px-3 py-2 text-[10px] font-bold hover:bg-white hover:text-black transition-colors duration-150"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setIndex((prev) => Math.min(steps.length - 1, prev + 1))
                    }
                    className="border border-black bg-black text-white px-3 py-2 text-[10px] font-bold hover:bg-white hover:text-black transition-colors duration-150"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
