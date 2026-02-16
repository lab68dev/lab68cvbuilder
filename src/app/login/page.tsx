"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("An unexpected error occurred.");
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
            Passwordless authentication via email.
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
      {/* RIGHT PANEL — MINIMAL EMAIL FORM */}
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

          {/* Mode toggle tabs */}
          <div className="flex border border-black mb-8">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all duration-150 ${
                mode === "login"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest border-l border-black transition-all duration-150 ${
                mode === "register"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <span className="label-mono block mb-2">
              {mode === "login" ? "STEP_01 // AUTHENTICATION" : "STEP_01 // REGISTRATION"}
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {mode === "login"
                ? "Enter your email to access your account"
                : "Enter your email to get started — no password needed"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 border border-red-600 bg-red-50">
              <span className="label-mono text-red-600">ERROR</span>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="label-mono block mb-2 text-black"
              >
                EMAIL_ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full border border-black bg-transparent px-4 py-3 text-base focus:bg-black focus:text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full border border-black bg-black text-white px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "AUTHENTICATING..."
                : mode === "login"
                  ? "LOG IN →"
                  : "CREATE ACCOUNT →"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />

          {/* Mode switcher hint */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              {mode === "login"
                ? "Don\u2019t have an account?"
                : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
              className="label-mono text-black hover:underline"
            >
              {mode === "login" ? "SIGN UP →" : "LOG IN →"}
            </button>
          </div>

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
