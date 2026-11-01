export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getResume } from "@/actions/resume";
import { renderToStream } from "@react-pdf/renderer";
import { CreativePDF } from "@/components/pdf/creative-pdf";
import { ExecutivePDF } from "@/components/pdf/executive-pdf";
import { HarvardPDF } from "@/components/pdf/harvard-pdf";
import { AtsPDF } from "@/components/pdf/ats-pdf";
import { MinimalPDF } from "@/components/pdf/minimal-pdf";
import { ModernPDF } from "@/components/pdf/modern-pdf";
import type { TemplateId } from "@/lib/constants";
import { getFontById } from "@/lib/fonts";
import { registerPDFFont } from "@/lib/pdf-font-loader";
import React from "react";
import type { ResumeData } from "@/db/schema";
import {
  createRateLimiter,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { mapErrorToApiResponse, notFound } from "@/lib/api-error";

const limiter = createRateLimiter({
  name: "export-debug",
  limit: 3,
  windowSeconds: 60,
});

type PDFComponentType = React.ComponentType<{
  data: ResumeData;
  fontFamily?: string;
}>;

const PDF_TEMPLATES: Record<TemplateId, PDFComponentType> = {
  creative: CreativePDF,
  executive: ExecutivePDF,
  harvard: HarvardPDF,
  ats: AtsPDF,
  minimal: MinimalPDF,
  modern: ModernPDF,
};

export async function GET(request: NextRequest) {
  try {
    // Rate limit by client IP
    const ip = getClientIp(request.headers);
    const rl = await limiter.check(ip);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    const id = "f18ef1ef-109f-4089-b061-6ccf51135389";
    const resume = await getResume(id);
    if (!resume) {
      return notFound("Resume not found");
    }

    const fontConfig = getFontById(resume.fontFamily ?? "inter");
    const fontRegistered = await registerPDFFont(
      fontConfig.name,
      fontConfig.googleFamily,
    );

    const pdfFontFamily = fontRegistered ? fontConfig.name : "Helvetica";

    const Component =
      PDF_TEMPLATES[resume.templateId as TemplateId] || HarvardPDF;
    const PDFElement = React.createElement(Component, {
      data: resume.data,
      fontFamily: pdfFontFamily,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(PDFElement as any);

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error: unknown) {
    return mapErrorToApiResponse(error, "Debug failure");
  }
}
