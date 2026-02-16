import type { ResumeData } from "@/db/schema";
import { ensureHref } from "@/lib/url-helpers";

interface TemplateProps {
  data: ResumeData;
}

export function BoldImpactTemplate({ data }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatDateRange = (start: string, end: string, current: boolean) => {
    return `${formatDate(start)} – ${current ? "Present" : formatDate(end)}`;
  };

  return (
    <div className="bg-white text-black">
      {/* Header - large name with accent bar */}
      <div className="bg-black text-white px-10 pt-10 pb-8">
        <h1 className="text-5xl font-black tracking-tight leading-none mb-2">
          {personalInfo.fullName || "YOUR NAME"}
        </h1>
        {personalInfo.summary && (
          <p className="text-sm text-gray-300 leading-relaxed max-w-xl mt-3">
            {personalInfo.summary}
          </p>
        )}
      </div>
      {/* Accent bar */}
      <div className="h-1.5 bg-gray-800" />

      {/* Contact strip */}
      <div className="px-10 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <a href={ensureHref(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="hover:underline">Portfolio</a>}
          {personalInfo.linkedin && <a href={ensureHref(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>}
          {personalInfo.github && <a href={ensureHref(personalInfo.github)} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>}
        </div>
      </div>

      {/* Content */}
      <div className="px-10 py-8">
        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-black inline-block" />
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-gray-200 pl-5">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold">{exp.position}</h3>
                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                      {formatDateRange(exp.startDate, exp.endDate || "", exp.current)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {exp.company}{exp.location ? ` — ${exp.location}` : ""}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">{exp.description}</p>
                  )}
                  {exp.highlights.length > 0 && (
                    <ul className="space-y-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-black font-bold">›</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two column: Skills + Education */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-black inline-block" />
                Skills
              </h2>
              <div className="space-y-3">
                {skills.map((cat) => (
                  <div key={cat.id}>
                    <div className="text-xs font-bold uppercase tracking-wide text-black mb-1">{cat.category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, i) => (
                        <span key={i} className="text-[10px] border border-gray-300 px-2 py-0.5 text-gray-600">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-black inline-block" />
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="text-sm font-bold">{edu.degree} in {edu.field}</div>
                    <div className="text-xs text-gray-600">{edu.institution}</div>
                    <div className="text-xs text-gray-400">
                      {formatDateRange(edu.startDate, edu.endDate || "", edu.current)}
                    </div>
                    {edu.gpa && <div className="text-xs text-gray-400">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="w-8 h-0.5 bg-black inline-block" />
              Projects
            </h2>
            <div className="grid grid-cols-2 gap-5">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 p-4">
                  <h3 className="text-sm font-bold mb-1">{project.name}</h3>
                  {project.technologies.length > 0 && (
                    <div className="text-[10px] text-gray-400 mb-2">{project.technologies.join(" · ")}</div>
                  )}
                  {project.description && (
                    <p className="text-xs text-gray-600 leading-relaxed">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
