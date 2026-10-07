import type { SearchParams } from "@solidjs/router";

/** The `q` search param as one trimmed string ("" when absent). */
export function searchQuery(query: SearchParams) {
  const value = query.q;
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

export function searchHref(q: string, threadId?: string) {
  const path = threadId ? `/search/${threadId}` : "/search";
  return q ? `${path}?q=${encodeURIComponent(q)}` : path;
}
