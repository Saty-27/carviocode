const getBackendUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl) {
    return envUrl;
  }
  // Dynamically use current hostname to prevent localhost vs 127.0.0.1 origin mismatch
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `${protocol}//${hostname}:8000`;
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;
