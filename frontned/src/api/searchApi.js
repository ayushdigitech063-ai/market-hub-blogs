import {
  BookOpen,
  Building2,
  UserRound,
  Package,
  Newspaper,
  Layers,
  PenLine,
} from "lucide-react";

import { apiUrl } from "./apiConfig";



const decode = (value) => {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return {};
  }
};

const hiddenMeta = (text) => {
  const raw = String(text || "");

  const bio = /<!--BIO_META:([\s\S]*?)-->/.exec(raw);
  if (bio) return decode(bio[1]);

  const pack = /<!--COMPANY_PACK:([\s\S]*?)-->/.exec(raw);
  if (pack) return decode(pack[1]).meta || {};

  return {};
};

export const cleanText = (value) =>
  String(value || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.articles)) return data.articles;

  return [];
};

const listText = (value) =>
  Array.isArray(value) ? value.join(" ") : "";

const bioType = (item) => {
  const type = item.type || hiddenMeta(item.description).type;

  if (type) return String(type);

  const category = String(item.category || "ceo")
    .toLowerCase()
    .replace(/\s+/g, "");

  if (category.includes("sport")) return "sports";
  if (category.includes("entrepreneur")) return "entrepreneur";

  return "ceo";
};

// All search sources use the common API configuration.
export const SOURCES = [
  {
    type: "Article",
    endpoint: apiUrl("/articles"),
    hidden: () => "",
    title: (item) => item.title,
    subtitle: (item) => item.category,
    description: (item) => item.excerpt || item.description,
    image: (item) => item.image,
    url: (item) =>
      item.id !== undefined && item.id !== null
        ? `/article/${item.id}`
        : "",
    extra: (item) => [
      item.category,
      item.author,
      item.company,
      listText(item.tags),
      item.focusKeyword,
    ],
  },
  {
    type: "Author Article",
    endpoint: apiUrl("/blog-articles"),
    hidden: () => "",
    title: (item) => item.title,
    subtitle: (item) => item.category,
    description: (item) => item.excerpt || item.description,
    image: (item) => item.image,
    url: (item) => (item.slug ? `/articles/${item.slug}` : ""),
    extra: (item) => [
      item.category,
      listText(item.tags),
      item.focusKeyword,
    ],
  },
  {
    type: "Latest Article",
    endpoint: apiUrl("/latest-articles"),
    hidden: (item) => item.content,
    title: (item) => item.title,
    subtitle: (item) => item.category,
    description: (item) => item.excerpt,
    image: (item) => item.image,
    url: (item) =>
      item.slug ? `/latest-article/${item.slug}` : "",
    extra: (item) => [
      item.category,
      item.author,
      listText(item.tags),
    ],
  },
  {
    type: "Company",
    endpoint: apiUrl("/companies"),
    hidden: (item) => item.description,
    title: (item) => item.name,
    subtitle: () => "Company profile",
    description: (item) => item.description,
    image: (item) => item.imageURL,
    url: (item) => (item.slug ? `/company/${item.slug}` : ""),
    extra: (item) => [item.slug],
  },
  {
    type: "Sliding Company",
    endpoint: apiUrl("/sliding-companies"),
    hidden: (item) => item.blog,
    title: (item) => item.name,
    subtitle: (item) => item.tagline,
    description: (item) => item.description,
    image: (item) => item.imageURL,
    url: (item) =>
      item.slug ? `/sliding-company/${item.slug}` : "",
    extra: (item) => [
      item.tagline,
      listText(item.features),
    ],
  },
  {
    type: "Brand / Product",
    endpoint: apiUrl("/brands"),
    hidden: (item) => item.blog || item.articleContent,
    title: (item) =>
      item.name || item.articleTitle || item.title,
    subtitle: (item) =>
      [item.brand, item.subCategory]
        .filter(Boolean)
        .join(" • "),
    description: (item) =>
      item.description || item.shortDescription,
    image: (item) => item.imageUrl,
    url: (item) => (item.slug ? `/brand/${item.slug}` : ""),
    extra: (item) => [
      item.brand,
      item.category,
      item.subCategory,
      listText(item.features),
    ],
  },
  {
    type: "Biography",
    endpoint: apiUrl("/biographies"),
    hidden: (item) => item.description,
    title: (item) => item.name,
    subtitle: (item) =>
      [item.role, item.company].filter(Boolean).join(" • "),
    description: (item) =>
      item.shortBio || item.description,
    image: (item) => item.image,
    url: (item) =>
      item.slug
        ? `/biography/${bioType(item)}/${item.slug}`
        : "",
    extra: (item) => [
      item.role,
      item.company,
      item.birthplace,
      item.category,
    ],
  },
  {
    type: "Author",
    endpoint: apiUrl("/blog-authors"),
    hidden: () => "",
    title: (item) => item.name || item.authorName,
    subtitle: () => "Author",
    description: (item) =>
      item.bio || item.biography || item.about,
    image: (item) =>
      item.imageURL || item.imageUrl || item.image,
    url: (item) => {
      const key = item.id || item._id;
      return key ? `/author/${key}` : "";
    },
    extra: (item) => [item.role],
  },
];

