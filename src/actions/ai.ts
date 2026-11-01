"use server";

import Groq from "groq-sdk";
import { auth } from "@/auth";
import { aiRateLimiter, enforceRateLimit } from "@/lib/rate-limit";
import { mergeAiResume } from "@/lib/ai-resume";
import type { ResumeData } from "@/db/schema";

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

// ── IMPROVE BULLET ──────────────────────────────────────────

/**
 * Rewrites a single achievement/highlight bullet point to be
 * more impactful, action-oriented, and ATS-friendly.
 */
export async function improveBullet(
  bullet: string,
  context: { position?: string; company?: string },
): Promise<{ result: string }> {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  if (!bullet.trim()) throw new Error("Bullet text cannot be empty");

  const groq = getGroqClient();

  const contextLine = [context.position, context.company]
    .filter(Boolean)
    .join(" at ");

  const prompt = `You are a professional resume writer. Rewrite the following resume bullet point to be more impactful, action-oriented, and ATS-friendly. Use strong action verbs, quantify results where possible, and keep it concise (1-2 lines max). Return ONLY the improved bullet text — no explanation, no quotes, no prefix.

${contextLine ? `Role context: ${contextLine}` : ""}

Bullet to improve:
${bullet}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 150,
    temperature: 0.7,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result) throw new Error("AI returned an empty response");

  return { result };
}

// ── GENERATE SUMMARY ────────────────────────────────────────

/**
 * Generates a professional summary based on the user's name,
 * job title, and skills list.
 */
export async function generateSummary(input: {
  fullName: string;
  jobTitle: string;
  skills: string[];
  yearsOfExperience?: string;
}): Promise<{ result: string }> {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  const groq = getGroqClient();

  const skillsLine =
    input.skills.length > 0
      ? input.skills.slice(0, 10).join(", ")
      : "not specified";

  const prompt = `You are a professional resume writer. Write a compelling 2-3 sentence professional summary for a resume. Make it specific, impactful, and ATS-friendly. Return ONLY the summary text — no explanation, no heading, no quotes.

Name: ${input.fullName || "the candidate"}
Job title: ${input.jobTitle || "professional"}
Key skills: ${skillsLine}
${input.yearsOfExperience ? `Experience: ${input.yearsOfExperience}` : ""}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result) throw new Error("AI returned an empty response");

  return { result };
}

// ── IMPROVE DESCRIPTION ─────────────────────────────────────

/**
 * Rewrites a paragraph-style role or project description to be
 * more compelling, professional, and ATS-friendly.
 */
export async function improveDescription(
  description: string,
  context: { title?: string; company?: string },
): Promise<{ result: string }> {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  if (!description.trim()) throw new Error("Description cannot be empty");

  const groq = getGroqClient();

  const contextLine = [context.title, context.company]
    .filter(Boolean)
    .join(" at ");

  const prompt = `You are a professional resume writer. Rewrite the following resume description to be more compelling, professional, and ATS-friendly. Keep it concise (2-4 sentences), use strong language, and focus on impact. Return ONLY the improved description — no explanation, no quotes, no prefix.

${contextLine ? `Role context: ${contextLine}` : ""}

Description to improve:
${description}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 250,
    temperature: 0.7,
  });

  const result = completion.choices[0]?.message?.content?.trim();
  if (!result) throw new Error("AI returned an empty response");

  return { result };
}

// ── CHECK RESUME GRAMMAR & SPELLING ────────────────────────

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```") || !trimmed.endsWith("```")) return trimmed;
  return trimmed
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();
}

/**
 * Performs grammar and spelling correction across the full resume data.
 * Keeps meaning/structure intact and only fixes writing quality.
 */
export async function checkResumeGrammarAndSpelling(
  resumeData: ResumeData,
): Promise<{ result: ResumeData }> {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  const groq = getGroqClient();

  const prompt = `You are a strict grammar and spelling proofreader for resumes.
Task:
- Fix only grammar, spelling, punctuation, and obvious wording errors.
- Keep original meaning, facts, dates, and structure unchanged.
- Do NOT invent new achievements, metrics, or job details.
- Preserve all IDs and array shapes exactly.
- Preserve language of each text (English/Vietnamese/etc) and only correct mistakes in that language.

Return ONLY valid JSON (no markdown, no explanations) matching this shape exactly:
{
  "personalInfo": {"fullName":"","email":"","phone":"","location":"","website":"","linkedin":"","github":"","summary":"","avatarUrl":""},
  "experience": [{"id":"","company":"","position":"","location":"","startDate":"","endDate":"","current":false,"description":"","highlights":[""]}],
  "education": [{"id":"","institution":"","degree":"","field":"","location":"","startDate":"","endDate":"","current":false,"gpa":"","coursework":[""],"highlights":[""]}],
  "skills": [{"id":"","category":"","items":[""]}],
  "projects": [{"id":"","name":"","description":"","url":"","githubUrl":"","websiteUrl":"","technologies":[""],"highlights":[""]}],
  "certifications": [{"id":"","name":"","issuer":"","date":"","url":""}],
  "languages": [{"id":"","language":"","proficiency":"native"}],
  "competitions": [{"id":"","name":"","role":"","date":"","location":"","url":"","description":"","highlights":[""]}]
}

Input JSON:
${JSON.stringify(resumeData)}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 5000,
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("AI returned an empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(content));
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  return { result: mergeAiResume(resumeData, parsed) };
}
