import {
  BookOpen,
  Building2,
  UserRound,
  Package,
  Newspaper,
  Layers,
  PenLine,
} from "lucide-react";


const API = "https://market-hub-blogs-backend.onrender.com/api";


const CACHE_MS = 5 * 60 * 1000;


const decode = (s) => {
  try {
    return JSON.parse(decodeURIComponent(s));
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


export const cleanText = (v) =>
  String(v || "")
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

const listText = (v) => (Array.isArray(v) ? v.join(" ") : "");

const bioType = (x) => {
  const t = x.type || hiddenMeta(x.description).type;
  if (t) return String(t);
  const raw = String(x.category || "ceo").toLowerCase().replace(/\s+/g, "");
  if (raw.includes("sport")) return "sports";
  if (raw.includes("entrepreneur")) return "entrepreneur";
  return "ceo";
};


export const SOURCES = [
  {
    type: "Article",
    endpoint: `${API}/articles`,
    hidden: () => "",
    title: (x) => x.title,
    subtitle: (x) => x.category,
    description: (x) => x.excerpt || x.description,
    image: (x) => x.image,
    url: (x) => (x.id !== undefined && x.id !== null ? `/article/${x.id}` : ""),
    extra: (x) => [x.category, x.author, x.company, listText(x.tags), x.focusKeyword],
  },
  {
    type: "Author Article",
    endpoint: `${API}/blog-articles`,
    hidden: () => "",
    title: (x) => x.title,
    subtitle: (x) => x.category,
    description: (x) => x.excerpt || x.description,
    image: (x) => x.image,
    url: (x) => (x.slug ? `/articles/${x.slug}` : ""),
    extra: (x) => [x.category, listText(x.tags), x.focusKeyword],
  },
  {
    type: "Latest Article",
    endpoint: `${API}/latest-articles`,
    hidden: (x) => x.content,
    title: (x) => x.title,
    subtitle: (x) => x.category,
    description: (x) => x.excerpt,
    image: (x) => x.image,
    url: (x) => (x.slug ? `/latest-article/${x.slug}` : ""),
    extra: (x) => [x.category, x.author, listText(x.tags)],
  },
  {
    type: "Company",
    endpoint: `${API}/companies`,
    hidden: (x) => x.description,
    title: (x) => x.name,
    subtitle: () => "Company profile",
    description: (x) => x.description,
    image: (x) => x.imageURL,
    url: (x) => (x.slug ? `/company/${x.slug}` : ""),
    extra: (x) => [x.slug],
  },
  {
    type: "Sliding Company",
    endpoint: `${API}/sliding-companies`,
    hidden: (x) => x.blog,
    title: (x) => x.name,
    subtitle: (x) => x.tagline,
    description: (x) => x.description,
    image: (x) => x.imageURL,
    url: (x) => (x.slug ? `/sliding-company/${x.slug}` : ""),
    extra: (x) => [x.tagline, listText(x.features)],
  },
  {
    type: "Brand / Product",
    endpoint: `${API}/brands`,
    hidden: (x) => x.blog || x.articleContent,
    title: (x) => x.name || x.articleTitle || x.title,
    subtitle: (x) => [x.brand, x.subCategory].filter(Boolean).join(" • "),
    description: (x) => x.description || x.shortDescription,
    image: (x) => x.imageUrl,
    url: (x) => (x.slug ? `/brand/${x.slug}` : ""),
    extra: (x) => [x.brand, x.category, x.subCategory, listText(x.features)],
  },
  {
    type: "Biography",
    endpoint: `${API}/biographies`,
    hidden: (x) => x.description,
    title: (x) => x.name,
    subtitle: (x) => [x.role, x.company].filter(Boolean).join(" • "),
    description: (x) => x.shortBio || x.description,
    image: (x) => x.image,
    url: (x) => (x.slug ? `/biography/${bioType(x)}/${x.slug}` : ""),
    extra: (x) => [x.role, x.company, x.birthplace, x.category],
  },
  {
    type: "Author",
    endpoint: `${API}/blog-authors`,
    hidden: () => "",
    title: (x) => x.name || x.authorName,
    subtitle: () => "Author",
    description: (x) => x.bio || x.biography || x.about,
    image: (x) => x.imageURL || x.imageUrl || x.image,
    url: (x) => {
      const key = x.id || x._id;
      return key ? `/author/${key}` : "";
    },
    extra: (x) => [x.role],
  },
];

export const SEARCH_TYPES = SOURCES.map((s) => s.type);

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

const toItem = (source, x, index) => {
  const title = cleanText(source.title(x));
  const url = source.url(x);
  if (!title || !url) return null;

  const status = x.status ?? hiddenMeta(source.hidden(x)).status;
  if (status === "draft") return null;

  const description = cleanText(source.description(x));
  const text = [title, description.slice(0, 400), ...source.extra(x)]
    .map(cleanText)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: `${source.type}-${x._id || x.id || x.slug || index}`,
    type: source.type,
    title,
    titleLower: title.toLowerCase(),
    subtitle: cleanText(source.subtitle(x)),
    description: description.slice(0, 180),
    image: source.image(x) || "",
    url,
    text,
  };
};

async function buildIndex() {
  const responses = await Promise.all(
    SOURCES.map(async (source) => {
      try {
        const res = await fetch(source.endpoint);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return { source, items: asArray(await res.json()), failed: false };
      } catch (error) {
        console.error(`Search source failed: ${source.type}`, error);
        return { source, items: [], failed: true };
      }
    })
  );

  const items = [];
  const failed = [];

  responses.forEach(({ source, items: list, failed: hasFailed }) => {
    if (hasFailed) failed.push(source.type);
    list.forEach((x, index) => {
      const item = toItem(source, x, index);
      if (item) items.push(item);
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
      // Sab sources fail hue ho to agli baar dobara try karo
      if (result.failed.length === SOURCES.length) indexPromise = null;
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

export const searchItems = (items, query, { type = "All", limit } = {}) => {
  const words = searchWords(query);
  if (!words.length) return [];

  const found = [];

  for (const item of items) {
    if (type !== "All" && item.type !== type) continue;

    let score = 0;
    let matchedAll = true;

    for (const word of words) {
      let s = 0;
      if (item.titleLower === word) s = 12;
      else if (item.titleLower.startsWith(word)) s = 8;
      else if (` ${item.titleLower}`.includes(` ${word}`)) s = 6;
      else if (item.titleLower.includes(word)) s = 4;
      else if (item.text.includes(word)) s = 1;

      if (!s) {
        matchedAll = false;
        break;
      }
      score += s;
    }

    if (matchedAll) found.push({ ...item, score });
  }

  found.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return limit ? found.slice(0, limit) : found;
};