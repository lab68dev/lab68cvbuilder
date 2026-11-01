"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { DoodleArrow, ScribbleUnderline } from "@/components/doodles";
import { GUEST_MIGRATION_PARAM, GUEST_STORAGE_KEY } from "@/lib/constants";
import { getSafeCallbackUrl } from "@/lib/url-helpers";

const SIGN_IN_ERROR = "Google sign-in did not work. Please try again.";

// Google's branding rules require these exact shapes and colors.
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

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
      {/* Left page of the open notebook */}
      <div className="notebook-paper hidden lg:flex lg:w-1/2 flex-col justify-between py-12 pl-20 pr-12 border-r-2 border-black relative overflow-hidden">
        <span className="label-mono">lab68cv.builder</span>

        <div>
          <h1 className="text-8xl font-extrabold leading-[0.95]">
            Enter
            <br />
            the lab
          </h1>
          <ScribbleUnderline className="w-72 h-4 mt-3" />

          <div className="sketch-note max-w-sm mt-12 p-6">
            <p className="font-hand text-lg leading-snug">
              Sign in with your Google account. No passwords to remember.
            </p>
          </div>
        </div>

        <span className="label-mono">
          Lab68dev Studio, {new Date().getFullYear()}
        </span>

        <DoodleArrow className="absolute right-10 top-1/2 w-28 -translate-y-1/2" />
      </div>

      {/* Right page: sign-in */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-10">
            <h1 className="text-5xl font-extrabold leading-none">
              Enter the lab
            </h1>
            <ScribbleUnderline className="w-56 h-3 mt-2" />
          </div>

          <div className="sketch-card p-7 sm:p-9">
            <h2 className="text-3xl font-bold">Welcome</h2>
            <p className="text-gray-700 mt-3 leading-relaxed">
              Log in or create an account with Google. If you already have an
              account, use the same email address to keep your resumes.
            </p>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mt-6 p-4 border border-red-700 bg-red-50"
              >
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="sketch-btn w-full mt-7 flex items-center justify-center gap-3 bg-white px-6 py-4 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleLogo className="size-5 shrink-0" />
              {isLoading ? "Opening Google..." : "Continue with Google"}
            </button>
          </div>

          <div className="mt-7 text-center">
            <Link
              href="/"
              className="label-mono hover:text-black hover:underline inline-block py-2"
            >
              Back to home
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
