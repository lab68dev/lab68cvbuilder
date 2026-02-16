#!/usr/bin/env node

/**
 * Resend Email Management CLI
 *
 * Usage:
 *   npx tsx scripts/resend-emails.ts <command> [options]
 *
 * Commands:
 *   send                 Send an email (interactive prompts via flags)
 *   batch                Send batch emails from a JSON file
 *   list                 List recent emails
 *   get <id>             Retrieve email details
 *   cancel <id>          Cancel a scheduled email
 *   update <id>          Reschedule an email
 *   attachments <id>     List attachments for an email
 *   attachment <email-id> <attachment-id>  Retrieve a specific attachment
 *
 * Send flags:
 *   --to <email>         Recipient email (required)
 *   --subject <text>     Email subject (required)
 *   --html <html>        HTML body
 *   --text <text>        Plain text body
 *   --from <email>       Sender (default: EMAIL_FROM from .env.local)
 *   --reply-to <email>   Reply-to address
 *   --schedule <iso>     Schedule for later (ISO 8601 datetime)
 *
 * Update flags:
 *   --schedule <iso>     New scheduled time (ISO 8601 datetime)
 *
 * Environment:
 *   AUTH_RESEND_KEY       Resend API key (loaded from .env.local)
 *   EMAIL_FROM            Default sender address
 */

import { config } from "dotenv";
import { Resend } from "resend";
import { readFileSync } from "fs";

config({ path: ".env.local" });

const API_KEY = process.env.AUTH_RESEND_KEY;

if (!API_KEY) {
  console.error(
    "ERROR: AUTH_RESEND_KEY not found.\n" +
      "Make sure .env.local exists and contains AUTH_RESEND_KEY."
  );
  process.exit(1);
}

const resend = new Resend(API_KEY);
const DEFAULT_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

const [, , command, ...args] = process.argv;

// ── Flag Parsing ───────────────────────────────────────────
function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      flags[key] = value;
    }
  }
  return flags;
}

// ── Usage ──────────────────────────────────────────────────
function usage(): void {
  console.log(`
Resend Email Management CLI

Usage:
  npx tsx scripts/resend-emails.ts <command> [options]

Commands:
  send                     Send an email
  batch <file.json>        Send batch emails from a JSON file
  list                     List recent emails
  get <id>                 Retrieve email details
  cancel <id>              Cancel a scheduled email
  update <id> [flags]      Reschedule an email
  attachments <id>         List attachments for an email
  attachment <eid> <aid>   Retrieve a specific attachment

Send flags:
  --to <email>             Recipient (required)
  --subject <text>         Subject line (required)
  --html <html>            HTML body
  --text <text>            Plain text body
  --from <email>           Sender (default: EMAIL_FROM)
  --reply-to <email>       Reply-to address
  --schedule <iso>         Schedule send time (ISO 8601)

Update flags:
  --schedule <iso>         New scheduled time (ISO 8601)

Examples:
  npx tsx scripts/resend-emails.ts send --to user@test.com --subject "Test" --html "<p>Hello</p>"
  npx tsx scripts/resend-emails.ts list
  npx tsx scripts/resend-emails.ts get 5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d
  npx tsx scripts/resend-emails.ts cancel 5e4d5e4d-...
  npx tsx scripts/resend-emails.ts batch emails.json
`);
}

// ── Commands ───────────────────────────────────────────────

async function sendEmail(flags: Record<string, string>): Promise<void> {
  const to = flags["to"];
  const subject = flags["subject"];

  if (!to || !subject) {
    console.error("Required flags: --to <email> --subject <text>");
    console.error("At least one of --html or --text must be provided.");
    process.exit(1);
  }

  if (!flags["html"] && !flags["text"]) {
    console.error("Provide at least one of --html or --text for the email body.");
    process.exit(1);
  }

  const payload: Record<string, unknown> = {
    from: flags["from"] ?? DEFAULT_FROM,
    to: [to],
    subject,
  };

  if (flags["html"]) payload.html = flags["html"];
  if (flags["text"]) payload.text = flags["text"];
  if (flags["reply-to"]) payload.replyTo = flags["reply-to"];
  if (flags["schedule"]) payload.scheduledAt = flags["schedule"];

  console.log(`Sending email to ${to} ...`);
  const { data, error } = await resend.emails.send(payload as Parameters<typeof resend.emails.send>[0]);

  if (error) {
    console.error("Failed to send email:", error);
    process.exit(1);
  }

  console.log("\nEmail sent successfully.");
  console.log("  ID:", data!.id);
}

