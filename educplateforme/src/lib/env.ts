const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const env = {
  apiBaseUrl: trimTrailingSlash(rawApiBaseUrl),
};

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return env.apiBaseUrl ? `${env.apiBaseUrl}${normalizedPath}` : normalizedPath;
}
