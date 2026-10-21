import { sortLatestFirst } from "../utils/sortLatest";
const BASE =
  "https://market-hub-blogs-backend.onrender.com/api/latest-articles";

const loadList = async () => {
  const response = await fetch(BASE);

  if (!response.ok) {
    throw new Error(
      `Failed to load latest articles: ${response.status}`
    );
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.articles)
      ? data.articles
      : [];
};

export const fetchLatestArticles = async (limit) => {
  const articles = await loadList();

  const sorted = sortLatestFirst(
    articles.filter((article) => article && article.status !== "draft")
  );

  const n = Number(limit);
  return limit !== undefined && limit !== null && limit !== "" && n > 0
    ? sorted.slice(0, n)
    : sorted;
};

export const fetchLatestArticle = async (slug) => {
  const cleanSlug = String(slug || "").trim();

  if (!cleanSlug) {
    throw new Error("Article slug is required");
  }

  const response = await fetch(`${BASE}/${encodeURIComponent(cleanSlug)}`);

  if (response.ok) {
    return response.json();
  }

  if (response.status !== 404) {
    throw new Error(`Failed to load article: ${response.status}`);
  }

  const articles = await loadList();
  const found = articles.find(
    (article) =>
      article &&
      String(article.slug || "").trim().toLowerCase() ===
        cleanSlug.toLowerCase()
  );

  if (!found) {
    throw new Error("Failed to load article: 404");
  }

  return found;
};