export const SEARCH_TYPES = SOURCES.map(
  (source) => source.type
);

export const TYPE_ICONS = {
  Article: BookOpen,
  "Author Article": PenLine,
  "Latest Article": Newspaper,
  Company: Building2,
  "Sliding Company": Layers,
  "Brand / Product": Package,
  Biography: UserRound,
  Author: UserRound,
};

const toItem = (source, item, index) => {
  const title = cleanText(source.title(item));
  const url = source.url(item);

  if (!title || !url) return null;

  const status =
    item.status ?? hiddenMeta(source.hidden(item)).status;

  if (status === "draft") return null;

  const description = cleanText(source.description(item));

  const text = [
    title,
    description.slice(0, 400),
    ...source.extra(item),
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: `${source.type}-${item._id || item.id || item.slug || index}`,
    type: source.type,
    title,
    titleLower: title.toLowerCase(),
    subtitle: cleanText(source.subtitle(item)),
    description: description.slice(0, 180),
    image: source.image(item) || "",
    url,
    text,
  };
};

async function buildIndex() {
  const responses = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const response = await fetch(source.endpoint);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        return {
          source,
          items: asArray(await response.json()),
          failed: false,
        };
      } catch (error) {
        console.error(
          `Search source failed: ${source.type}`,
          error
        );

        return {
          source,
          items: [],
          failed: true,
        };
      }
    })
  );

  const items = [];
  const failed = [];

  responses.forEach(({ source, items: list, failed: hasFailed }) => {
    if (hasFailed) failed.push(source.type);

    list.forEach((item, index) => {
      const searchItem = toItem(source, item, index);

      if (searchItem) items.push(searchItem);
    });
  });

  return { items, failed };
}

let indexPromise = null;
let loadedAt = 0;

export const loadSearchIndex = () => {
  if (!indexPromise || Date.now() - loadedAt > CACHE_MS) {
    loadedAt = Date.now();

    indexPromise = buildIndex().then((result) => {
      // Retry on the next call if every source failed.
      if (result.failed.length === SOURCES.length) {
        indexPromise = null;
      }

      return result;
    });
  }

  return indexPromise;
};

export const searchWords = (query) =>
  String(query || "")
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

export const searchItems = (
  items,
  query,
  { type = "All", limit } = {}
) => {
  const words = searchWords(query);

  if (!words.length) return [];

  const found = [];

  for (const item of items) {
    if (type !== "All" && item.type !== type) continue;

    let score = 0;
    let matchedAll = true;

    for (const word of words) {
      let wordScore = 0;

      if (item.titleLower === word) wordScore = 12;
      else if (item.titleLower.startsWith(word)) wordScore = 8;
      else if (` ${item.titleLower}`.includes(` ${word}`)) {
        wordScore = 6;
      } else if (item.titleLower.includes(word)) {
        wordScore = 4;
      } else if (item.text.includes(word)) {
        wordScore = 1;
      }

      if (!wordScore) {
        matchedAll = false;
        break;
      }

      score += wordScore;
    }

    if (matchedAll) {
      found.push({ ...item, score });
    }
  }

  found.sort(
    (a, b) =>
      b.score - a.score ||
      a.title.localeCompare(b.title)
  );

  return limit ? found.slice(0, limit) : found;
};