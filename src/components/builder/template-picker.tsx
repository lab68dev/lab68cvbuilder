"use client";

import { useState, useRef, useEffect } from "react";
import { TEMPLATES } from "@/lib/constants";

interface TemplatePickerProps {
  value: string;
  onChange: (id: string) => void;
}

function MiniPreview({ id, active }: { id: string; active: boolean }) {
  const border = active ? "border-black" : "border-gray-300";
  const base = `w-15 h-20 border ${border} bg-white overflow-hidden p-1 flex`;

  if (id === "harvard") {
    return (
      <div className={`${base} flex-col gap-0.5`}>
        <div className="flex justify-between">
          <div className="w-6 h-1.5 bg-gray-800 rounded-sm" />
          <div className="w-3 h-1.5 bg-gray-400 rounded-sm" />
        </div>
        <div className="h-px bg-black" />
        <div className="w-full h-1 bg-gray-300 rounded-sm" />
        <div className="w-4/5 h-1 bg-gray-300 rounded-sm" />
        <div className="w-full h-1 bg-gray-200 rounded-sm" />
        <div className="w-3/5 h-1 bg-gray-200 rounded-sm" />
        <div className="w-full h-1 bg-gray-300 rounded-sm" />
      </div>
    );
  }

  if (id === "creative") {
    return (
      <div className={`${base} gap-0.5 p-0`}>
        <div className="w-1/3 bg-gray-800 flex flex-col items-center gap-0.5 p-1">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <div className="w-full h-0.5 bg-gray-500 rounded-sm" />
          <div className="w-4/5 h-0.5 bg-gray-600 rounded-sm" />
          <div className="w-full h-0.5 bg-gray-600 rounded-sm" />
        </div>
        <div className="flex-1 flex flex-col gap-0.5 p-1">
          <div className="w-full h-1 bg-gray-300 rounded-sm" />
          <div className="w-4/5 h-1 bg-gray-200 rounded-sm" />
          <div className="w-full h-1 bg-gray-300 rounded-sm" />
          <div className="w-3/5 h-1 bg-gray-200 rounded-sm" />
        </div>
      </div>
    );
  }

  if (id === "ats") {
    return (
      <div className={`${base} flex-col gap-0.5`}>
        <div className="w-8 h-1.5 bg-gray-700 rounded-sm mx-auto" />
        <div className="w-6 h-0.5 bg-gray-400 rounded-sm mx-auto" />
        <div className="w-full h-px bg-gray-300 mt-0.5" />
        <div className="w-full h-1 bg-gray-200 rounded-sm" />
        <div className="w-full h-1 bg-gray-200 rounded-sm" />
        <div className="w-4/5 h-1 bg-gray-200 rounded-sm" />
        <div className="w-full h-1 bg-gray-200 rounded-sm" />
        <div className="w-3/5 h-1 bg-gray-200 rounded-sm" />
      </div>
    );
  }

  if (id === "minimal") {
    return (
      <div className={`${base} flex-col gap-0.5`}>
        <div className="w-7 h-1.5 bg-gray-800 rounded-sm mx-auto" />
        <div className="w-full h-px bg-gray-300 mt-0.5" />
        <div className="w-full h-0.5 bg-gray-200 rounded-sm" />
        <div className="w-4/5 h-0.5 bg-gray-200 rounded-sm" />
        <div className="w-full h-0.5 bg-gray-200 rounded-sm" />
        <div className="w-full h-0.5 bg-gray-200 rounded-sm" />
      </div>
    );
  }

  if (id === "modern") {
    return (
      <div className={`${base} flex-col gap-0.5`}>
        <div className="h-1.5 bg-gray-800 w-full rounded-sm" />
        <div className="w-10 h-0.5 bg-gray-500 rounded-sm" />
        <div className="w-full h-px bg-gray-300 mt-0.5" />
        <div className="w-full h-1 bg-gray-200 rounded-sm" />
        <div className="w-5/6 h-1 bg-gray-200 rounded-sm" />
        <div className="w-full h-1 bg-gray-300 rounded-sm" />
      </div>
    );
  }

  // executive
  return (
    <div className={`${base} flex-col gap-0.5`}>
      <div className="h-1.5 bg-gray-800 w-full rounded-sm" />
      <div className="w-8 h-1 bg-gray-600 rounded-sm mx-auto" />
      <div className="w-5 h-0.5 bg-gray-400 rounded-sm mx-auto" />
      <div className="h-px bg-gray-300 mt-0.5" />
      <div className="w-full h-1 bg-gray-200 rounded-sm" />
      <div className="w-4/5 h-1 bg-gray-200 rounded-sm" />
      <div className="w-full h-1 bg-gray-300 rounded-sm" />
      <div className="w-3/5 h-1 bg-gray-200 rounded-sm" />
    </div>
  );
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = TEMPLATES.find((t) => t.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-black px-3 py-2 text-xs font-bold hover:bg-note transition-colors duration-150"
      >
        <span className="label-mono">Template:</span>
        {current?.name ?? "Select"}
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 sketch-card bg-white shadow-lg p-3 grid grid-cols-2 gap-3 w-72">
          {TEMPLATES.map((t) => {
            const active = t.id === value;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setOpen(false);
                }}
                className={`flex flex-col items-center gap-1.5 p-2 border transition-colors duration-150 ${
                  active
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-black"
                }`}
              >
                <MiniPreview id={t.id} active={active} />
                <span className="text-[10px] font-bold leading-tight text-center">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
