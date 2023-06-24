export function normalizeUrl(url: string | null): string {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) {
    return url;
  }
  return `https:${url}`;
}
