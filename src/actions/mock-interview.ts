"use server";

import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/db";
import { applications, jobs, resumes, mockInterviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createRateLimiter, enforceRateLimit } from "@/lib/rate-limit";

// One interview is 1 generate call plus 5 answer reviews, so this allows 5 per hour.
const interviewRateLimiter = createRateLimiter({
  name: "mock-interview",
  limit: 30,
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
 * Generate mock interview questions based on the candidate's resume and target job description.
 */
export async function generateMockInterviewQuestions(applicationId: string) {
  const userId = await getAuthUserId();
  await enforceRateLimit(interviewRateLimiter, userId);

  // 1. Fetch application, job, and resume data
  const appData = await db
    .select({
      jobId: applications.jobId,
      resumeId: applications.resumeId,
    })
    .from(applications)
    .where(
      and(eq(applications.id, applicationId), eq(applications.userId, userId)),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!appData || !appData.resumeId) {
    throw new Error("Application not found or no resume attached.");
  }

  const job = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, appData.jobId), eq(jobs.userId, userId)))
    .limit(1)
    .then((res) => res[0]);

  const resume = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, appData.resumeId!), eq(resumes.userId, userId)))
    .limit(1)
    .then((res) => res[0]);

  if (!job || !resume) {
    throw new Error("Job or Resume not found.");
  }

  // 2. Build AI Prompt
  const groq = getGroqClient();
  const prompt = `You are an expert technical recruiter and hiring manager. 
Your task is to generate 5 challenging but fair interview questions tailored to the candidate's resume and the job description.
Some questions should focus on the candidate's listed experience, and some should focus on the specific skills required in the job description to see if there are any gaps.

Job Title: ${job.title}
Company: ${job.company}
Job Description:
${job.jdText.substring(0, 2000)}

Candidate's Resume Data:
${JSON.stringify(resume.data).substring(0, 3000)}

Return ONLY a valid JSON array of exactly 5 objects. Each object must have these exactly properties:
"question" (string): The interview question.
"expectedContext" (string): What an ideal answer should cover (bullet points or a short paragraph).

No extra text, no markdown. Just the JSON array.`;

  // 3. Call AI
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content?.trim() || "[]";
  let questions: Array<{ question: string; expectedContext: string }>;

  try {
    questions = JSON.parse(stripCodeFence(content));
    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("Invalid format from AI");
    }
  } catch (error) {
    console.error("Parse error:", error, content);
    throw new Error("Failed to parse AI generated questions.");
  }

  // 4. Save to mockInterviews table
  const newInterview = await db
    .insert(mockInterviews)
    .values({
      userId,
      applicationId,
      questions,
      answers: [],
      status: "in_progress",
    })
    .returning({ id: mockInterviews.id })
    .then((res) => res[0]);

  return { interviewId: newInterview.id, questions };
}

/**
 * Evaluate a single answer and save it to the mock interview state.
 */
export async function evaluateMockInterviewAnswer(
  interviewId: string,
  questionIndex: number,
  answerText: string,
) {
  const userId = await getAuthUserId();
  await enforceRateLimit(interviewRateLimiter, userId);

  // 1. Fetch the mock interview
  const interview = await db
    .select()
    .from(mockInterviews)
    .where(
      and(
        eq(mockInterviews.id, interviewId),
        eq(mockInterviews.userId, userId),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!interview) {
    throw new Error("Interview not found.");
  }

  const questionObj = interview.questions[questionIndex];
  if (!questionObj) {
    throw new Error("Invalid question index.");
  }

  // 2. Evaluate answer with AI
  const groq = getGroqClient();
  const prompt = `You are evaluating a candidate's answer to an interview question.
Question: ${questionObj.question}
Expected Context / Ideal Answer: ${questionObj.expectedContext}

Candidate's Answer:
"${answerText}"

Provide critical but constructive feedback on the candidate's answer. Give a score from 1 to 10 based on how well they addressed the expected context and clarity of their answer.

Return ONLY valid JSON (no markdown) with this exact format:
{
  "feedback": "string",
  "score": number
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  const content = completion.choices[0]?.message?.content?.trim() || "{}";
  let evalResult: { feedback: string; score: number };

  try {
    evalResult = JSON.parse(stripCodeFence(content));
    if (
      typeof evalResult.feedback !== "string" ||
      typeof evalResult.score !== "number"
    ) {
      throw new Error();
    }
  } catch (error) {
    console.error("Parse error:", error, content);
    throw new Error("Failed to parse AI evaluation.");
  }

  // 3. Update the mock interview
  const currentAnswers = [...interview.answers];
  const existingAnswerIndex = currentAnswers.findIndex(
    (a) => a.questionId === questionIndex,
  );

  const newAnswerObj = {
    questionId: questionIndex,
    answer: answerText,
    feedback: evalResult.feedback,
    score: evalResult.score,
  };

  if (existingAnswerIndex !== -1) {
    currentAnswers[existingAnswerIndex] = newAnswerObj;
  } else {
    currentAnswers.push(newAnswerObj);
  }

  // Check if all questions are answered
  const status =
    currentAnswers.length === interview.questions.length
      ? "completed"
      : "in_progress";

  await db
    .update(mockInterviews)
    .set({
      answers: currentAnswers,
      status,
      updatedAt: new Date(),
    })
    .where(eq(mockInterviews.id, interviewId));

  return newAnswerObj;
}

export async function getMockInterview(interviewId: string) {
  const userId = await getAuthUserId();
  const interview = await db
    .select()
    .from(mockInterviews)
    .where(
      and(
        eq(mockInterviews.id, interviewId),
        eq(mockInterviews.userId, userId),
      ),
    )
    .limit(1)
    .then((res) => res[0]);

  if (!interview) throw new Error("Not found");
  return interview;
}
