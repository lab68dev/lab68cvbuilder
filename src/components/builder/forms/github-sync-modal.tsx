"use client";

import { useState } from "react";
import { Github, Loader2, X, Plus } from "lucide-react";
import { generateGitHubAchievements } from "@/actions/github-achievements";
import { useResumeStore } from "@/store/resume-store";

export function GithubSyncModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, setData } = useResumeStore();

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const { result } = await generateGitHubAchievements(username);

      // Append the new projects to existing data
      setData({
        ...data,
        projects: [...data.projects, ...result],
      });

      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to sync from GitHub.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white max-w-md w-full sketch-card p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-black p-1 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Github className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Sync GitHub</h2>
          <p className="text-sm text-gray-600 mt-2">
            Enter your GitHub username. We&apos;ll analyze your top repositories
            and AI will automatically write STAR-method achievements.
          </p>
        </div>

        <form onSubmit={handleSync} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="label-mono block mb-2">GitHub username *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. torvalds"
              className="w-full border border-gray-400 p-3 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username}
            className="w-full border border-black bg-black text-white p-3 font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-4 animate-spin" />
                Analyzing repos...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-3" />
                Generate achievements
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
