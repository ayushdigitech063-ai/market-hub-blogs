import { sortLatestFirst } from "../utils/sortLatest";
const BASE =
  "https://market-hub-blogs-backend.onrender.com/api/latest-articles";

export const fetchLatestArticles = async (limit) => {

  const response = await fetch(BASE);

  if (!response.ok) {
    throw new Error(
      `Failed to load latest articles: ${response.status}`
    );
  }

  const data = await response.json();

  const articles = Array.isArray(data)
    ? data
    : Array.isArray(data?.articles)
      ? data.articles
      : [];

  const sorted = sortLatestFirst(
    articles.filter((article) => article && article.status !== "draft")
  );

  const n = Number(limit);
  return limit !== undefined && limit !== null && limit !== "" && n > 0
    ? sorted.slice(0, n)
    : sorted;
};


export const fetchLatestArticle = async (slug) => {
  if (!slug || !String(slug).trim()) {
    throw new Error("Article slug is required");
  }

  const response = await fetch(
    `${BASE}/${encodeURIComponent(String(slug).trim())}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load article: ${response.status}`
    );
  }

  return response.json();
};