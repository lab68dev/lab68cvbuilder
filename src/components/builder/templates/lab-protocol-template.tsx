import type { ResumeData } from "@/db/schema";
import { ensureHref } from "@/lib/url-helpers";

interface TemplateProps {
  data: ResumeData;
}

export function LabProtocolTemplate({ data }: TemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const formatDate = (dateStr: string, current: boolean) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return current ? `${formatted} - Present` : formatted;
  };

  const formatDateRange = (start: string, end: string, current: boolean) => {
    const startFormatted = formatDate(start, false);
    const endFormatted = current ? "Present" : formatDate(end, false);
    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="flex h-full text-black bg-white">
      {/* Sidebar */}
      <div className="w-[2.5in] bg-black text-white p-8 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tighter leading-tight break-words mb-1">
            {personalInfo.fullName || "YOUR NAME"}
          </h1>
          <div className="w-12 border-t border-white mt-2" />
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h2 className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">
            CONTACT
          </h2>
          <div className="space-y-2 text-xs">
            {personalInfo.email && (
              <div className="break-words">{personalInfo.email}</div>
            )}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
          </div>
        </div>

        {/* Links */}
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
          <div className="mb-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">
              LINKS
            </h2>
            <div className="space-y-2 text-xs break-all">
              {personalInfo.website && (
                <a href={ensureHref(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="block break-all hover:underline">
                  <span className="opacity-60">WEB//</span> Portfolio
                </a>
              )}
              {personalInfo.linkedin && (
                <a href={ensureHref(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="block break-all hover:underline">
                  <span className="opacity-60">IN//</span> LinkedIn
                </a>
              )}
              {personalInfo.github && (
                <a href={ensureHref(personalInfo.github)} target="_blank" rel="noopener noreferrer" className="block break-all hover:underline">
                  <span className="opacity-60">GH//</span> GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">
              TECHNICAL
            </h2>
            <div className="space-y-3">
              {skills.map((category) => (
                <div key={category.id}>
                  <div className="font-bold text-[11px] mb-1">{category.category}</div>
                  <div className="text-[10px] leading-relaxed opacity-90">
                    {category.items.join(" • ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest mb-3 opacity-60">
              EDUCATION
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold leading-tight">{edu.degree}</div>
                  <div className="leading-tight">{edu.field}</div>
                  <div className="opacity-70 text-[10px] mt-1">{edu.institution}</div>
                  <div className="opacity-60 text-[10px]">
                    {formatDateRange(edu.startDate, edu.endDate || "", edu.current)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest border-b border-black pb-1 mb-3">
              PROFILE
            </h2>
            <p className="text-sm leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="font-mono text-[10px] uppercase tracking-widest border-b border-black pb-1 mb-4">
              EXPERIENCE
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-bold text-base leading-tight">{exp.position}</h3>
                      <div className="text-sm">{exp.company}</div>
                    </div>
                    <div className="font-mono text-[10px] opacity-60 ml-4">
                      {formatDateRange(exp.startDate, exp.endDate || "", exp.current)}
                    </div>
                  </div>
                  {exp.location && (
                    <div className="text-xs opacity-60 mb-2">{exp.location}</div>
                  )}
                  {exp.description && (
                    <p className="text-xs leading-relaxed mb-2">{exp.description}</p>
                  )}
                  {exp.highlights.length > 0 && (
                    <ul className="space-y-1 text-xs">
                      {exp.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex">
                          <span className="mr-2">▪</span>
                          <span className="flex-1">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-widest border-b border-black pb-1 mb-4">
              PROJECTS
            </h2>
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base leading-tight">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-xs leading-relaxed mb-2">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="text-[10px] font-mono opacity-60 mb-2">
                      {project.technologies.join(" • ")}
                    </div>
                  )}
                  {project.highlights.length > 0 && (
                    <ul className="space-y-1 text-xs">
                      {project.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex">
                          <span className="mr-2">▪</span>
                          <span className="flex-1">{highlight}</span>
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
    </div>
  );
}
