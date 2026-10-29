import { sortLatestFirst } from "../utils/sortLatest";
import { apiUrl } from "./apiConfig";

const FEATURED_URL = apiUrl("/brands/featured");
const CACHE_KEY = "featured-brands-cache";
const CACHE_TIME = 5 * 60 * 1000;

let memoryCache = null;
let cacheTime = 0;
let pendingRequest = null;

const loadFeaturedBrands = async () => {
  const res = await fetch(FEATURED_URL);

  if (!res.ok) {
    throw new Error("Failed to load featured brands");
  }

  const data = await res.json();

  const brands = Array.isArray(data)
    ? data
    : Array.isArray(data?.brands)
      ? data.brands
      : [];

  const sortedBrands = sortLatestFirst(brands);

  memoryCache = sortedBrands;
  cacheTime = Date.now();

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: sortedBrands,
        time: cacheTime,
      })
    );
  } catch {
    // Continue if localStorage is unavailable
  }

  return sortedBrands;
};

export const fetchFeatured = async () => {
  // Return memory cache immediately
  if (memoryCache !== null) {
    if (
      Date.now() - cacheTime >= CACHE_TIME &&
      !pendingRequest
    ) {
      pendingRequest = loadFeaturedBrands()
        .catch((error) => {
          console.warn("Unable to refresh featured brands:", error);
        })
        .finally(() => {
          pendingRequest = null;
        });
    }

    return memoryCache;
  }

  // Read browser cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      if (Array.isArray(parsed.data)) {
        memoryCache = parsed.data;
        cacheTime = Number(parsed.time) || 0;

        // Refresh in background
        pendingRequest = loadFeaturedBrands()
          .catch((error) => {
            console.warn("Unable to refresh featured brands:", error);
          })
          .finally(() => {
            pendingRequest = null;
          });

        return memoryCache;
      }
    }
  } catch {
    // Ignore invalid cache
  }

  // First visit: fetch from backend
  if (!pendingRequest) {
    pendingRequest = loadFeaturedBrands().finally(() => {
      pendingRequest = null;
    });
  }

  return pendingRequest;
};

export const fetchBrand = async (slug) => {
  if (!slug) {
    throw new Error("Brand slug is required");
  }

  const res = await fetch(
    apiUrl(`/brands/${encodeURIComponent(slug)}`)
  );

  if (!res.ok) {
    throw new Error("Brand not found");
  }

  return res.json();
};