// Hand-drawn marks. They are decoration, so screen readers skip them.

export function ScribbleUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 18"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M3 11C46 5 96 3 148 5c44 2 92 1 148-2-52 7-103 9-152 11"
        stroke="#FF4D4D"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 16c22 40 62 50 104 34M90 34l21 15-17 21"
        stroke="#2D5DA1"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
