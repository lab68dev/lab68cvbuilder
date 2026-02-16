#!/usr/bin/env node

/**
 * Resend Domain Management CLI
 *
 * Usage:
 *   npx tsx scripts/resend-domains.ts <command> [options]
 *
 * Commands:
 *   add <domain>         Add a new domain
 *   list                 List all domains
 *   get <id>             Retrieve a domain by ID
 *   verify <id>          Trigger domain verification
 *   update <id>          Update domain tracking settings
 *   remove <id>          Delete a domain
 *
 * Options (for update):
 *   --open-tracking      Enable open tracking (default: current)
 *   --no-open-tracking   Disable open tracking
 *   --click-tracking     Enable click tracking (default: current)
 *   --no-click-tracking  Disable click tracking
 *
 * Environment:
 *   AUTH_RESEND_KEY       Resend API key (loaded from .env.local)
 */

import { config } from "dotenv";
import { Resend } from "resend";

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

const [, , command, ...args] = process.argv;

function usage(): void {
  console.log(`
Resend Domain Management CLI

Usage:
  npx tsx scripts/resend-domains.ts <command> [options]

Commands:
  add <domain>         Add a new sending domain
  list                 List all domains
  get <id>             Retrieve domain details and DNS records
  verify <id>          Trigger domain verification
  update <id> [flags]  Update tracking settings
  remove <id>          Delete a domain

Update flags:
  --open-tracking / --no-open-tracking
  --click-tracking / --no-click-tracking

Examples:
  npx tsx scripts/resend-domains.ts add example.com
  npx tsx scripts/resend-domains.ts list
  npx tsx scripts/resend-domains.ts verify ab15d233-9203-4f0f-a6c5-e6e06675fe46
  npx tsx scripts/resend-domains.ts update ab15d233-... --click-tracking --no-open-tracking
`);
}

async function addDomain(name: string): Promise<void> {
  console.log(`Adding domain: ${name} ...`);
  const { data, error } = await resend.domains.create({ name });

  if (error) {
    console.error("Failed to add domain:", error);
    process.exit(1);
  }

  console.log("\nDomain created successfully.\n");
  console.log("  ID:     ", data!.id);
  console.log("  Name:   ", data!.name);
  console.log("  Status: ", data!.status);
  console.log("\nNext steps:");
  console.log("  1. Add the DNS records shown by: npx tsx scripts/resend-domains.ts get", data!.id);
  console.log("  2. Verify with: npx tsx scripts/resend-domains.ts verify", data!.id);
}

async function listDomains(): Promise<void> {
  console.log("Fetching domains ...\n");
  const { data, error } = await resend.domains.list();

  if (error) {
    console.error("Failed to list domains:", error);
    process.exit(1);
  }

  if (!data?.data || data.data.length === 0) {
    console.log("No domains found. Add one with: npx tsx scripts/resend-domains.ts add <domain>");
    return;
  }

  console.log("ID                                     Name                 Status      Region");
  console.log("─".repeat(90));
  for (const d of data.data) {
    console.log(
      `${d.id}   ${d.name.padEnd(20)} ${d.status.padEnd(11)} ${d.region}`
    );
  }
  console.log(`\n${data.data.length} domain(s) total.`);
}

async function getDomain(id: string): Promise<void> {
  console.log(`Fetching domain ${id} ...\n`);
  const { data, error } = await resend.domains.get(id);

  if (error) {
    console.error("Failed to get domain:", error);
    process.exit(1);
  }

  console.log("Domain Details:");
  console.log("  ID:       ", data!.id);
  console.log("  Name:     ", data!.name);
  console.log("  Status:   ", data!.status);
  console.log("  Region:   ", data!.region);
  console.log("  Created:  ", data!.created_at);

  if (data!.records && data!.records.length > 0) {
    console.log("\nDNS Records (add these to your DNS provider):\n");
    console.log("  Type       Name                                         Value");
    console.log("  " + "─".repeat(85));
    for (const r of data!.records) {
      const name = String(r.name || "").padEnd(44);
      const value = String(r.value || "");
      console.log(`  ${String(r.record).padEnd(10)} ${name} ${value}`);
      if (r.priority !== undefined) {
        console.log(`             Priority: ${r.priority}`);
      }
    }
  }
}

async function verifyDomain(id: string): Promise<void> {
  console.log(`Verifying domain ${id} ...`);
  const { data, error } = await resend.domains.verify(id);

  if (error) {
    console.error("Failed to verify domain:", error);
    process.exit(1);
  }

  console.log("\nVerification triggered successfully.");
  console.log("  Object:", data!.object);
  console.log("  ID:    ", data!.id);
  console.log("\nNote: DNS propagation may take a few minutes to a few hours.");
  console.log("Check status with: npx tsx scripts/resend-domains.ts get", id);
}

async function updateDomain(id: string, flags: string[]): Promise<void> {
  const options: { id: string; openTracking?: boolean; clickTracking?: boolean } = { id };

  for (const flag of flags) {
    switch (flag) {
      case "--open-tracking":
        options.openTracking = true;
        break;
      case "--no-open-tracking":
        options.openTracking = false;
        break;
      case "--click-tracking":
        options.clickTracking = true;
        break;
      case "--no-click-tracking":
        options.clickTracking = false;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        process.exit(1);
    }
  }

  if (options.openTracking === undefined && options.clickTracking === undefined) {
    console.error("Provide at least one flag: --open-tracking, --no-open-tracking, --click-tracking, --no-click-tracking");
    process.exit(1);
  }

  console.log(`Updating domain ${id} ...`);
  const { data, error } = await resend.domains.update(options);

  if (error) {
    console.error("Failed to update domain:", error);
    process.exit(1);
  }

  console.log("\nDomain updated successfully.");
  console.log("  ID:    ", data!.id);
  console.log("  Object:", data!.object);
}

async function removeDomain(id: string): Promise<void> {
  console.log(`Removing domain ${id} ...`);
  const { data, error } = await resend.domains.remove(id);

  if (error) {
    console.error("Failed to remove domain:", error);
    process.exit(1);
  }

  console.log("\nDomain deleted successfully.");
  console.log("  Object:", data!.object);
  console.log("  ID:    ", data!.id);
  console.log("  Deleted:", data!.deleted);
}

async function main(): Promise<void> {
  switch (command) {
    case "add": {
      const domain = args[0];
      if (!domain) {
        console.error("Usage: add <domain>\nExample: add example.com");
        process.exit(1);
      }
      await addDomain(domain);
      break;
    }
    case "list":
      await listDomains();
      break;
    case "get": {
      const id = args[0];
      if (!id) {
        console.error("Usage: get <domain-id>");
        process.exit(1);
      }
      await getDomain(id);
      break;
    }
    case "verify": {
      const id = args[0];
      if (!id) {
        console.error("Usage: verify <domain-id>");
        process.exit(1);
      }
      await verifyDomain(id);
      break;
    }
    case "update": {
      const id = args[0];
      if (!id) {
        console.error("Usage: update <domain-id> [--open-tracking] [--no-open-tracking] [--click-tracking] [--no-click-tracking]");
        process.exit(1);
      }
      await updateDomain(id, args.slice(1));
      break;
    }
    case "remove": {
      const id = args[0];
      if (!id) {
        console.error("Usage: remove <domain-id>");
        process.exit(1);
      }
      await removeDomain(id);
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
