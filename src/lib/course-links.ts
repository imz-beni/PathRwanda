// BR-11: external course links can disappear, so admins can re-check them.

export type LinkCheckResult = "OK" | "BROKEN" | "UNKNOWN";

export type LinkResponse = { status: number } | { error: "not_found_host" | "other" };

// Only a clear "this page is gone" counts as broken. Many sites block automated checks (403, 429)
// or are briefly down (5xx, timeouts), and hiding a good course because of that would be worse.
export function classifyLinkResponse(response: LinkResponse): LinkCheckResult {
  if ("error" in response) return response.error === "not_found_host" ? "BROKEN" : "UNKNOWN";
  if (response.status >= 200 && response.status < 400) return "OK";
  if (response.status === 404 || response.status === 410) return "BROKEN";
  return "UNKNOWN";
}

const TIMEOUT_MS = 10_000;
const HEADERS = { "User-Agent": "PathRwanda link checker" };

async function request(url: string, method: "HEAD" | "GET"): Promise<LinkResponse> {
  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      headers: HEADERS,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    await response.body?.cancel();
    return { status: response.status };
  } catch (error) {
    const code = (error as { cause?: { code?: string } }).cause?.code;
    return { error: code === "ENOTFOUND" ? "not_found_host" : "other" };
  }
}

export async function checkCourseLink(url: string): Promise<LinkCheckResult> {
  // Some servers refuse HEAD, so anything but a clear answer is retried with GET.
  const head = await request(url, "HEAD");
  const headResult = classifyLinkResponse(head);
  if (headResult === "OK" || ("error" in head && head.error === "not_found_host")) {
    return headResult;
  }
  return classifyLinkResponse(await request(url, "GET"));
}
