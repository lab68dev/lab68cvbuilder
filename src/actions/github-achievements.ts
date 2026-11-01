"use server";

import Groq from "groq-sdk";
import { auth } from "@/auth";
import { createRateLimiter, enforceRateLimit } from "@/lib/rate-limit";
import type { ResumeData } from "@/db/schema";

// 5 AI calls per hour per user for github sync
const aiRateLimiter = createRateLimiter({
  name: "github-ai",
  limit: 5,
  windowSeconds: 3600,
});

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

/**
 * Fetches top repositories for a GitHub user and uses AI to generate
 * STAR-method professional bullet points and structured project data.
 */
export async function generateGitHubAchievements(
  username: string,
): Promise<{ result: ResumeData["projects"] }> {
  const userId = await getAuthUserId();
  await enforceRateLimit(aiRateLimiter, userId);

  if (!username.trim()) throw new Error("GitHub username cannot be empty.");

  // 1. Fetch from GitHub API
  // Using public endpoint, no token to avoid complexity, though rate limits apply
  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Lab68-CV-Builder",
      },
    },
  );

  if (!reposResponse.ok) {
    if (reposResponse.status === 404) {
      throw new Error("GitHub user not found.");
    }
    throw new Error(`GitHub API error: ${reposResponse.statusText}`);
  }

  const allRepos = await reposResponse.json();

  if (!Array.isArray(allRepos) || allRepos.length === 0) {
    throw new Error("No public repositories found for this user.");
  }

  // Filter out forks and purely empty repos
  const sourceRepos = allRepos.filter((r) => !r.fork);

  // Sort by stars descending, then get top 5
  const topRepos = sourceRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  if (topRepos.length === 0) {
    throw new Error("No non-fork repositories found to analyze.");
  }

  // 2. Prepare context for AI
  // We'll give it the repo name, description, primary language, topics, stars, and URL
  const repoDataText = topRepos.map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    topics: r.topics,
    stars: r.stargazers_count,
    url: r.html_url,
    homepage: r.homepage,
  }));

  const groq = getGroqClient();

  const prompt = `You are an expert technical recruiter and resume writer.
I will provide you with data from a candidate's top GitHub repositories.
Your task is to convert these repositories into professional resume projects.
For each project, generate:
- A concise, impactful description
- 2 to 3 accomplishments/highlights written in the STAR method (Situation, Task, Action, Result). Make them sound highly impressive and action-oriented.
- An array of technologies used (combine the primary language and topics).

Here is the raw GitHub data:
${JSON.stringify(repoDataText, null, 2)}

Ensure you return ONLY a valid JSON array matching exactly this TypeScript signature:
Array<{
  name: string;
  description: string; // concise 1-2 sentence description
  url: string; // The homepage url if available, or just leave empty string
  githubUrl: string; // The github html_url
  websiteUrl: string; // same as URL or homepage
  technologies: string[];
  highlights: string[]; // 2-3 impressive STAR method bullet points
}>

No markdown formatting, no explanations, no text outside the JSON array.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content?.trim() || "[]";
  let parsedContent;

  try {
    parsedContent = JSON.parse(stripCodeFence(content));
    if (!Array.isArray(parsedContent)) {
      throw new Error("Invalid format from AI");
    }
  } catch (error) {
    console.error("Parse error:", error, content);
    throw new Error("Failed to parse AI generated projects.");
  }

  // Ensure every project has a unique ID
  const newProjects = parsedContent.map((proj) => ({
    id: crypto.randomUUID(),
    name: proj.name || "",
    description: proj.description || "",
    url: proj.url || proj.websiteUrl || proj.githubUrl || "",
    githubUrl: proj.githubUrl || "",
    websiteUrl: proj.websiteUrl || proj.url || "",
    technologies: proj.technologies || [],
    highlights: proj.highlights || [],
  }));

  return { result: newProjects };
}
