"use server";

import { db } from "@/db";
import { resumes, resumeVersions } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import type { ResumeData } from "@/db/schema";
import { pickResumeUpdate } from "@/lib/resume-update";
import { sanitizeResumeData } from "@/lib/sanitize-resume";
import { revalidatePath } from "next/cache";

/**
 * Helper: Get the authenticated user ID or throw.
 * Enforces RLS at the application layer.
 */
async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// ── CREATE ──────────────────────────────────────────────────

export async function createResume(
  title: string,
  templateId: string = "harvard",
) {
  const userId = await getAuthUserId();

  const defaultData: ResumeData = {
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    competitions: [],
    languages: [],
  };

  const [resume] = await db
    .insert(resumes)
    .values({
      userId,
      title,
      templateId,
      data: defaultData,
    })
    .returning();

  revalidatePath("/dashboard");
  return resume;
}

// ── READ (LIST) ─────────────────────────────────────────────

export async function getUserResumes() {
  const userId = await getAuthUserId();
  return db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(resumes.updatedAt);
}

// ── READ (SINGLE) ───────────────────────────────────────────

export async function getResume(resumeId: string) {
  const userId = await getAuthUserId();
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));
  if (!resume) return null;
  return resume;
}

export async function getPublicResume(resumeId: string) {
  const [resume] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.isPublic, true)));

  return resume ?? null;
}

export async function updateResumeShareSettings(
  resumeId: string,
  input: {
    isPublic: boolean;
    shareEmail: boolean;
    sharePhone: boolean;
    shareLocation: boolean;
  },
) {
  const userId = await getAuthUserId();

  const [existing] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

  if (!existing) {
    throw new Error("Resume not found or unauthorized");
  }

  const [updated] = await db
    .update(resumes)
    .set({
      isPublic: input.isPublic,
      data: {
        ...existing.data,
        personalInfo: {
          ...existing.data.personalInfo,
          shareEmail: input.shareEmail,
          sharePhone: input.sharePhone,
          shareLocation: input.shareLocation,
        },
      },
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("Resume not found or unauthorized");
  }

  return updated;
}

// ── UPDATE ──────────────────────────────────────────────────

export async function updateResume(resumeId: string, input: unknown) {
  const userId = await getAuthUserId();
  const update = pickResumeUpdate(input);

  const [existing] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

  if (!existing) {
    throw new Error("Resume not found or unauthorized");
  }

  const hasContentChange =
    update.data !== undefined &&
    JSON.stringify(existing.data) !== JSON.stringify(update.data);

  if (hasContentChange) {
    try {
      const [lastVersion] = await db
        .select({ createdAt: resumeVersions.createdAt })
        .from(resumeVersions)
        .where(
          and(
            eq(resumeVersions.resumeId, resumeId),
            eq(resumeVersions.userId, userId),
          ),
        )
        .orderBy(desc(resumeVersions.createdAt))
        .limit(1);

      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      const canSnapshot =
        !lastVersion ||
        now - new Date(lastVersion.createdAt).getTime() >= fifteenMinutes;

      if (canSnapshot) {
        await db.insert(resumeVersions).values({
          userId,
          resumeId,
          title: existing.title,
          templateId: existing.templateId,
          fontFamily: existing.fontFamily,
          data: existing.data,
          source: "autosave",
          changeSummary: "Automatic pre-save snapshot",
        });
      }
    } catch (error) {
      console.warn(
        "Skipping resume version autosnapshot due to DB error",
        error,
      );
    }
  }

  const [updated] = await db
    .update(resumes)
    .set({
      ...update,
      ...(update.data ? { data: sanitizeResumeData(update.data) } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("Resume not found or unauthorized");
  }

  return updated;
}

// ── DELETE ──────────────────────────────────────────────────

export async function deleteResume(resumeId: string) {
  const userId = await getAuthUserId();

  const [deleted] = await db
    .delete(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .returning();

  if (!deleted) {
    throw new Error("Resume not found or unauthorized");
  }

  revalidatePath("/dashboard");
  return deleted;
}

// ── DUPLICATE ───────────────────────────────────────────────

export async function duplicateResume(resumeId: string) {
  const userId = await getAuthUserId();

  const [source] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

  if (!source) {
    throw new Error("Resume not found or unauthorized");
  }

  const [copy] = await db
    .insert(resumes)
    .values({
      userId,
      title: `${source.title} (Copy)`,
      templateId: source.templateId,
      fontFamily: source.fontFamily,
      data: source.data,
    })
    .returning();

  revalidatePath("/dashboard");
  return copy;
}

// ── CREATE FROM GUEST DATA ──────────────────────────────────

export async function createResumeFromGuestData(guestData: {
  title: string;
  templateId: string;
  fontFamily: string;
  data: ResumeData;
}) {
  const userId = await getAuthUserId();

  const sanitized = sanitizeResumeData(guestData.data);

  const [resume] = await db
    .insert(resumes)
    .values({
      userId,
      title: guestData.title || "My Resume",
      templateId: guestData.templateId || "harvard",
      fontFamily: guestData.fontFamily || "inter",
      data: sanitized,
    })
    .returning();

  revalidatePath("/dashboard");
  return resume;
}
