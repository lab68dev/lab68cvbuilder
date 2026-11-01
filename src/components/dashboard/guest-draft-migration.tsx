"use client";

import { useEffect, useRef, useState } from "react";
import { trackUsageEvent } from "@/actions/usage-event";
import { useRouter } from "@/i18n/routing";
import { GUEST_MIGRATION_META_KEY, GUEST_STORAGE_KEY } from "@/lib/constants";
import { USAGE_EVENTS } from "@/lib/usage-events";

/**
 * Imports the draft a guest made on /try after they sign in.
 * The draft is removed from the browser only after the server has saved it.
 */
export function GuestDraftMigration() {
  const router = useRouter();
  const hasStartedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const migrate = async () => {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      if (!stored) return; // Link opened in another browser, or already imported.

      try {
        const rawMeta = localStorage.getItem(GUEST_MIGRATION_META_KEY);
        const metadata = rawMeta ? JSON.parse(rawMeta) : null;
        void trackUsageEvent(USAGE_EVENTS.GUEST_MIGRATION_STARTED, {
          source: metadata?.source || "unknown",
        });

        const response = await fetch("/api/resume/guest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...JSON.parse(stored),
            metadata,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to migrate guest resume");
        }

        const resume = await response.json();
        // Another guest tab may have saved newer edits during the request.
        if (localStorage.getItem(GUEST_STORAGE_KEY) === stored) {
          localStorage.removeItem(GUEST_STORAGE_KEY);
          localStorage.removeItem(GUEST_MIGRATION_META_KEY);
        }
        void trackUsageEvent(USAGE_EVENTS.GUEST_MIGRATION_SUCCEEDED, {
          resumeId: resume.id,
        });
        router.push(`/builder/${resume.id}`);
      } catch {
        void trackUsageEvent(USAGE_EVENTS.GUEST_MIGRATION_FAILED);
        setFailed(true);
      }
    };

    void migrate();
  }, [router]);

  if (!failed) return null;

  return (
    <div role="alert" className="mb-8 p-4 border border-red-600 bg-red-50">
      <span className="label-mono text-red-600">DRAFT_NOT_IMPORTED</span>
      <p className="text-sm text-red-800 mt-1">
        We could not import your draft. It is still saved in this browser, so
        reload this page to try again.
      </p>
    </div>
  );
}
