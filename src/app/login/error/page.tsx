"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const AUTH_ERRORS: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    description:
      "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Verification Failed",
    description:
      "The magic link is invalid or has expired. Please request a new one.",
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorInfo = AUTH_ERRORS[error] || AUTH_ERRORS.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-2xl w-full">
        {/* Grid pattern background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.02] -z-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Technical label */}
        <span className="label-mono block mb-6 text-red-600">
          AUTH.MODULE // ERROR_STATE
        </span>

        {/* Error icon */}
        <div className="mb-8 p-8 border-2 border-red-600 inline-block">
          <svg
            className="w-16 h-16 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-black tracking-tighter leading-[0.85] mb-6">
          AUTH
          <br />
          ERROR
        </h1>

        {/* Divider */}
        <div className="w-24 border-t-2 border-red-600 mb-8" />

        {/* Error details */}
        <div className="mb-12 space-y-4">
          <div className="border-l-4 border-red-600 pl-6">
            <h2 className="text-2xl font-bold mb-2">{errorInfo.title}</h2>
            <p className="text-base font-light leading-relaxed text-gray-700">
              {errorInfo.description}
            </p>
          </div>

          {error && error !== "Default" && (
            <div className="p-4 bg-gray-50 border border-gray-200">
              <span className="label-mono block mb-1 text-gray-600">
                ERROR_CODE
              </span>
              <code className="text-sm font-mono">{error}</code>
            </div>
          )}
        </div>

        {/* Troubleshooting steps */}
        <div className="border-2 border-black p-6 mb-8">
          <span className="label-mono block mb-4">RECOVERY_PROTOCOL</span>
          <ol className="space-y-3 text-sm font-light">
            <li className="flex">
              <span className="font-bold mr-3 font-mono">01.</span>
              <span>Return to the login page and request a new magic link</span>
            </li>
            <li className="flex">
              <span className="font-bold mr-3 font-mono">02.</span>
              <span>
                Ensure you're clicking the most recent link from your email
              </span>
            </li>
            <li className="flex">
              <span className="font-bold mr-3 font-mono">03.</span>
              <span>
                Check that you're using the same email address for both
                requests
              </span>
            </li>
            <li className="flex">
              <span className="font-bold mr-3 font-mono">04.</span>
              <span>
                If the problem persists, clear your browser cache and cookies
              </span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/login"
            className="border-2 border-black bg-black text-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-center hover:bg-white hover:text-black transition-colors duration-150"
          >
            ← Try Again
          </Link>
          <Link
            href="/"
            className="border-2 border-gray-300 px-6 py-4 text-xs font-bold uppercase tracking-widest text-center text-gray-600 hover:border-black hover:text-black transition-colors duration-150"
          >
            Back to Home
          </Link>
        </div>

        {/* Support notice */}
        <div className="p-4 border border-gray-200 bg-gray-50">
          <span className="label-mono block mb-2 text-gray-600">
            NEED_ASSISTANCE?
          </span>
          <p className="text-xs text-gray-600">
            If you continue experiencing issues, contact lab68dev support with
            the error code above.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-gray-200 pt-6">
          <span className="label-mono text-gray-400">
            AUTH_V5.0.0 // SECURE_PASSWORDLESS
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="label-mono">LOADING...</span>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
