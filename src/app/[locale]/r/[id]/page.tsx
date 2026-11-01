import { notFound } from "next/navigation";
import { getPublicResume } from "@/actions/resume";
import { getPublicResumeData } from "@/lib/public-resume";
import { HarvardTemplate } from "@/components/builder/templates/harvard-template";
import { CreativeTemplate } from "@/components/builder/templates/creative-template";
import { AtsTemplate } from "@/components/builder/templates/ats-template";
import { ExecutiveTemplate } from "@/components/builder/templates/executive-template";
import { MinimalTemplate } from "@/components/builder/templates/minimal-template";
import { ModernTemplate } from "@/components/builder/templates/modern-template";
import { getPdfLabels, getDateLocale } from "@/lib/pdf-labels";
import { PublicActionBar } from "@/components/builder/public-action-bar";
import { ResumeAnalyticsTracker } from "@/components/builder/resume-analytics-tracker";

interface PublicResumePageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const TEMPLATE_MAP = {
  harvard: HarvardTemplate,
  creative: CreativeTemplate,
  ats: AtsTemplate,
  executive: ExecutiveTemplate,
  minimal: MinimalTemplate,
  modern: ModernTemplate,
} as const;

export default async function PublicResumePage({
  params,
}: PublicResumePageProps) {
  const { locale, id } = await params;
  const resume = await getPublicResume(id);

  if (!resume) {
    notFound();
  }

  const Template =
    TEMPLATE_MAP[resume.templateId as keyof typeof TEMPLATE_MAP] ??
    HarvardTemplate;

  return (
    <div className="cv-sheet min-h-screen bg-gray-100 print:bg-white pt-14 print:pt-0">
      <ResumeAnalyticsTracker resumeId={resume.id} />
      <PublicActionBar resumeTitle={resume.title} />
      <div className="py-8 px-4 print:py-0 print:px-0">
        <div className="mx-auto max-w-[900px] bg-white shadow-2xl print:shadow-none">
          <Template
            data={getPublicResumeData(resume.data)}
            labels={getPdfLabels(locale)}
            dateLocale={getDateLocale(locale)}
          />
        </div>
      </div>
    </div>
  );
}
