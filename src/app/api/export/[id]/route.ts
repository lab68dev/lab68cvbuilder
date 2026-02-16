import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getResume } from "@/actions/resume";
import { renderToStream } from "@react-pdf/renderer";
import { LabProtocolPDF } from "@/components/pdf/lab-protocol-pdf";
import { ExecutivePDF } from "@/components/pdf/executive-pdf";
import { MonoStackPDF } from "@/components/pdf/mono-stack-pdf";
import { CleanSlatePDF } from "@/components/pdf/clean-slate-pdf";
import { BoldImpactPDF } from "@/components/pdf/bold-impact-pdf";
import { CompactProPDF } from "@/components/pdf/compact-pro-pdf";
import type { TemplateId } from "@/lib/constants";
import { getFontById } from "@/lib/fonts";
import { registerPDFFont } from "@/lib/pdf-font-loader";
import React from "react";
import type { ResumeData } from "@/db/schema";

type PDFComponentType = React.ComponentType<{ data: ResumeData; fontFamily?: string }>;

const PDF_TEMPLATES: Record<TemplateId, PDFComponentType> = {
  "lab-protocol": LabProtocolPDF,
  "the-executive": ExecutivePDF,
  "mono-stack": MonoStackPDF,
  "clean-slate": CleanSlatePDF,
  "bold-impact": BoldImpactPDF,
  "compact-pro": CompactProPDF,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch resume
    const resume = await getResume(id);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Register the selected font for PDF rendering
    const fontConfig = getFontById(resume.fontFamily ?? "inter");
    const fontRegistered = await registerPDFFont(
      fontConfig.name,
      fontConfig.googleFamily
    );

    // Use the registered font name, or fall back to Archivo (always registered by PDF templates)
    const pdfFontFamily = fontRegistered ? fontConfig.name : "Archivo";

    // Render PDF based on template — lookup from map with fallback
    const Component = PDF_TEMPLATES[resume.templateId as TemplateId] || LabProtocolPDF;
    const PDFElement = React.createElement(Component, {
      data: resume.data,
      fontFamily: pdfFontFamily,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(PDFElement as any);

    // Set filename based on resume title and template
    const filename = `${resume.title.replace(/[^a-z0-9]/gi, "_")}_${resume.templateId}.pdf`;

    // Return PDF as downloadable file
    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
