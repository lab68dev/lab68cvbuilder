import type { ResumeData } from "@/db/schema";
import { type PdfLabels } from "@/lib/pdf-labels";
import { getPdfLabels, getDateLocale } from "@/lib/pdf-labels";
import { ensureHref } from "@/lib/url-helpers";
import { getResumeBulletSymbol } from "@/lib/bullet-symbol";

interface TemplateProps {
  data: ResumeData;
  labels?: PdfLabels;
  dateLocale?: string;
  activeSection?: string;
}

export function MinimalTemplate({
  data,
  labels,
  dateLocale,
  activeSection,
}: TemplateProps) {
  const l = labels ?? getPdfLabels("en");
  const dl = dateLocale ?? getDateLocale("en");
  const bulletSymbol = getResumeBulletSymbol(data, "•");
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    competitions = [],
    languages,
  } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(`${dateStr}-01`);
    return date.toLocaleDateString(dl, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const formatDateRange = (start: string, end: string, current: boolean) =>
    `${formatDate(start)} - ${current ? l.present : formatDate(end)}`;

  const sectionClass = (id: string) =>
    `transition-all duration-500 ${activeSection === id ? "bg-blue-50/30 ring-2 ring-blue-100/60 -mx-3 px-3 py-2" : ""}`;

  return (
    <div className="bg-white text-black p-8">
      <header
        id="preview-section-personal"
        className={`${sectionClass("personal")} border-b border-gray-300 pb-4 mb-5`}
      >
        <h1 className="text-3xl font-black tracking-tight">
          {personalInfo.fullName || l.yourName}
        </h1>
        <div className="mt-2 text-xs text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
          {personalInfo.email ? <span>{personalInfo.email}</span> : null}
          {personalInfo.phone ? <span>{personalInfo.phone}</span> : null}
          {personalInfo.location ? <span>{personalInfo.location}</span> : null}
          {personalInfo.website ? (
            <a
              href={ensureHref(personalInfo.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {l.portfolio}
            </a>
          ) : null}
          {personalInfo.linkedin ? (
            <a
              href={ensureHref(personalInfo.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              LinkedIn
            </a>
          ) : null}
          {personalInfo.github ? (
            <a
              href={ensureHref(personalInfo.github)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub
            </a>
          ) : null}
        </div>
        {personalInfo.summary ? (
          <p className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {personalInfo.summary}
          </p>
        ) : null}
      </header>

      {experience.length > 0 ? (
        <section
          id="preview-section-experience"
          className={`${sectionClass("experience")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.experience}
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-3">
                  <h3 className="text-sm font-bold">
                    {exp.position} - {exp.company}
                  </h3>
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {formatDateRange(
                      exp.startDate,
                      exp.endDate || "",
                      exp.current,
                    )}
                  </span>
                </div>
                {exp.location ? (
                  <p className="text-[10px] text-gray-500">{exp.location}</p>
                ) : null}
                {exp.description ? (
                  <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">
                    {exp.description}
                  </p>
                ) : null}
                {exp.highlights.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {exp.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 flex gap-1.5"
                      >
                        <span>{bulletSymbol}</span>
                        <span className="whitespace-pre-line">{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {education.length > 0 ? (
        <section
          id="preview-section-education"
          className={`${sectionClass("education")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.education}
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between items-baseline gap-3">
                  <span className="font-bold">
                    {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatDateRange(
                      edu.startDate,
                      edu.endDate || "",
                      edu.current,
                    )}
                  </span>
                </div>
                <p className="text-gray-700">{edu.institution}</p>
                {edu.location ? (
                  <p className="text-gray-700">{edu.location}</p>
                ) : null}
                {edu.gpa ? (
                  <p className="text-gray-700">
                    {l.gpa}: {edu.gpa}
                  </p>
                ) : null}
                {(edu.coursework ?? []).length > 0 ? (
                  <p className="text-gray-700">
                    Relevant Coursework: {(edu.coursework ?? []).join(", ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section
          id="preview-section-skills"
          className={`${sectionClass("skills")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.skills}
          </h2>
          <div className="space-y-1.5 text-xs text-gray-700">
            {skills.map((cat) => (
              <p key={cat.id}>
                <span className="font-bold">{cat.category}:</span>{" "}
                {cat.items.join(", ")}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section
          id="preview-section-projects"
          className={`${sectionClass("projects")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.projects}
          </h2>
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="text-sm font-bold">{project.name}</h3>
                {project.description ? (
                  <p className="text-xs text-gray-700 whitespace-pre-line">
                    {project.description}
                  </p>
                ) : null}
                {project.technologies.length > 0 ? (
                  <p className="text-xs text-gray-600">
                    {project.technologies.join(", ")}
                  </p>
                ) : null}
                {project.url || project.githubUrl || project.websiteUrl ? (
                  <div className="mt-0.5 text-[11px] text-gray-600 flex flex-wrap gap-x-3">
                    {project.url ? (
                      <a
                        href={ensureHref(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {l.project}
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a
                        href={ensureHref(project.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        GitHub
                      </a>
                    ) : null}
                    {project.websiteUrl ? (
                      <a
                        href={ensureHref(project.websiteUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {l.website}
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {project.highlights.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {project.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 flex gap-1.5"
                      >
                        <span>{bulletSymbol}</span>
                        <span className="whitespace-pre-line">{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section
          id="preview-section-certifications"
          className={`${sectionClass("certifications")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.certifications}
          </h2>
          <div className="space-y-1 text-xs text-gray-700">
            {certifications.map((cert) => (
              <div key={cert.id}>
                <p>
                  <span className="font-bold">{cert.name}</span>
                  {cert.issuer ? ` - ${cert.issuer}` : ""}
                </p>
                {cert.date ? (
                  <p className="text-[10px] text-gray-500">
                    {formatDate(cert.date)}
                  </p>
                ) : null}
                {cert.url ? (
                  <a
                    href={ensureHref(cert.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {l.viewCertificate}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {competitions.length > 0 ? (
        <section
          id="preview-section-competitions"
          className={`${sectionClass("competitions")} mb-5`}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.competitions}
          </h2>
          <div className="space-y-1 text-xs text-gray-700">
            {competitions.map((comp) => (
              <p key={comp.id}>
                <span className="font-bold">{comp.name}</span>
                {comp.role ? ` - ${comp.role}` : ""}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {languages.length > 0 ? (
        <section
          id="preview-section-languages"
          className={sectionClass("languages")}
        >
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 mb-2">
            {l.languages}
          </h2>
          <div className="space-y-1 text-xs text-gray-700">
            {languages.map((lang) => (
              <p key={lang.id}>
                <span className="font-bold">{lang.language}:</span>{" "}
                {lang.proficiency}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
