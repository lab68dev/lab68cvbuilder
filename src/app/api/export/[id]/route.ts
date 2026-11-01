export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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
import { type PdfLabels, getPdfLabels, getDateLocale } from "@/lib/pdf-labels";
import {
  createRateLimiter,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { mapErrorToApiResponse, notFound, unauthorized } from "@/lib/api-error";

const limiter = createRateLimiter({
  name: "export",
  limit: 10,
  windowSeconds: 60,
});

type PDFComponentType = React.ComponentType<{
  data: ResumeData;
  fontFamily?: string;
  labels?: PdfLabels;
  dateLocale?: string;
}>;

const PDF_TEMPLATES: Record<TemplateId, PDFComponentType> = {
  creative: CreativePDF,
  executive: ExecutivePDF,
  harvard: HarvardPDF,
  ats: AtsPDF,
  minimal: MinimalPDF,
  modern: ModernPDF,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Rate limit by client IP
    const ip = getClientIp(request.headers);
    const rl = await limiter.check(ip);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterSeconds);

    // Read PDF locale from query string
    const locale = request.nextUrl.searchParams.get("locale") || "en";

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    // Fetch resume
    const resume = await getResume(id);
    if (!resume) {
      return notFound("Resume not found");
    }

    // Register the selected font for PDF rendering
    const fontConfig = getFontById(resume.fontFamily ?? "inter");
    const fontRegistered = await registerPDFFont(
      fontConfig.name,
      fontConfig.googleFamily,
    );

    // Use the registered font name, or fall back to Helvetica, which needs no registration
    const pdfFontFamily = fontRegistered ? fontConfig.name : "Helvetica";

    // Render PDF based on template — lookup from map with fallback
    const Component =
      PDF_TEMPLATES[resume.templateId as TemplateId] || HarvardPDF;
    const PDFElement = React.createElement(Component, {
      data: resume.data,
      fontFamily: pdfFontFamily,
      labels: getPdfLabels(locale),
      dateLocale: getDateLocale(locale),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(PDFElement as any);

    // Set filename based on resume title and template
    const filename = `${resume.title.replace(/[^a-z0-9]/gi, "_")}_${resume.templateId}.pdf`;

    // Return PDF as downloadable file
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error(`[export] Generic PDF generation error:`, error);
    return mapErrorToApiResponse(error, "Failed to generate PDF");
  }
}
