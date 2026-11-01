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
    <div
      className="relative group"
      ref={ref}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 border-0 py-4 text-[0.6875rem] font-bold text-gray-500 group-hover:text-black transition-colors duration-150"
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

      {/* Wrapping div acts as a 'bridge' for the mouse to travel down without triggering mouseLeave */}
      <div
        className={`absolute top-full left-0 w-72 pt-1 transition-all duration-150 origin-top z-50 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="border border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="p-1">
            <span className="label-mono block px-3 pt-3 pb-2 text-black">
              Lab68cv products
            </span>
            {PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 hover:bg-note transition-colors duration-100 group/item"
                onClick={() => setIsOpen(false)}
              >
                <span className="block text-xs font-bold ">{product.name}</span>
                <span className="block text-[0.6875rem] text-gray-500 group-hover/item:text-gray-300 mt-0.5">
                  {product.description}
                </span>
              </a>
            ))}
          </div>
          <div className="border-t border-gray-200 px-3 py-2">
            <span className="label-mono text-gray-600">More coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