async function sendBatch(filePath: string): Promise<void> {
  if (!filePath) {
    console.error("Usage: batch <file.json>");
    console.error("\nJSON file should contain an array of email objects with: from, to, subject, html/text");
    process.exit(1);
  }

  let emails: Array<Record<string, unknown>>;
  try {
    const raw = readFileSync(filePath, "utf-8");
    emails = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read or parse ${filePath}:`, err);
    process.exit(1);
  }

  if (!Array.isArray(emails) || emails.length === 0) {
    console.error("JSON file must contain a non-empty array of email objects.");
    process.exit(1);
  }

  // Apply default "from" if missing
  for (const email of emails) {
    if (!email.from) email.from = DEFAULT_FROM;
  }

  console.log(`Sending batch of ${emails.length} email(s) ...`);
  const { data, error } = await resend.batch.send(
    emails as Parameters<typeof resend.batch.send>[0]
  );

  if (error) {
    console.error("Failed to send batch:", error);
    process.exit(1);
  }

  console.log("\nBatch sent successfully.");
  console.log(`  ${data!.data.length} email(s) queued.`);
  for (const item of data!.data) {
    console.log(`  - ${item.id}`);
  }
}

async function listEmails(): Promise<void> {
  console.log("Fetching emails ...\n");
  const { data, error } = await resend.emails.list();

  if (error) {
    console.error("Failed to list emails:", error);
    process.exit(1);
  }

  if (!data?.data || data.data.length === 0) {
    console.log("No emails found.");
    return;
  }

  console.log("ID                                     Subject                              Created");
  console.log("─".repeat(95));
  for (const e of data.data) {
    const subject = (e.subject ?? "").substring(0, 35).padEnd(36);
    const created = e.created_at ?? "";
    console.log(`${e.id}   ${subject} ${created}`);
  }
  console.log(`\n${data.data.length} email(s) total.`);
}

async function getEmail(id: string): Promise<void> {
  console.log(`Fetching email ${id} ...\n`);
  const { data, error } = await resend.emails.get(id);

  if (error) {
    console.error("Failed to get email:", error);
    process.exit(1);
  }

  console.log("Email Details:");
  console.log("  ID:         ", data!.id);
  console.log("  From:       ", data!.from);
  console.log("  To:         ", Array.isArray(data!.to) ? data!.to.join(", ") : data!.to);
  console.log("  Subject:    ", data!.subject);
  console.log("  Created:    ", data!.created_at);
  console.log("  Last Event: ", data!.last_event);

  if (data!.reply_to) {
    console.log("  Reply-To:   ", Array.isArray(data!.reply_to) ? data!.reply_to.join(", ") : data!.reply_to);
  }
  if (data!.bcc) console.log("  BCC:        ", data!.bcc);
  if (data!.cc) console.log("  CC:         ", data!.cc);

  if (data!.html) {
    console.log("\n  HTML Body (first 200 chars):");
    console.log("  ", String(data!.html).substring(0, 200));
  }
  if (data!.text) {
    console.log("\n  Text Body (first 200 chars):");
    console.log("  ", String(data!.text).substring(0, 200));
  }
}

async function cancelEmail(id: string): Promise<void> {
  console.log(`Cancelling email ${id} ...`);
  const { data, error } = await resend.emails.cancel(id);

  if (error) {
    console.error("Failed to cancel email:", error);
    process.exit(1);
  }

  console.log("\nEmail cancelled successfully.");
  console.log("  ID:    ", data!.id);
  console.log("  Object:", data!.object);
}

async function updateEmail(id: string, flags: Record<string, string>): Promise<void> {
  const scheduledAt = flags["schedule"];

  if (!scheduledAt) {
    console.error("Usage: update <id> --schedule <ISO-8601-datetime>");
    console.error("Example: update abc123 --schedule 2026-03-01T10:00:00Z");
    process.exit(1);
  }

  console.log(`Updating email ${id} ...`);
  const { data, error } = await resend.emails.update({
    id,
    scheduledAt,
  });

  if (error) {
    console.error("Failed to update email:", error);
    process.exit(1);
  }

  console.log("\nEmail updated successfully.");
  console.log("  ID:    ", data!.id);
  console.log("  Object:", data!.object);
}

async function listAttachments(emailId: string): Promise<void> {
  console.log(`Fetching attachments for email ${emailId} ...\n`);
  const { data, error } = await resend.emails.attachments.list({ emailId });

  if (error) {
    console.error("Failed to list attachments:", error);
    process.exit(1);
  }

  if (!data?.data || data.data.length === 0) {
    console.log("No attachments found for this email.");
    return;
  }

  console.log("ID                                     Filename                  Size       Content-Type");
  console.log("─".repeat(100));
  for (const a of data.data) {
    const filename = (a.filename ?? "").padEnd(25);
    const size = String(a.size ?? "").padEnd(10);
    console.log(`${a.id}   ${filename} ${size} ${a.content_type ?? ""}`);
  }
  console.log(`\n${data.data.length} attachment(s) total.`);
}

async function getAttachment(emailId: string, attachmentId: string): Promise<void> {
  console.log(`Fetching attachment ${attachmentId} from email ${emailId} ...\n`);
  const { data, error } = await resend.emails.attachments.get({
    id: attachmentId,
    emailId,
  });

  if (error) {
    console.error("Failed to get attachment:", error);
    process.exit(1);
  }

  console.log("Attachment Details:");
  console.log("  ID:           ", data!.id);
  console.log("  Filename:     ", data!.filename);
  console.log("  Size:         ", data!.size);
  console.log("  Content-Type: ", data!.content_type);
  console.log("  Content (base64, first 100 chars):");
  console.log("  ", String(data!.content).substring(0, 100), "...");
}

// ── Main ───────────────────────────────────────────────────
async function main(): Promise<void> {
  const flags = parseFlags(args);

  switch (command) {
    case "send":
      await sendEmail(flags);
      break;

    case "batch": {
      const filePath = args[0];
      if (!filePath || filePath.startsWith("--")) {
        console.error("Usage: batch <file.json>");
        process.exit(1);
      }
      await sendBatch(filePath);
      break;
    }

    case "list":
      await listEmails();
      break;

    case "get": {
      const id = args[0];
      if (!id) {
        console.error("Usage: get <email-id>");
        process.exit(1);
      }
      await getEmail(id);
      break;
    }

    case "cancel": {
      const id = args[0];
      if (!id) {
        console.error("Usage: cancel <email-id>");
        process.exit(1);
      }
      await cancelEmail(id);
      break;
    }

    case "update": {
      const id = args[0];
      if (!id) {
        console.error("Usage: update <email-id> --schedule <ISO-datetime>");
        process.exit(1);
      }
      await updateEmail(id, parseFlags(args.slice(1)));
      break;
    }

    case "attachments": {
      const emailId = args[0];
      if (!emailId) {
        console.error("Usage: attachments <email-id>");
        process.exit(1);
      }
      await listAttachments(emailId);
      break;
    }

    case "attachment": {
      const emailId = args[0];
      const attachmentId = args[1];
      if (!emailId || !attachmentId) {
        console.error("Usage: attachment <email-id> <attachment-id>");
        process.exit(1);
      }
      await getAttachment(emailId, attachmentId);
      break;
    }

    default:
      usage();
      if (command && command !== "--help" && command !== "-h") {
        console.error(`\nUnknown command: ${command}`);
        process.exit(1);
      }
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
