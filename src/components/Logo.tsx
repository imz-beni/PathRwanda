// The PathRwanda mark: a path climbing a hill, in the brand green.
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#047857" />
      <path
        d="M7 23c4-1 5.5-4 8-6.5S20 12 25 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="25" cy="9" r="2.6" fill="#fbbf24" />
      <circle cx="7" cy="23" r="1.8" fill="#ffffff" />
    </svg>
  );
}
