"use client";

import { Link } from "@/i18n/routing";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteResume, updateResumeShareSettings } from "@/actions/resume";
import type { Resume } from "@/db/schema";
import { TEMPLATES } from "@/lib/constants";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [isSavingShare, setIsSavingShare] = useState(false);
  const [isPublic, setIsPublic] = useState(resume.isPublic);
  const [shareEmail, setShareEmail] = useState(
    resume.data.personalInfo.shareEmail !== false,
  );
  const [sharePhone, setSharePhone] = useState(
    resume.data.personalInfo.sharePhone !== false,
  );
  const [shareLocation, setShareLocation] = useState(
    resume.data.personalInfo.shareLocation !== false,
  );
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const template = TEMPLATES.find((t) => t.id === resume.templateId);
  const updatedDate = new Date(resume.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResume(resume.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete resume:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const absoluteLink = `${origin}/r/${resume.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(absoluteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveShare = async () => {
    setIsSavingShare(true);
    try {
      await updateResumeShareSettings(resume.id, {
        isPublic,
        shareEmail,
        sharePhone,
        shareLocation,
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to save share settings:", error);
    } finally {
      setIsSavingShare(false);
    }
  };

  return (
    <div className="sketch-card p-6 hover:border-2 transition-all duration-150 relative group">
      {/* Template badge */}
      <span className="label-mono block mb-3 text-gray-500">
        {template?.name || "Template"}
      </span>

      {/* Title */}
      <h3 className="text-2xl font-black tracking-tight mb-2 line-clamp-2">
        {resume.title}
      </h3>

      {/* Meta info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <span className="text-xs text-gray-500">
          Last edited: {updatedDate}
        </span>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
        <div className="border border-gray-300 p-2">
          <span className="label-mono block text-gray-500">Experience</span>
          <span className="font-bold">{resume.data.experience.length}</span>
        </div>
        <div className="border border-gray-300 p-2">
          <span className="label-mono block text-gray-500">Education</span>
          <span className="font-bold">{resume.data.education.length}</span>
        </div>
      </div>

      {/* Actions */}
      {!showDeleteConfirm ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/builder/${resume.id}`}
            className="flex-grow border border-black bg-black text-white px-4 py-2 text-xs font-bold text-center hover:bg-white hover:text-black transition-colors duration-150"
          >
            Edit
          </Link>
          <Link
            href={`/builder/${resume.id}?entry=import#personal`}
            className="border border-gray-400 px-4 py-2 text-xs font-bold text-center hover:border-black hover:bg-note transition-colors duration-150"
          >
            Import
          </Link>
          <Link
            href={`/builder/${resume.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview"
            className="border border-gray-400 px-4 py-2 text-xs font-bold text-center hover:border-black hover:bg-note transition-colors duration-150"
          >
            ⧉
          </Link>
          <button
            onClick={() => setShowSharePanel((prev) => !prev)}
            className="border border-gray-400 px-4 py-2 text-xs font-bold hover:border-black hover:bg-note transition-colors duration-150"
          >
            Share
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete"
            className="border border-gray-400 px-4 py-2 text-xs font-bold hover:border-red-600 hover:text-red-600 transition-colors duration-150"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="border-2 border-red-600 p-3">
          <span className="label-mono block mb-2 text-red-600">Confirm</span>
          <p className="text-xs mb-3">Delete this resume permanently?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 border border-red-600 bg-red-600 text-white px-3 py-2 text-xs font-bold hover:bg-white hover:text-red-600 transition-colors duration-150 disabled:opacity-50"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="flex-1 border border-black px-3 py-2 text-xs font-bold hover:bg-note transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSharePanel && !showDeleteConfirm ? (
        <div className="mt-4 sketch-card p-3 space-y-3 bg-gray-50">
          <span className="label-mono block">Public share</span>
          <label className="flex items-center gap-2 text-xs font-bold ">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Enable public link
          </label>
          <div className="grid gap-2 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shareEmail}
                onChange={(e) => setShareEmail(e.target.checked)}
              />
              Show email
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sharePhone}
                onChange={(e) => setSharePhone(e.target.checked)}
              />
              Show phone
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
              />
              Show location
            </label>
          </div>

          {isPublic ? (
            <div className="mt-2 space-y-2 border-t border-gray-200 pt-3">
              <span className="text-xs text-gray-500 font-bold block">
                Public Link
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={absoluteLink}
                  className="flex-1 border border-gray-300 px-3 py-2 text-xs font-mono bg-white focus:outline-none focus:border-black"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => {
                    const isDirty =
                      isPublic !== resume.isPublic ||
                      shareEmail !==
                        (resume.data.personalInfo.shareEmail !== false) ||
                      sharePhone !==
                        (resume.data.personalInfo.sharePhone !== false) ||
                      shareLocation !==
                        (resume.data.personalInfo.shareLocation !== false);
                    if (isDirty) {
                      alert(
                        "Please save your share settings before copying the link!",
                      );
                      return;
                    }
                    handleCopy();
                  }}
                  className="border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150 min-w-[80px]"
                >
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  href={absoluteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-gray-500 hover:text-black hover:underline "
                  onClick={(e) => {
                    const isDirty =
                      isPublic !== resume.isPublic ||
                      shareEmail !==
                        (resume.data.personalInfo.shareEmail !== false) ||
                      sharePhone !==
                        (resume.data.personalInfo.sharePhone !== false) ||
                      shareLocation !==
                        (resume.data.personalInfo.shareLocation !== false);
                    if (isDirty) {
                      e.preventDefault();
                      alert("Please save your share settings first!");
                    }
                  }}
                >
                  Open in new tab ↗
                </Link>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
            {(isPublic !== resume.isPublic ||
              shareEmail !== (resume.data.personalInfo.shareEmail !== false) ||
              sharePhone !== (resume.data.personalInfo.sharePhone !== false) ||
              shareLocation !==
                (resume.data.personalInfo.shareLocation !== false)) && (
              <span className="text-xs text-red-600 font-bold animate-pulse">
                ⚠️ Unsaved Changes
              </span>
            )}
            <button
              onClick={handleSaveShare}
              disabled={isSavingShare}
              className="ml-auto border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isSavingShare ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Public indicator */}
      {resume.isPublic && (
        <div className="absolute top-4 right-4">
          <span className="label-mono text-xs bg-black text-white px-2 py-1">
            Public
          </span>
        </div>
      )}
    </div>
  );
}
