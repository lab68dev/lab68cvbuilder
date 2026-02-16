import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getUserResumes } from "@/actions/resume";
import Link from "next/link";
import { CreateResumeButton } from "@/components/dashboard/create-resume-button";
import { ResumeCard } from "@/components/dashboard/resume-card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resumes = await getUserResumes();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="label-mono block mb-1">DASHBOARD</span>
            <h1 className="text-2xl font-black tracking-tight">
              lab68dev CV Builder
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <span className="label-mono block">USER</span>
              <p className="text-sm font-medium">{session.user.email}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="label-mono block mb-2">
                YOUR_RESUMES // {resumes.length} TOTAL
              </span>
              <h2 className="text-4xl font-black tracking-tighter">
                CV Archive
              </h2>
            </div>
            <CreateResumeButton />
          </div>
          <div className="w-full border-t border-black" />
        </div>

        {/* Bento Grid */}
        {resumes.length === 0 ? (
          // Empty state
          <div className="border-2 border-dashed border-gray-300 p-12 text-center">
            <span className="label-mono block mb-4 text-gray-400">
              EMPTY_STATE
            </span>
            <h3 className="text-3xl font-black tracking-tight mb-4">
              No Resumes Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first resume to get started. Choose from our brutalist
              templates and build something raw.
            </p>
            <CreateResumeButton variant="large" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-6">
          <span className="label-mono text-gray-400">
            v0.1.0 // PHASE_03
          </span>
        </div>
      </main>
    </div>
  );
}
