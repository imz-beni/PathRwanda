// Only allow redirects to paths inside this site, so a crafted ?next= cannot send users elsewhere.
export function safeNextPath(next: unknown, fallback = "/sectors"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
