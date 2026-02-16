import Link from "next/link";
import Image from "next/image";

const SOCIAL_LINKS = [
  {
    name: "GitHub",
    url: "https://github.com/lab68dev",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@lab68dev",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/lab68dev/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
];

const PRODUCTS = [
  { name: "CV Builder", url: "/", current: true },
  { name: "Lab68 Store", url: "https://lab68store.vercel.app/" },
  { name: "Lab68 Platform", url: "https://lab68devplatform.vercel.app/" },
  { name: "Lab68 Video Resizer", url: "https://lab68videoresizer.netlify.app/" },
];

export function Footer() {
  return (
    <footer className="border-t border-black bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/lab68dev_logo.png"
                alt="lab68dev"
                width={24}
                height={24}
                className="invert"
              />
              <span className="text-sm font-black uppercase tracking-wider">
                lab68dev
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Raw. Structured. Anti-AI. Building developer tools with brutalist
              precision.
            </p>
          </div>

          {/* Products */}
          <div>
            <span className="label-mono block mb-4">Products</span>
            <ul className="space-y-2.5">
              {PRODUCTS.map((product) =>
                product.current ? (
                  <li key={product.name}>
                    <Link
                      href={product.url}
                      className="text-xs font-medium hover:text-gray-500 transition-colors duration-150 flex items-center gap-1.5"
                    >
                      {product.name}
                      <span className="text-[0.5625rem] border border-black px-1 py-0.5 font-bold uppercase leading-none">
                        Current
                      </span>
                    </Link>
                  </li>
                ) : (
                  <li key={product.name}>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium hover:text-gray-500 transition-colors duration-150"
                    >
                      {product.name}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <span className="label-mono block mb-4">Contact</span>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:lab68dev@gmail.com"
                  className="text-xs font-medium hover:text-gray-500 transition-colors duration-150"
                >
                  lab68dev@gmail.com
                </a>
              </li>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:text-gray-500 transition-colors duration-150"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <span className="label-mono block mb-4">Follow</span>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="border border-black p-2.5 hover:bg-black hover:text-white transition-colors duration-150"
                >
                  {link.icon}
                </a>
              ))}
              <a
                href="mailto:lab68dev@gmail.com"
                aria-label="Email"
                className="border border-black p-2.5 hover:bg-black hover:text-white transition-colors duration-150"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="label-mono">
            {new Date().getFullYear()} lab68dev. All rights reserved.
          </span>
          <span className="label-mono">
            Apache License 2.0
          </span>
        </div>
      </div>
    </footer>
  );
}
