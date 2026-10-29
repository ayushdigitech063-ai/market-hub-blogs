import { sortLatestFirst } from "../utils/sortLatest";
import { apiUrl } from "./apiConfig";

const BASE = apiUrl("/sliding-companies");

const CACHE_KEY = "sliding-companies-cache";
const CACHE_TIME = 60 * 1000;

let memoryCache = null;
let cacheTime = 0;
let pendingRequest = null;

const saveCache = (data) => {
  memoryCache = data;
  cacheTime = Date.now();

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        time: cacheTime,
      })
    );
  } catch {

  }
};

const refreshSlidingCompanies = async () => {
  const res = await fetch(BASE);

  if (!res.ok) {
    throw new Error("Failed to load sliding companies");
  }

  const data = await res.json();

  const sortedData = sortLatestFirst(
    Array.isArray(data) ? data : []
  );

  saveCache(sortedData);

  return sortedData;
};

export const fetchSlidingCompanies = async () => {

  if (memoryCache !== null) {
    if (!pendingRequest && Date.now() - cacheTime >= CACHE_TIME) {
      pendingRequest = refreshSlidingCompanies()
        .catch((error) => {
          console.warn("Unable to refresh sliding companies:", error);
        })
        .finally(() => {
          pendingRequest = null;
        });
    }

    return memoryCache;
  }


  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      if (Array.isArray(parsed.data)) {
        memoryCache = parsed.data;
        cacheTime = Number(parsed.time) || 0;


        pendingRequest = refreshSlidingCompanies()
          .catch((error) => {
            console.warn("Unable to refresh sliding companies:", error);
          })
          .finally(() => {
            pendingRequest = null;
          });

        return memoryCache;
      }
    }
  } catch {

  }


  if (!pendingRequest) {
    pendingRequest = refreshSlidingCompanies().finally(() => {
      pendingRequest = null;
    });
  }

  return pendingRequest;
};

export const fetchSlidingCompany = async (slug) => {
  if (!slug) {
    throw new Error("Company slug is required");
  }

  const res = await fetch(
    `${BASE}/${encodeURIComponent(slug)}`
  );

  if (!res.ok) {
    throw new Error("Sliding company not found");
  }

  return res.json();
};