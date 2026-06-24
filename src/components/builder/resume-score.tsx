"use client";

import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";

export interface Check {
  label: string;
  passed: boolean;
  weight: number;
}

export function scoreResume(data: ResumeData): {
  total: number;
  checks: Check[];
} {
  const p = data.personalInfo;

  const checks: Check[] = [
    { label: "Full name", passed: p.fullName.trim().length > 0, weight: 10 },
    { label: "Email address", passed: p.email.trim().length > 0, weight: 10 },
    {
      label: "Phone number",
      passed: (p.phone ?? "").trim().length > 0,
      weight: 5,
    },
    {
      label: "Location",
      passed: (p.location ?? "").trim().length > 0,
      weight: 5,
    },
    {
      label: "Professional summary (50+ chars)",
      passed: (p.summary ?? "").trim().length >= 50,
      weight: 10,
    },
    {
      label: "At least one link (website/LinkedIn/GitHub)",
      passed:
        (p.website ?? "").trim().length > 0 ||
        (p.linkedin ?? "").trim().length > 0 ||
        (p.github ?? "").trim().length > 0,
      weight: 5,
    },
    {
      label: "At least 1 experience entry",
      passed: data.experience.length > 0,
      weight: 15,
    },
    {
      label: "Experience descriptions filled",
      passed:
        data.experience.length > 0 &&
        data.experience.every((e) => e.description.trim().length > 0),
      weight: 10,
    },
    {
      label: "At least 1 education entry",
      passed: data.education.length > 0,
      weight: 10,
    },
    {
      label: "At least 1 skill category with items",
      passed:
        data.skills.length > 0 && data.skills.some((s) => s.items.length > 0),
      weight: 10,
    },
    {
      label: "At least 1 project",
      passed: data.projects.length > 0,
      weight: 5,
    },
    {
      label: "Experience highlights added",
      passed:
        data.experience.length > 0 &&
        data.experience.some(
          (e) => e.highlights.filter((h) => h.trim()).length > 0,
        ),
      weight: 5,
    },
  ];

  const maxScore = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  const total = Math.round((earned / maxScore) * 100);

  return { total, checks };
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "text-green-600"
      : score >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-black ${color}`}>{score}%</span>
      </div>
    </div>
  );
}

export function ResumeScorePanel() {
  const { data } = useResumeStore();
  const { total, checks } = scoreResume(data);

  const grade =
    total >= 90
      ? "EXCELLENT"
      : total >= 75
        ? "GOOD"
        : total >= 50
          ? "NEEDS WORK"
          : "INCOMPLETE";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">ANALYSIS // SCORE</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Resume Score
        </h2>
        <p className="text-sm text-gray-600">
          How complete and competitive your resume is
        </p>
      </div>

      <div className="border border-black p-6 flex items-center gap-8">
        <ScoreRing score={total} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Overall Grade
          </p>
          <p className="text-2xl font-black">{grade}</p>
          <p className="text-sm text-gray-500 mt-1">
            {checks.filter((c) => c.passed).length} / {checks.length} checks
            passed
          </p>
        </div>
      </div>

      <div className="border border-black divide-y divide-gray-200">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-lg ${check.passed ? "text-green-600" : "text-gray-300"}`}
              >
                {check.passed ? "✓" : "○"}
              </span>
              <span
                className={`text-sm ${check.passed ? "text-gray-900" : "text-gray-500"}`}
              >
                {check.label}
              </span>
            </div>
            <span className="label-mono text-gray-400">+{check.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
