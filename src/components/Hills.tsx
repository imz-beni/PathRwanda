// Decorative contour lines, like a map of hills, for the dark green bands. Rwanda is known
// as the land of a thousand hills. Purely visual, so it is hidden from screen readers.
const LINES = 11;

export function Hills({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {Array.from({ length: LINES }, (_, i) => (
        <path
          key={i}
          d="M-40 150 C 160 70, 330 210, 520 130 S 860 40, 1040 130 S 1320 220, 1480 110"
          transform={`translate(0 ${i * 38 - 40})`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity={0.03 + (i % 4) * 0.018}
        />
      ))}
    </svg>
  );
}
