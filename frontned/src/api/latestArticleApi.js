const BASE = "http://localhost:5000/api/latest-articles";

export const fetchLatestArticles = async (limit) => {
  const res = await fetch(limit ? `${BASE}?limit=${limit}` : BASE);
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
};

export const fetchLatestArticle = async (slug) => {
  const res = await fetch(`${BASE}/${slug}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};