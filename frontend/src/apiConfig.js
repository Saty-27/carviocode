const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  
  // If running locally, check if envUrl is set, otherwise default to port 8000
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return envUrl || `${protocol}//${hostname}:8000`;
  }
  
  // In production (hostname is a public domain), we ignore localhost envUrl
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }
  
  // Use the same domain without specifying port 8000, since Nginx proxies /api on port 80/443
  return `${protocol}//${hostname}`;
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
