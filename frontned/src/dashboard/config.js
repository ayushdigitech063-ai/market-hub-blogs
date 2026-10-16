

export const API = "https://market-hub-blogs-backend.onrender.com/api";

export const TOKEN_KEY = "admin_token";


export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || window.location.origin
).replace(/\/+$/, "");


export const authFetch = (url, opts = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then((res) => {
    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("admin-logout"));
    }

    return res;
  });
};
