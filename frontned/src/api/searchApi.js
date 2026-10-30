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

const STORE_PREFIX = "search_index_v2:";
const FRESH_MS = 10 * 60 * 1000; // reuse cached data for 10 minutes
const RETRY_MS = 30 * 1000; // wait before retrying a failed source
const TIMEOUT_MS = 60 * 1000; // slow APIs get enough time to answer

/* ---------- Text helpers ---------- */

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
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const asArray = (data) =>
  [data, data?.data, data?.items, data?.results, data?.articles].find(
    Array.isArray
  ) || [];

const listText = (value) => (Array.isArray(value) ? value.join(" ") : "");

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

/* ---------- Sources ---------- */

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
      item.id !== undefined && item.id !== null ? `/article/${item.id}` : "",
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
    extra: (item) => [item.category, listText(item.tags), item.focusKeyword],
  },
  {
    type: "Latest Article",
    endpoint: apiUrl("/latest-articles"),
    hidden: (item) => item.content,
    title: (item) => item.title,
    subtitle: (item) => item.category,
    description: (item) => item.excerpt,
    image: (item) => item.image,
    url: (item) => (item.slug ? `/latest-article/${item.slug}` : ""),
    extra: (item) => [item.category, item.author, listText(item.tags)],
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
    url: (item) => (item.slug ? `/sliding-company/${item.slug}` : ""),
    extra: (item) => [item.tagline, listText(item.features)],
  },
  {
    type: "Brand / Product",
    endpoint: apiUrl("/brands"),
    hidden: (item) => item.blog || item.articleContent,
    title: (item) => item.name || item.articleTitle || item.title,
    subtitle: (item) =>
      [item.brand, item.subCategory].filter(Boolean).join(" • "),
    description: (item) => item.description || item.shortDescription,
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
    subtitle: (item) => [item.role, item.company].filter(Boolean).join(" • "),
    description: (item) => item.shortBio || item.description,
    image: (item) => item.image,
    url: (item) =>
      item.slug ? `/biography/${bioType(item)}/${item.slug}` : "",
    extra: (item) => [item.role, item.company, item.birthplace, item.category],
  },
  {
    type: "Author",
    endpoint: apiUrl("/blog-authors"),
    hidden: () => "",
    title: (item) => item.name || item.authorName,
    subtitle: () => "Author",
    description: (item) => item.bio || item.biography || item.about,
    image: (item) => item.imageURL || item.imageUrl || item.image,
    url: (item) => {
      const key = item.id || item._id;
      return key ? `/author/${key}` : "";
    },
    extra: (item) => [item.role],
  },
];

export const SEARCH_TYPES = SOURCES.map((source) => source.type);

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

/* ---------- Normalize one record ---------- */

const toItem = (source, item, index) => {
  const title = cleanText(source.title(item));
  const url = source.url(item);
  if (!title || !url) return null;

  const status = item.status ?? hiddenMeta(source.hidden(item)).status;
  if (status === "draft") return null;

  const description = cleanText(source.description(item));

  const text = [title, description.slice(0, 400), ...source.extra(item)]
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

/* ---------- Per-source cache (memory + localStorage) ---------- */

const entries = new Map(); // type -> { items, savedAt, failed, failedAt, pending }

const readStored = (type) => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORE_PREFIX + type) || "null"
    );
    if (stored && Array.isArray(stored.items)) return stored;
  } catch {
    // storage blocked or corrupted: start empty
  }
  return null;
};

const writeStored = (type, items, savedAt) => {
  try {
    localStorage.setItem(
      STORE_PREFIX + type,
      JSON.stringify({ items, savedAt })
    );
  } catch {
    // storage full or blocked: memory cache is enough
  }
};

const getEntry = (type) => {
  if (!entries.has(type)) {
    const stored = readStored(type);

    entries.set(type, {
      items: stored?.items || [],
      savedAt: stored?.savedAt || 0,
      failed: false,
      failedAt: 0,
      pending: null,
    });
  }

  return entries.get(type);
};

const collectItems = () =>
  SOURCES.flatMap((source) => getEntry(source.type).items);

export const getCachedIndex = () => {
  const items = collectItems();
  return items.length ? items : null;
};

/* ---------- Loading ---------- */

async function fetchItems(source) {
  const response = await fetch(source.endpoint, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return asArray(await response.json())
    .map((item, index) => toItem(source, item, index))
    .filter(Boolean);
}

const refreshSource = (source, force) => {
  const entry = getEntry(source.type);
  const now = Date.now();

  if (entry.pending) return entry.pending;

  const isFresh = now - entry.savedAt < FRESH_MS;
  const isCoolingDown = entry.failed && now - entry.failedAt < RETRY_MS;

  if (!force && (isFresh || isCoolingDown)) return Promise.resolve(entry);

  entry.pending = fetchItems(source)
    .then((items) => {
      entry.items = items;
      entry.savedAt = Date.now();
      entry.failed = false;
      writeStored(source.type, items, entry.savedAt);
    })
    .catch((error) => {
      // Keep the last known items so search still works for this source.
      console.error(`Search source failed: ${source.type}`, error);
      entry.failed = true;
      entry.failedAt = Date.now();
    })
    .then(() => {
      entry.pending = null;
      return entry;
    });

  return entry.pending;
};

/**
 * Loads all sources in parallel.
 * onProgress(items) runs each time a source finishes, so results can be
 * shown without waiting for the slowest API.
 */
export const loadSearchIndex = async (force = false, onProgress) => {
  await Promise.all(
    SOURCES.map((source) =>
      refreshSource(source, force).then(() => onProgress?.(collectItems()))
    )
  );

  return {
    items: collectItems(),
    failed: SOURCES.filter((source) => getEntry(source.type).failed).map(
      (source) => source.type
    ),
  };
};

/* ---------- Search ---------- */

export const searchWords = (query) =>
  String(query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);

const scoreWord = (item, word) => {
  if (item.titleLower === word) return 12;
  if (item.titleLower.startsWith(word)) return 8;
  if (` ${item.titleLower}`.includes(` ${word}`)) return 6;
  if (item.titleLower.includes(word)) return 4;
  if (item.text.includes(word)) return 1;
  return 0;
};

export const searchItems = (items, query, { type = "All", limit } = {}) => {
  const words = searchWords(query);
  if (!words.length) return [];

  const found = [];

  for (const item of items) {
    if (type !== "All" && item.type !== type) continue;

    let score = 0;
    let matchedAll = true;

    for (const word of words) {
      const wordScore = scoreWord(item, word);

      if (!wordScore) {
        matchedAll = false;
        break;
      }

      score += wordScore;
    }

    if (matchedAll) found.push({ ...item, score });
  }

  found.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return limit ? found.slice(0, limit) : found;
};