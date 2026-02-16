"use client";

import { useState, useRef, useEffect } from "react";

const PRODUCTS = [
  {
    name: "Lab68 Store",
    description: "Digital products and resources",
    url: "https://lab68store.vercel.app/",
  },
  {
    name: "Lab68 Platform",
    description: "Developer platform and tools",
    url: "https://lab68devplatform.vercel.app/",
  },
  {
    name: "Lab68 Video Resizer",
    description: "Resize and convert videos",
    url: "https://lab68videoresizer.netlify.app/",
  },
];

export function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 border-0 px-0 py-0 text-[0.6875rem] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors duration-150"
      >
        Products
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4L5 7L8 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-72 border border-black bg-white shadow-[4px_4px_0_#000] z-50">
          <div className="p-1">
            <span className="label-mono block px-3 pt-3 pb-2">
              LAB68DEV PRODUCTS
            </span>
            {PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 hover:bg-black hover:text-white transition-colors duration-100 group"
                onClick={() => setIsOpen(false)}
              >
                <span className="block text-xs font-bold uppercase tracking-wider">
                  {product.name}
                </span>
                <span className="block text-[0.6875rem] text-gray-500 group-hover:text-gray-300 mt-0.5">
                  {product.description}
                </span>
              </a>
            ))}
          </div>
          <div className="border-t border-gray-200 px-3 py-2">
            <span className="label-mono">More coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
