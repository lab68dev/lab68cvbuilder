import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-8">
      {/* Grid overlay effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Technical label */}
        <span className="label-mono block mb-4">
          SYS.INIT // LAB68DEV STUDIO
        </span>

        {/* Hero heading */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8">
          CV
          <br />
          BUILDER
        </h1>

        {/* Divider */}
        <div className="w-full border-t border-black mb-8" />

        {/* Description */}
        <p className="text-sm font-light tracking-wide max-w-md mb-12 leading-relaxed">
          Raw. Structured. Anti-AI. Build your resume with precision
          at <span className="font-bold">lab68dev</span>.
        </p>

        {/* CTA */}
        <div className="flex gap-4">
          <Link
            href="/login"
            className="border border-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-150"
          >
            Enter the Lab →
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:border-black hover:text-black transition-colors duration-150"
          >
            View Templates
          </Link>
        </div>

        {/* Footer label */}
        <div className="mt-24 border-t border-gray-200 pt-4">
          <span className="label-mono">
            v0.1.0 // PHASE_01 // {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </main>
  );
}
