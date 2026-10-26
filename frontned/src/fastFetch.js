
const originalFetch = window.fetch.bind(window);

const DB_NAME = "fast-fetch-cache";
const STORE = "responses";

const FRESH_MS = 30 * 1000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const memory = new Map();
const pendingRequests = new Map();
const pendingRevalidations = new Map();

let dbPromise = null;

// Reuse the IndexedDB connection.
const openDb = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };

        resolve(db);
      };

      request.onerror = () => reject(request.error);

      request.onblocked = () => {
        reject(new Error("IndexedDB connection is blocked"));
      };
    } catch (error) {
      reject(error);
    }
  }).catch((error) => {
    dbPromise = null;
    throw error;
  });

  return dbPromise;
};

// Read from IndexedDB.
const dbGet = async (key) => {
  try {
    const db = await openDb();

    return await new Promise((resolve) => {
      const request = db
        .transaction(STORE, "readonly")
        .objectStore(STORE)
        .get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// Save to IndexedDB.
const dbSet = async (key, value) => {
  try {
    const db = await openDb();

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");

      transaction.objectStore(STORE).put(value, key);

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch {
    // Cache errors must not break normal API requests.
  }
};

// Clear IndexedDB cache.
const dbClear = async () => {
  try {
    const db = await openDb();

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");

      transaction.objectStore(STORE).clear();

      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch {
    // The website must continue working if cache clearing fails.
  }
};

// Convert a cached entry into a Response.
const toResponse = (entry) => {
  return new Response(entry.body, {
    status: entry.status || 200,
    statusText: entry.statusText || "",
    headers: entry.headers || {
      "Content-Type": entry.type || "application/json",
    },
  });
};

// Save successful, cacheable JSON responses.
const saveResponse = async (key, response) => {
  try {
    if (response.status !== 200 || !response.ok) return;

    const headers = new Headers(response.headers);
    const contentType = headers.get("content-type") || "";
    const cacheControl = headers.get("cache-control") || "";
    const vary = headers.get("vary") || "";

    if (!contentType.toLowerCase().includes("json")) return;

    // Respect server instructions that prohibit caching.
    if (/\b(no-store|private)\b/i.test(cacheControl)) return;
    if (vary.trim() === "*") return;

    const body = await response.clone().text();

    const entry = {
      body,
      type: contentType,
      status: response.status,
      statusText: response.statusText,
      headers: Array.from(headers.entries()),
      time: Date.now(),
    };

    // Memory cache updates immediately.
    memory.set(key, entry);

    // IndexedDB writes run in the background.
    void dbSet(key, entry);
  } catch {
    // Caching must never break the original response.
  }
};

// Load from memory first, then IndexedDB.
const getEntry = async (key) => {
  const cached = memory.get(key);

  if (cached) return cached;

  const entry = await dbGet(key);

  if (entry) {
    memory.set(key, entry);
  }

  return entry;
};

// Refresh stale cache entries in the background.
const revalidate = (key) => {
  if (pendingRevalidations.has(key)) {
    return pendingRevalidations.get(key);
  }

  const request = originalFetch(key)
    .then((response) => {
      if (response.ok) {
        void saveResponse(key, response);
      }
    })
    .catch(() => {
      // Keep existing cache if the network is unavailable.
    })
    .finally(() => {
      pendingRevalidations.delete(key);
    });

  pendingRevalidations.set(key, request);

  return request;
};

// Preserve the existing fetch API.
window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input.url;

  // Only intercept API URLs.
  if (!url || !url.includes("/api/")) {
    return originalFetch(input, init);
  }

  const method = (
    init.method ||
    (typeof input !== "string" ? input.method : undefined) ||
    "GET"
  ).toUpperCase();

  // Mutations bypass cache and invalidate it after success.
  if (method !== "GET") {
    const response = await originalFetch(input, init);

    if (response.ok) {
      memory.clear();
      await dbClear();
    }

    return response;
  }

  const requestHeaders = new Headers(
    init.headers ||
      (typeof input !== "string" ? input.headers : undefined)
  );

  // Never cache authenticated requests.
  if (requestHeaders.has("Authorization")) {
    return originalFetch(input, init);
  }

  // Preserve cancellation behavior for individual requests.
  const signal =
    init.signal ||
    (typeof input !== "string" ? input.signal : undefined);

  if (signal) {
    return originalFetch(input, init);
  }

  // Check the existing cache.
  const entry = await getEntry(url);
  const age = entry ? Date.now() - entry.time : Infinity;

  if (entry && age >= 0 && age < MAX_AGE_MS) {
    if (age > FRESH_MS) {
      void revalidate(url);
    }

    return toResponse(entry);
  }

  // Reuse an in-flight GET request for the same URL.
  if (pendingRequests.has(url)) {
    const existingResponse = await pendingRequests.get(url);

    return existingResponse.clone();
  }

  const request = originalFetch(input, init)
    .then((response) => {
      if (response.ok) {
        // Do not delay the API response while writing the cache.
        void saveResponse(url, response);
      }

      return response;
    })
    .finally(() => {
      pendingRequests.delete(url);
    });

  pendingRequests.set(url, request);

  return request;
};
