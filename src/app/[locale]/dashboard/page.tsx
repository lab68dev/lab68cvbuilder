import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getUserResumes } from "@/actions/resume";
import { CreateResumeButton } from "@/components/dashboard/create-resume-button";
import { GuestDraftMigration } from "@/components/dashboard/guest-draft-migration";
import { ResumeCard } from "@/components/dashboard/resume-card";
import { ProductsDropdown } from "@/components/layout/products-dropdown";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/routing";
import { GUEST_MIGRATION_PARAM } from "@/lib/constants";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resumes = await getUserResumes();
  const shouldMigrateGuestDraft =
    (await searchParams)[GUEST_MIGRATION_PARAM] === "1";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div>
                <span className="label-mono block mb-0.5">DASHBOARD</span>
                <span className="text-sm font-black uppercase tracking-wider">
                  lab68cv.builder
                </span>
              </div>
            </Link>
            <div className="hidden md:block">
              <ProductsDropdown />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/applications"
              className="hidden md:inline-flex border border-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150"
            >
              Applications
            </Link>
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
      <main className="max-w-7xl mx-auto p-6 flex-1">
        {shouldMigrateGuestDraft ? <GuestDraftMigration /> : null}
        <section className="mb-8 rounded-lg bg-gray-50/70 p-5 md:p-6">
          <div className="mb-4">
            <span className="label-mono block mb-1 text-gray-500">
              MAJOR_UPDATE // QUICK_ACCESS
            </span>
            <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
              Jump to the most important tools from the major update. Each card
              takes users directly to a feature with minimal friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/applications"
              className="group rounded-md border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
            >
              <p className="label-mono text-gray-400 mb-2">01 // TRACK</p>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-900">
                Applications Tracker
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Track pipeline status, notes, and follow-ups in one place.
              </p>
            </Link>

            <Link
              href="/try"
              className="group rounded-md border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
            >
              <p className="label-mono text-gray-400 mb-2">02 // IMPORT</p>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-900">
                Profile Import
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Import from GitHub, LinkedIn ZIP, Behance, and Forg.
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="group rounded-md border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
            >
              <p className="label-mono text-gray-400 mb-2">03 // RESTORE</p>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-900">
                Version History
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Open any resume and use the Versions tab to restore snapshots.
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="group rounded-md border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
            >
              <p className="label-mono text-gray-400 mb-2">04 // POLISH</p>
              <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-900">
                AI + Export
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Use Check Grammar then export PDF directly from builder header.
              </p>
            </Link>
          </div>
        </section>

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
      </main>
      <Footer />
    </div>
  );
}
