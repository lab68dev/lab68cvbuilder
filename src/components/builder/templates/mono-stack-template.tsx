import type { ResumeData } from "@/db/schema";
import { ensureHref } from "@/lib/url-helpers";

interface TemplateProps {
  data: ResumeData;
}

export function MonoStackTemplate({ data }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatDateRange = (start: string, end: string, current: boolean) => {
    return `${formatDate(start)} — ${current ? "Present" : formatDate(end)}`;
  };

  return (
    <div className="p-8 bg-white text-black font-mono text-xs leading-relaxed">
      {/* Header - left aligned, compact */}
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tighter mb-1 font-sans">
          {personalInfo.fullName || "YOUR NAME"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <a href={ensureHref(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="hover:underline">Portfolio</a>}
          {personalInfo.github && <a href={ensureHref(personalInfo.github)} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>}
          {personalInfo.linkedin && <a href={ensureHref(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 text-[11px] text-gray-700 font-sans leading-snug">
          {personalInfo.summary}
        </div>
      )}

      {/* 2-column grid */}
      <div className="grid grid-cols-[1fr_200px] gap-8">
        {/* LEFT - Experience & Projects */}
        <div>
          {experience.length > 0 && (
            <div className="mb-6">
              <div className="border-b border-black mb-3 pb-1 text-[10px] uppercase tracking-[0.2em]">
                Experience
              </div>
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-sm font-sans">{exp.position}</span>
                      <span className="text-[9px] text-gray-500 shrink-0 ml-2">
                        {formatDateRange(exp.startDate, exp.endDate || "", exp.current)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mb-1">
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </div>
                    {exp.description && (
                      <div className="text-[10px] font-sans mb-1 text-gray-700">{exp.description}</div>
                    )}
                    {exp.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.highlights.map((h, i) => (
                          <li key={i} className="text-[10px] font-sans text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-gray-400">
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <div className="border-b border-black mb-3 pb-1 text-[10px] uppercase tracking-[0.2em]">
                Projects
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="font-bold text-sm font-sans">{project.name}</div>
                    {project.technologies.length > 0 && (
                      <div className="text-[9px] text-gray-500 mb-1">
                        {project.technologies.join(" / ")}
                      </div>
                    )}
                    {project.description && (
                      <div className="text-[10px] font-sans text-gray-700 mb-1">{project.description}</div>
                    )}
                    {project.highlights.length > 0 && (
                      <ul className="space-y-0.5">
                        {project.highlights.map((h, i) => (
                          <li key={i} className="text-[10px] font-sans text-gray-700 pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-gray-400">
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - Skills & Education */}
        <div>
          {skills.length > 0 && (
            <div className="mb-6">
              <div className="border-b border-black mb-3 pb-1 text-[10px] uppercase tracking-[0.2em]">
                Skills
              </div>
              <div className="space-y-3">
                {skills.map((cat) => (
                  <div key={cat.id}>
                    <div className="font-bold text-[10px] uppercase tracking-wide mb-1">{cat.category}</div>
                    <div className="text-[10px] font-sans text-gray-700 leading-snug">
                      {cat.items.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <div className="border-b border-black mb-3 pb-1 text-[10px] uppercase tracking-[0.2em]">
                Education
              </div>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-[10px] font-sans">{edu.degree}</div>
                    <div className="text-[10px] font-sans text-gray-700">{edu.field}</div>
                    <div className="text-[9px] text-gray-500">{edu.institution}</div>
                    <div className="text-[9px] text-gray-500">
                      {formatDateRange(edu.startDate, edu.endDate || "", edu.current)}
                    </div>
                    {edu.gpa && <div className="text-[9px] text-gray-500">GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
