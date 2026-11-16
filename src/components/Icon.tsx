// A small set of line icons drawn in one style. Decorative: the text beside an icon always
// says what it means, so icons are hidden from screen readers.
const PATHS = {
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z",
  book: "M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Zm0 12.5a3 3 0 0 1 3-3h9",
  briefcase:
    "M4 8.5h16v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-10Zm5 0V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2.5M4 13h16",
  spark:
    "M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2l5.5 1.8-5.5 1.8a2 2 0 0 0-1.2 1.2L12 20.5 10.2 15a2 2 0 0 0-1.2-1.2L3.5 12 9 10.2a2 2 0 0 0 1.2-1.2L12 3.5Z",
  building:
    "M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20m0-10h3.5A1.5 1.5 0 0 1 20 11.5V20M3.5 20h17M8.5 8h3m-3 4h3m-3 4h3",
  flag: "M6 20.5V4.5m0 .5h10.5l-2 3.5 2 3.5H6",
  users:
    "M9 11a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 9 11Zm-5.5 8.5a5.5 5.5 0 0 1 11 0M16 5a3 3 0 0 1 0 5.8m1.5 3.7a5 5 0 0 1 3 5",
  list: "M8.5 6.5h11m-11 5.5h11m-11 5.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01",
  layers: "m12 4 8.5 4.5L12 13 3.5 8.5 12 4Zm-8.5 8L12 16.5 20.5 12M3.5 15.5 12 20l8.5-4.5",
  chart: "M4.5 19.5h15M7.5 16.5v-5m4.5 5V7m4.5 9.5v-7.5",
  pin: "M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4.5v4.5l3 2",
  arrow: "M5 12h14m-5.5-5.5L19 12l-5.5 5.5",
  check: "m5 12.5 4.5 4.5L19 7.5",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
