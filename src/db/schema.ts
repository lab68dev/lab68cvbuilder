import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ============================================================
// AUTH.JS TABLES (required by @auth/drizzle-adapter)
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

// ============================================================
// APPLICATION TABLES
// ============================================================

/**
 * Resume data structure stored as JSONB.
 * This type defines the shape of the `data` column in the resumes table.
 */
export type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
    bulletSymbol?: string;
    avatarUrl?: string;
    shareEmail?: boolean;
    sharePhone?: boolean;
    shareLocation?: boolean;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    highlights: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
    coursework?: string[];
    highlights: string[];
  }>;
  skills: Array<{
    id: string;
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    url?: string;
    githubUrl?: string;
    websiteUrl?: string;
    technologies: string[];
    highlights: string[];
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    proficiency: "native" | "fluent" | "advanced" | "intermediate" | "beginner";
  }>;
  competitions: Array<{
    id: string;
    name: string;
    role?: string;
    date: string;
    location?: string;
    url?: string;
    description: string;
    highlights: string[];
  }>;
};

export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled Resume"),
  data: jsonb("data").$type<ResumeData>().notNull(),
  templateId: text("template_id").notNull().default("ats"),
  fontFamily: text("font_family").notNull().default("inter"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  sourceUrl: text("source_url"),
  jdText: text("jd_text").notNull(),
  extractedKeywords: jsonb("extracted_keywords")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const resumeVersions = pgTable("resume_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  templateId: text("template_id").notNull(),
  fontFamily: text("font_family").notNull(),
  data: jsonb("data").$type<ResumeData>().notNull(),
  source: text("source").notNull().default("autosave"),
  changeSummary: text("change_summary"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  resumeId: uuid("resume_id").references(() => resumes.id, {
    onDelete: "set null",
  }),
  resumeVersionId: uuid("resume_version_id").references(
    () => resumeVersions.id,
    { onDelete: "set null" },
  ),
  status: text("status").notNull().default("wishlist"),
  appliedAt: timestamp("applied_at", { mode: "date" }),
  nextStepAt: timestamp("next_step_at", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const coverLetters = pgTable("cover_letters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  tone: text("tone").notNull().default("professional"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventName: text("event_name").notNull(),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const mockInterviews = pgTable("mock_interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  questions: jsonb("questions")
    .$type<Array<{ question: string; expectedContext: string }>>()
    .notNull()
    .default([]),
  answers: jsonb("answers")
    .$type<
      Array<{
        questionId: number;
        answer: string;
        feedback: string;
        score: number;
      }>
    >()
    .notNull()
    .default([]),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const resumeViews = pgTable("resume_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  viewerIpId: text("viewer_ip_id").notNull(), // hashed ip or session identifier
  location: text("location"), // e.g. "San Francisco, CA"
  durationSeconds: integer("duration_seconds").notNull().default(0),
  clickedLinks: jsonb("clicked_links").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(), // "<feature>:<user id or ip>"
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobs: many(jobs),
  applications: many(applications),
  resumeVersions: many(resumeVersions),
  coverLetters: many(coverLetters),
  usageEvents: many(usageEvents),
  accounts: many(accounts),
  sessions: many(sessions),
  mockInterviews: many(mockInterviews),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  views: many(resumeViews),
}));

export const resumeViewsRelations = relations(resumeViews, ({ one }) => ({
  resume: one(resumes, {
    fields: [resumeViews.resumeId],
    references: [resumes.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const resumeVersionsRelations = relations(
  resumeVersions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [resumeVersions.userId],
      references: [users.id],
    }),
    resume: one(resumes, {
      fields: [resumeVersions.resumeId],
      references: [resumes.id],
    }),
    applications: many(applications),
  }),
);

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [applications.userId],
      references: [users.id],
    }),
    job: one(jobs, {
      fields: [applications.jobId],
      references: [jobs.id],
    }),
    resume: one(resumes, {
      fields: [applications.resumeId],
      references: [resumes.id],
    }),
    resumeVersion: one(resumeVersions, {
      fields: [applications.resumeVersionId],
      references: [resumeVersions.id],
    }),
    coverLetters: many(coverLetters),
  }),
);

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
  application: one(applications, {
    fields: [coverLetters.applicationId],
    references: [applications.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ============================================================
// INFERRED TYPES
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type NewResumeVersion = typeof resumeVersions.$inferInsert;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;
