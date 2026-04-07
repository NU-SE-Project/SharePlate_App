const DEFAULT_PUBLIC_APP_URL = "http://localhost:5173";

function normalizeBaseUrl(rawUrl) {
  return String(rawUrl || DEFAULT_PUBLIC_APP_URL).trim().replace(/\/+$/, "");
}

export function getPublicAppUrl() {
  return normalizeBaseUrl(
    process.env.FRONTEND_URL || process.env.CLIENT_URL || DEFAULT_PUBLIC_APP_URL,
  );
}

export function buildPublicAppUrl(pathname, searchParams = {}) {
  const targetUrl = new URL(pathname, `${getPublicAppUrl()}/`);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      targetUrl.searchParams.set(key, String(value));
    }
  });

  return targetUrl.toString();
}
