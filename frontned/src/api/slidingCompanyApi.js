
import { sortLatestFirst } from "../utils/sortLatest";

const BASE =
  "https://market-hub-blogs-backend.onrender.com/api/sliding-companies";

const CACHE_KEY = "sliding-companies-cache";
const CACHE_TIME = 60 * 1000; 

let memoryCache = null;
let cacheTime = 0;
let pendingRequest = null;

export const fetchSlidingCompanies = async () => {

  if (memoryCache && Date.now() - cacheTime < CACHE_TIME) {
    return memoryCache;
  }


  if (pendingRequest) {
    return pendingRequest;
  }


  try {
    const cached = localStorage.getItem(CACHE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);

      if (
        Array.isArray(parsed.data) &&
        Date.now() - parsed.time < CACHE_TIME
      ) {
        memoryCache = parsed.data;
        cacheTime = parsed.time;
        return memoryCache;
      }
    }
  } catch (error) {
    console.warn("Unable to read sliding companies cache:", error);
  }


  pendingRequest = (async () => {
    const res = await fetch(BASE);

    if (!res.ok) {
      throw new Error("Failed to load sliding companies");
    }

    const data = await res.json();

    const sortedData = sortLatestFirst(
      Array.isArray(data) ? data : []
    );

    memoryCache = sortedData;
    cacheTime = Date.now();

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: sortedData,
          time: cacheTime,
        })
      );
    } catch (error) {

    }

    return sortedData;
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
};

export const fetchSlidingCompany = async (slug) => {
  const res = await fetch(`${BASE}/${slug}`);

  if (!res.ok) {
    throw new Error("Not found");
  }

  return res.json();
};
