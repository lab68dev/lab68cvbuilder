"use server";

import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/db";
import { applications, coverLetters, jobs, resumes } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { aiRateLimiter, enforceRateLimit } from "@/lib/rate-limit";

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
  return new Groq({ apiKey });
}

export async function generateCoverLetter(input: {
  applicationId: string;
  tone?: "professional" | "confident" | "friendly";
}) {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, input.applicationId),
        eq(applications.userId, userId),
      ),
    );

  if (!application) {
    throw new Error("Application not found or unauthorized");
  }

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, application.jobId), eq(jobs.userId, userId)));

  if (!job) {
    throw new Error("Job not found");
  }

  const [resume] = application.resumeId
    ? await db
        .select()
        .from(resumes)
        .where(
          and(eq(resumes.id, application.resumeId), eq(resumes.userId, userId)),
        )
    : [null];

  const tone = input.tone ?? "professional";
  const groq = getGroqClient();

  const prompt = `Write a concise job-specific cover letter in a ${tone} tone.
Return plain text only.

Role: ${job.title}
Company: ${job.company}
Location: ${job.location ?? "N/A"}
Job Description: ${job.jdText.slice(0, 4000)}

Candidate Name: ${resume?.data.personalInfo.fullName || "Candidate"}
Candidate Summary: ${resume?.data.personalInfo.summary || "N/A"}
Top Skills: ${(resume?.data.skills.flatMap((s) => s.items).slice(0, 12) ?? []).join(", ")}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 700,
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("AI returned an empty cover letter");
  }

  const [saved] = await db
    .insert(coverLetters)
    .values({
      userId,
      applicationId: application.id,
      tone,
      content,
    })
    .returning();

  return saved;
}

export async function getCoverLettersByApplicationIds(
  applicationIds: string[],
) {
  const userId = await getAuthUserId();
  if (applicationIds.length === 0) return [];

  return db
    .select()
    .from(coverLetters)
    .where(
      and(
        eq(coverLetters.userId, userId),
        inArray(coverLetters.applicationId, applicationIds),
      ),
    )
    .orderBy(desc(coverLetters.updatedAt));
}

export async function updateCoverLetter(
  coverLetterId: string,
  content: string,
  tone?: "professional" | "confident" | "friendly",
) {
  const userId = await getAuthUserId();
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Cover letter content is required");
  }

  const [updated] = await db
    .update(coverLetters)
    .set({
      content: trimmed,
      ...(tone ? { tone } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(eq(coverLetters.id, coverLetterId), eq(coverLetters.userId, userId)),
    )
    .returning();

  if (!updated) {
    throw new Error("Cover letter not found or unauthorized");
  }

  return updated;
}

export async function deleteCoverLetter(coverLetterId: string) {
  const userId = await getAuthUserId();

  const [deleted] = await db
    .delete(coverLetters)
    .where(
      and(eq(coverLetters.id, coverLetterId), eq(coverLetters.userId, userId)),
    )
    .returning();

  if (!deleted) {
    throw new Error("Cover letter not found or unauthorized");
  }

  return deleted;
}
