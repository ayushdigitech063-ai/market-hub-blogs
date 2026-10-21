const originalFetch = window.fetch.bind(window);

const DB_NAME = "fast-fetch-cache";
const STORE = "responses";
const FRESH_MS = 30 * 1000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const memory = new Map();

const openDb = () =>
  new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

const dbGet = async (key) => {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

const dbSet = async (key, value) => {
  try {
    const db = await openDb();
    db.transaction(STORE, "readwrite").objectStore(STORE).put(value, key);
  } catch (e) {}
};

const dbClear = async () => {
  try {
    const db = await openDb();
    db.transaction(STORE, "readwrite").objectStore(STORE).clear();
  } catch (e) {}
};

const toResponse = (entry) =>
  new Response(entry.body, {
    status: 200,
    headers: { "Content-Type": entry.type },
  });

const saveResponse = async (key, res) => {
  try {
    if (!res.ok) return;
    const type = res.headers.get("content-type") || "";
    if (!type.includes("json")) return;
    const body = await res.clone().text();
    const entry = { body, type, time: Date.now() };
    memory.set(key, entry);
    dbSet(key, entry);
  } catch (e) {}
};

const revalidate = (key) => {
  originalFetch(key)
    .then((res) => saveResponse(key, res))
    .catch(() => {});
};

window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;

  if (!url || !url.includes("/api/")) return originalFetch(input, init);

  const method = (
    init.method ||
    (typeof input !== "string" && input.method) ||
    "GET"
  ).toUpperCase();

  if (method !== "GET") {
    const res = await originalFetch(input, init);
    memory.clear();
    dbClear();
    return res;
  }

  const headers = new Headers(
    init.headers || (typeof input !== "string" ? input.headers : undefined)
  );
  if (headers.has("Authorization")) return originalFetch(input, init);

  let entry = memory.get(url);
  if (!entry) {
    entry = await dbGet(url);
    if (entry) memory.set(url, entry);
  }

  if (entry && Date.now() - entry.time < MAX_AGE_MS) {
    if (Date.now() - entry.time > FRESH_MS) revalidate(url);
    return toResponse(entry);
  }

  const res = await originalFetch(input, init);
  saveResponse(url, res);
  return res;
};