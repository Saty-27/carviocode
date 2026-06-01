const getBackendBase = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace("/api", "");
  }
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${protocol}//${hostname}:8000`;
};
const BACKEND_BASE = getBackendBase();

/**
 * Resolves an image URL.
 * If the URL is already absolute (starts with http), it returns it as is.
 * If it's a relative path (starts with /uploads), it prepends the backend base URL.
 * @param {string} url - The image URL or path to resolve.
 * @returns {string} The resolved absolute URL.
 */
export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  
  // Ensure we don't double slash
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_BASE}${cleanUrl}`;
};
