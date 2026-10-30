import { sortLatestFirst } from "../utils/sortLatest";
import { apiUrl } from "./apiConfig";

const BASE = apiUrl("/latest-articles");
const CACHE_KEY = "latest-articles-cache";
const CACHE_TIME = 5 * 60 * 1000;

let memoryCache = null;
let cacheTime = 0;
let pendingRequest = null;

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.articles)) return data.articles;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getArticle = (data) =>
  data?.article || data?.item || data?.data || data;

const loadList = async () => {
  const response = await fetch(BASE);

  if (!response.ok) {
    throw new Error(`Failed to load latest articles: ${response.status}`);
  }

  return getList(await response.json());
};

const loadAndCacheArticles = async () => {
  const articles = await loadList();

  memoryCache = articles;
  cacheTime = Date.now();

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: articles, time: cacheTime })
    );
  } catch {

  }

  return articles;
};

const refreshInBackground = () => {
  if (pendingRequest) return pendingRequest;

  pendingRequest = loadAndCacheArticles()
    .catch((error) => {
      console.warn("Unable to refresh latest articles:", error);
      return memoryCache;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
};

const getArticles = async () => {
  if (memoryCache !== null) {
    if (Date.now() - cacheTime >= CACHE_TIME) {
      void refreshInBackground();
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

        if (Date.now() - cacheTime >= CACHE_TIME) {
          void refreshInBackground();
        }

        return memoryCache;
      }
    }
  } catch {

  }

  if (!pendingRequest) {
    pendingRequest = loadAndCacheArticles().finally(() => {
      pendingRequest = null;
    });
  }

  return pendingRequest;
};

export const fetchLatestArticles = async (limit) => {
  const articles = await getArticles();

  const sorted = sortLatestFirst(
    articles.filter((article) => article && article.status !== "draft")
  );

  if (limit === undefined || limit === null || limit === "") {
    return sorted;
  }

  const count = Number(limit);

  return Number.isFinite(count) && count > 0
    ? sorted.slice(0, Math.floor(count))
    : sorted;
};

export const fetchLatestArticle = async (slug) => {
  const cleanSlug = String(slug || "").trim();

  if (!cleanSlug) {
    throw new Error("Article slug is required");
  }

  const articles = await getArticles();

  const found = articles.find(
    (article) =>
      article &&
      String(article.slug || "").trim().toLowerCase() ===
        cleanSlug.toLowerCase()
  );

  if (found) return found;

  const response = await fetch(`${BASE}/${encodeURIComponent(cleanSlug)}`);

  if (!response.ok) {
    if (response.status === 404) return null;

    throw new Error(`Failed to load article: ${response.status}`);
  }

  const article = getArticle(await response.json());

  if (
    !article ||
    String(article.slug || "").trim().toLowerCase() !== cleanSlug.toLowerCase()
  ) {
    return null;
  }

  return article;
};