
const BASE =
  "https://market-hub-blogs-backend.onrender.com/api/latest-articles";

export const fetchLatestArticles = async (limit) => {
  const url = new URL(BASE);

  if (limit !== undefined && limit !== null && limit !== "") {
    url.searchParams.set("limit", String(limit));
  }

  const response = await fetch(url.toString());

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


  return articles.filter(
    (article) => article && article.status !== "draft"
  );
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
