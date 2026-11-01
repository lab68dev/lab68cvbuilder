import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getUserJobs, createJob } from "@/actions/job";
import {
  createApplication,
  deleteApplication,
  getUserApplications,
  updateApplication,
} from "@/actions/application";
import {
  deleteCoverLetter,
  generateCoverLetter,
  getCoverLettersByApplicationIds,
  updateCoverLetter,
} from "@/actions/cover-letter";
import { getUserResumes } from "@/actions/resume";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/application-status";
import {
  type ApplicationSort,
  parseApplicationFiltersFromSearchParams,
} from "@/lib/application-filters";
import { getAtsRecommendations } from "@/lib/ats-recommendations";

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

type ApplicationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_OPTIONS: Array<{ value: ApplicationSort; label: string }> = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "updated_asc", label: "Oldest updated" },
  { value: "applied_desc", label: "Recently applied" },
  { value: "applied_asc", label: "Oldest applied" },
];

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filters = parseApplicationFiltersFromSearchParams(resolvedSearchParams);
  const createError = (() => {
    const value = resolvedSearchParams?.createError;
    if (Array.isArray(value)) return value[0];
    return value;
  })();

  const coverError = (() => {
    const value = resolvedSearchParams?.coverError;
    if (Array.isArray(value)) return value[0];
    return value;
  })();

  const [jobs, resumes, applications] = await Promise.all([
    getUserJobs(),
    getUserResumes(),
    getUserApplications(filters),
  ]);

  const coverLetters = await getCoverLettersByApplicationIds(
    applications.map((application) => application.applicationId),
  );

  const coverLettersByApplication = new Map<string, typeof coverLetters>();
  for (const letter of coverLetters) {
    const current = coverLettersByApplication.get(letter.applicationId) ?? [];
    current.push(letter);
    coverLettersByApplication.set(letter.applicationId, current);
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="label-mono block mb-1">Applications tracker</span>
            <h1 className="text-3xl font-black tracking-tight">Job Pipeline</h1>
          </div>
          <Link
            href="/dashboard"
            className="border border-black px-4 py-2 text-xs font-bold hover:bg-note transition-colors duration-150"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid gap-6 lg:grid-cols-2">
        <section className="sketch-card p-6">
          <h2 className="text-xl font-black mb-4">Create Job</h2>
          <form
            action={async (formData) => {
              "use server";
              await createJob({
                title: String(formData.get("title") || "").trim(),
                company: String(formData.get("company") || "").trim(),
                location:
                  String(formData.get("location") || "").trim() || undefined,
                sourceUrl:
                  String(formData.get("sourceUrl") || "").trim() || undefined,
                jdText: String(formData.get("jdText") || "").trim(),
              });
            }}
            className="space-y-3"
          >
            <input
              name="title"
              required
              placeholder="Job title"
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <input
              name="company"
              required
              placeholder="Company"
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <input
              name="location"
              placeholder="Location (optional)"
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <input
              name="sourceUrl"
              placeholder="Source URL (optional)"
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <textarea
              name="jdText"
              required
              placeholder="Paste job description"
              rows={8}
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150"
            >
              Save Job
            </button>
          </form>
        </section>

        <section className="sketch-card p-6">
          <h2 className="text-xl font-black mb-4">Create Application</h2>
          {createError ? (
            <p className="mb-3 border border-red-600 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {createError}
            </p>
          ) : null}
          <form
            action={async (formData) => {
              "use server";

              const selectedStatus = String(
                formData.get("status") || "wishlist",
              );
              try {
                await createApplication({
                  jobId: String(formData.get("jobId")),
                  resumeId: String(formData.get("resumeId") || "") || undefined,
                  status: selectedStatus as ApplicationStatus,
                  notes:
                    String(formData.get("notes") || "").trim() || undefined,
                });
                redirect("/applications");
              } catch (error: unknown) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Failed to create application";
                redirect(
                  `/applications?createError=${encodeURIComponent(message)}`,
                );
              }
            }}
            className="space-y-3"
          >
            <select
              aria-label="Select job"
              name="jobId"
              required
              className="w-full border border-black px-3 py-2 text-sm bg-white"
            >
              <option value="">Select job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} @ {job.company}
                </option>
              ))}
            </select>

            <select
              aria-label="Select resume"
              name="resumeId"
              className="w-full border border-black px-3 py-2 text-sm bg-white"
            >
              <option value="">Attach resume (optional)</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.title}
                </option>
              ))}
            </select>

            <select
              aria-label="Select status"
              name="status"
              defaultValue="wishlist"
              className="w-full border border-black px-3 py-2 text-sm bg-white"
            >
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <textarea
              name="notes"
              placeholder="Notes (optional)"
              rows={5}
              className="w-full border border-black px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150"
            >
              Add Application
            </button>
          </form>
        </section>

        <section className="lg:col-span-2 border border-black">
          <div className="px-6 py-4 border-b border-black flex items-center justify-between gap-4">
            <h2 className="text-xl font-black">Pipeline</h2>
            <span className="label-mono">{applications.length} records</span>
          </div>
          {coverError ? (
            <p className="border-b border-black bg-red-50 px-6 py-3 text-xs font-bold text-red-700">
              {coverError}
            </p>
          ) : null}

          <form
            method="GET"
            className="border-b border-black p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end"
          >
            <div>
              <label htmlFor="q" className="label-mono mb-1 block">
                Search (company or role)
              </label>
              <input
                id="q"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Ex: frontend, acme"
                className="w-full border border-black px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="label-mono mb-1 block">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={filters.status ?? ""}
                className="w-full border border-black px-3 py-2 text-sm bg-white"
              >
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="label-mono mb-1 block">
                Sort
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={filters.sort ?? "updated_desc"}
                className="w-full border border-black px-3 py-2 text-sm bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-white hover:text-black transition-colors duration-150"
              >
                Apply
              </button>
              <Link
                href="/applications"
                className="border border-black px-4 py-2 text-xs font-bold hover:bg-note transition-colors duration-150"
              >
                Clear
              </Link>
            </div>
          </form>

          {applications.length === 0 ? (
            <p className="p-6 text-sm text-gray-600">
              No applications yet. Add your first one above.
            </p>
          ) : (
            <div className="divide-y divide-black/10">
              {applications.map((item) => (
                <div
                  key={item.applicationId}
                  className="p-6 grid gap-4 lg:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-lg font-black tracking-tight">
                      {item.jobTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.company} {item.location ? `• ${item.location}` : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied: {formatDate(item.appliedAt)} • Updated:{" "}
                      {formatDate(item.updatedAt)}
                    </p>
                    {item.resumeTitle ? (
                      <p className="text-xs mt-2">
                        Resume:{" "}
                        <span className="font-bold">{item.resumeTitle}</span>
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="text-sm mt-3 border-l-2 border-black pl-3">
                        {item.notes}
                      </p>
                    ) : null}

                    <div className="mt-4 border border-gray-300 p-3">
                      <p className="label-mono mb-2">ATS recommendations</p>
                      {(() => {
                        const ats = getAtsRecommendations(
                          item.resumeData,
                          item.extractedKeywords,
                        );
                        return (
                          <>
                            <p className="text-sm font-bold mb-1">
                              Keyword coverage: {ats.coveragePercent}%
                            </p>
                            {ats.missingKeywords.length > 0 ? (
                              <p className="text-xs text-gray-600 mb-2">
                                Missing:{" "}
                                {ats.missingKeywords.slice(0, 8).join(", ")}
                                {ats.missingKeywords.length > 8 ? "..." : ""}
                              </p>
                            ) : (
                              <p className="text-xs text-green-700 mb-2">
                                No critical missing keywords detected.
                              </p>
                            )}
                            <ul className="list-disc pl-4 space-y-1">
                              {ats.recommendations.map((recommendation) => (
                                <li
                                  key={recommendation}
                                  className="text-xs text-gray-700"
                                >
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </>
                        );
                      })()}
                    </div>

                    <div className="mt-4 border border-gray-300 p-3 space-y-3">
                      <p className="label-mono">Cover letter studio</p>
                      <form
                        action={async (formData) => {
                          "use server";
                          try {
                            await generateCoverLetter({
                              applicationId: String(
                                formData.get("applicationId"),
                              ),
                              tone: String(
                                formData.get("tone") || "professional",
                              ) as "professional" | "confident" | "friendly",
                            });
                            redirect("/applications");
                          } catch (error: unknown) {
                            const message =
                              error instanceof Error
                                ? error.message
                                : "Failed to generate cover letter";
                            redirect(
                              `/applications?coverError=${encodeURIComponent(message)}`,
                            );
                          }
                        }}
                        className="flex flex-wrap gap-2"
                      >
                        <input
                          type="hidden"
                          name="applicationId"
                          value={item.applicationId}
                        />
                        <select
                          aria-label="Cover letter tone"
                          name="tone"
                          defaultValue="professional"
                          className="border border-black px-2 py-1 text-xs bg-white"
                        >
                          <option value="professional">Professional</option>
                          <option value="confident">Confident</option>
                          <option value="friendly">Friendly</option>
                        </select>
                        <button
                          type="submit"
                          className="border border-black px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150"
                        >
                          Generate
                        </button>
                      </form>

                      {(
                        coverLettersByApplication.get(item.applicationId) ?? []
                      ).map((letter) => (
                        <div key={letter.id}>
                          <form
                            action={async (formData) => {
                              "use server";
                              try {
                                await updateCoverLetter(
                                  String(formData.get("coverLetterId")),
                                  String(formData.get("content") || ""),
                                  String(
                                    formData.get("tone") || "professional",
                                  ) as
                                    | "professional"
                                    | "confident"
                                    | "friendly",
                                );
                                redirect("/applications");
                              } catch (error: unknown) {
                                const message =
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to update cover letter";
                                redirect(
                                  `/applications?coverError=${encodeURIComponent(message)}`,
                                );
                              }
                            }}
                            className="border border-gray-300 p-2 space-y-2"
                          >
                            <input
                              type="hidden"
                              name="coverLetterId"
                              value={letter.id}
                            />
                            <div className="flex gap-2 items-center">
                              <select
                                aria-label="Update cover letter tone"
                                name="tone"
                                defaultValue={letter.tone}
                                className="border border-black px-2 py-1 text-xs bg-white"
                              >
                                <option value="professional">
                                  Professional
                                </option>
                                <option value="confident">Confident</option>
                                <option value="friendly">Friendly</option>
                              </select>
                              <span className="text-xs text-gray-500">
                                Updated: {formatDate(letter.updatedAt)}
                              </span>
                            </div>
                            <textarea
                              aria-label="Cover letter content"
                              name="content"
                              defaultValue={letter.content}
                              rows={6}
                              className="w-full border border-black px-2 py-2 text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="border border-black px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150"
                              >
                                Save Letter
                              </button>
                              <button
                                type="button"
                                form={`delete-letter-${letter.id}`}
                                className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors duration-150"
                              >
                                Delete
                              </button>
                            </div>
                          </form>
                          <form
                            id={`delete-letter-${letter.id}`}
                            action={async (formData) => {
                              "use server";
                              try {
                                await deleteCoverLetter(
                                  String(formData.get("coverLetterId")),
                                );
                                redirect("/applications");
                              } catch (error: unknown) {
                                const message =
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to delete cover letter";
                                redirect(
                                  `/applications?coverError=${encodeURIComponent(message)}`,
                                );
                              }
                            }}
                          >
                            <input
                              type="hidden"
                              name="coverLetterId"
                              value={letter.id}
                            />
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <form
                      action={async (formData) => {
                        "use server";
                        await updateApplication(String(formData.get("id")), {
                          status: String(
                            formData.get("status"),
                          ) as ApplicationStatus,
                        });
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={item.applicationId}
                      />
                      <select
                        aria-label="Update application status"
                        name="status"
                        defaultValue={item.status}
                        className="border border-black px-2 py-1 text-xs bg-white"
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="border border-black px-3 py-1 text-xs font-bold hover:bg-note transition-colors duration-150"
                      >
                        Save
                      </button>
                    </form>
                    <Link
                      href={`/applications/${item.applicationId}/interview`}
                      className="border border-blue-600 bg-blue-50 text-blue-800 text-center px-3 py-2 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors duration-150"
                    >
                      Practice Interview
                    </Link>

                    <form
                      action={async (formData) => {
                        "use server";
                        await deleteApplication(String(formData.get("id")));
                      }}
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={item.applicationId}
                      />
                      <button
                        type="submit"
                        className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors duration-150 w-full"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
