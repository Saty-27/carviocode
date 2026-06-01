const getBackendBase = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return (envUrl || `${protocol}//${hostname}:8000`).replace("/api", "");
  }
  
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace("/api", "");
  }
  
  return `${protocol}//${hostname}`;
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
