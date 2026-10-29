

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is missing from the .env file");
}

export const API = API_BASE_URL.replace(/\/+$/, "");

export const TOKEN_KEY = "admin_token";

export const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

export const authFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});

  try {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch {

  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {

    }

    window.dispatchEvent(new Event("admin-logout"));
  }

  return response;
};
