"use server";

import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/db";
import { jobs, resumes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { aiRateLimiter, enforceRateLimit } from "@/lib/rate-limit";
import { mergeAiResume } from "@/lib/ai-resume";

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

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```") || !trimmed.endsWith("```")) return trimmed;
  return trimmed
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();
}

export async function tailorResumeForJob(input: {
  resumeId: string;
  jobId: string;
}) {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, input.resumeId), eq(resumes.userId, userId)));
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, input.jobId), eq(jobs.userId, userId)));

  if (!resume || !job) {
    throw new Error("Resume or job not found");
  }

  const groq = getGroqClient();
  const prompt = `You are a resume optimizer. Tailor this resume JSON for the job description.
Rules:
- Keep facts truthful. Do not fabricate new companies, dates, or metrics.
- Improve wording and reorder existing points for relevance.
- Emphasize relevant skills and highlights.
- Preserve JSON structure and IDs exactly.
- Return JSON only.

Job title: ${job.title}
Company: ${job.company}
Keywords: ${job.extractedKeywords.join(", ")}
Job description: ${job.jdText.slice(0, 5000)}

Resume JSON:
${JSON.stringify(resume.data)}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 5000,
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("AI returned empty tailored content");

  let tailored: unknown;
  try {
    tailored = JSON.parse(stripCodeFence(content));
  } catch {
    throw new Error("AI returned invalid JSON for tailored resume");
  }

  const [copy] = await db
    .insert(resumes)
    .values({
      userId,
      title: `${resume.title} • ${job.company}`,
      templateId: resume.templateId,
      fontFamily: resume.fontFamily,
      data: mergeAiResume(resume.data, tailored),
    })
    .returning();

  return copy;
}
