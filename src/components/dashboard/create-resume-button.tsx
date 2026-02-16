"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createResume } from "@/actions/resume";

interface CreateResumeButtonProps {
  variant?: "default" | "large";
}

export function CreateResumeButton({ variant = "default" }: CreateResumeButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const resume = await createResume("Untitled Resume", "lab-protocol");
      router.push(`/builder/${resume.id}`);
    } catch (error) {
      console.error("Failed to create resume:", error);
      setIsCreating(false);
    }
  };

  if (variant === "large") {
    return (
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="border-2 border-black bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? "CREATING..." : "+ NEW RESUME"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isCreating ? "CREATING..." : "+ NEW RESUME"}
    </button>
  );
}
