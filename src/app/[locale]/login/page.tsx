"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { GUEST_MIGRATION_PARAM, GUEST_STORAGE_KEY } from "@/lib/constants";
import { getSafeCallbackUrl } from "@/lib/url-helpers";

const SIGN_IN_ERROR = "Google sign-in did not work. Please try again.";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? SIGN_IN_ERROR : null,
  );
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    let hasGuestDraft = false;
    try {
      // The dashboard imports the guest draft when Google sends the user back.
      hasGuestDraft = Boolean(localStorage.getItem(GUEST_STORAGE_KEY));
    } catch {
      // Blocked browser storage must not stop the sign-in.
    }

    try {
      await signIn("google", {
        redirectTo: hasGuestDraft
          ? `/dashboard?${GUEST_MIGRATION_PARAM}=1`
          : callbackUrl,
      });
    } catch {
      setError(SIGN_IN_ERROR);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* LEFT PANEL — BRUTALIST TYPOGRAPHY */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Technical label */}
          <span className="label-mono text-gray-400">
            AUTH.MODULE // V5.0.0
          </span>
        </div>

        <div className="relative z-10">
          {/* Hero heading */}
          <h1 className="text-8xl font-black tracking-tighter leading-[0.8] mb-8">
            ENTER
            <br />
            THE
            <br />
            LAB
          </h1>

          {/* Divider */}
          <div className="w-32 border-t border-white mb-6" />

          {/* Description */}
          <p className="text-sm font-light tracking-wide max-w-md leading-relaxed text-gray-300">
            Sign in with your Google account.
            <br />
            No passwords. No friction. Pure access.
          </p>
        </div>

        <div className="relative z-10">
          <span className="label-mono text-gray-500">
            LAB68DEV STUDIO // {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL — GOOGLE SIGN-IN */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-12">
            <h1 className="text-5xl font-black tracking-tighter leading-[0.85] mb-4">
              ENTER
              <br />
              THE LAB
            </h1>
            <div className="w-16 border-t border-black mb-4" />
          </div>

          {/* Form header */}
          <div className="mb-8">
            <span className="label-mono block mb-2">
              STEP_01 // AUTHENTICATION
            </span>
            <h2 className="text-2xl font-bold tracking-tight">Welcome</h2>
            <p className="text-sm text-gray-600 mt-2">
              Log in or create an account with Google. If you already have an
              account, use the same email address to keep your resumes.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 border border-red-600 bg-red-50">
              <span className="label-mono text-red-600">ERROR</span>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full border border-black bg-black text-white px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "OPENING GOOGLE..." : "CONTINUE WITH GOOGLE →"}
          </button>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="label-mono text-gray-400 hover:text-black hover:underline inline-block"
            >
              ← BACK_TO_HOME
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
