import { SITE_URL } from "../config";

export const ROBOTS_OPTIONS = [
  { value: "index, follow", label: "index, follow" },
  { value: "index, nofollow", label: "index, nofollow" },
  { value: "noindex, follow", label: "noindex, follow" },
  { value: "noindex, nofollow", label: "noindex, nofollow" },
];

export const SCHEMA_OPTIONS = [
  "Article",
  "BlogPosting",
  "NewsArticle",
  "HowTo",
  "FAQPage",
].map((value) => ({ value, label: value }));

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];

export const TWITTER_CARD_OPTIONS = [
  {
    value: "summary_large_image",
    label: "Summary Large Image (Recommended)",
  },
  { value: "summary", label: "Summary" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const emptySeo = {
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  robots: "index, follow",
  schemaType: "BlogPosting",
  language: "en",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
};

const safeString = (value) =>
  value === null || value === undefined ? "" : String(value);

const safeArray = (value) => (Array.isArray(value) ? value : []);

const safeTrim = (value) => safeString(value).trim();

const isBrowser = () =>
  typeof window !== "undefined" &&
  typeof document !== "undefined";

export const slugify = (text) =>
  safeString(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097F\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseHtml = (html) => {
  const source = safeString(html);

  if (typeof DOMParser !== "undefined") {
    return new DOMParser().parseFromString(
      `<body>${source}</body>`,
      "text/html"
    );
  }


  const escaped = source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");

  return {
    body: {
      textContent: escaped,
      querySelectorAll: () => [],
    },
  };
};

export const stripHtml = (html) =>
  safeString(parseHtml(html).body.textContent)
    .replace(/\s+/g, " ")
    .trim();

export const wordCount = (html) => {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).length : 0;
};

export const readingMinutes = (html) =>
  Math.max(1, Math.ceil(wordCount(html) / 200));

export const htmlToParagraphs = (html) => {
  const doc = parseHtml(html);
  const output = [];

  doc.body.querySelectorAll(
    "h1,h2,h3,h4,h5,h6,p,li,blockquote"
  ).forEach((element) => {
    const text = safeString(element.textContent)
      .replace(/\s+/g, " ")
      .trim();

    if (text) output.push(text);
  });

  if (!output.length) {
    const text = stripHtml(html);
    if (text) output.push(text);
  }

  return output;
};

export const extractHeadings = (html) => {
  const doc = parseHtml(html);
  const used = {};

  return [...doc.body.querySelectorAll("h2,h3")]
    .map((element) => {
      const text = safeString(element.textContent).trim();

      if (!text) return null;

      const baseId = slugify(text) || "section";

      used[baseId] = (used[baseId] || 0) + 1;

      const id =
        used[baseId] > 1
          ? `${baseId}-${used[baseId]}`
          : baseId;

      return {
        level: Number(element.tagName[1]),
        text,
        id,
      };
    })
    .filter(Boolean);
};

const clip = (value, length) => {
  const text = safeTrim(value);

  return text.length > length
    ? `${text.slice(0, length - 1).trim()}…`
    : text;
};

const getSiteUrl = () => {
  const configuredUrl = safeTrim(SITE_URL);

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "";
};

const safeUrlPath = (value) =>
  safeString(value)
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");

export function resolveSeo(post = {}, urlPrefix = "", segment = "") {
  const seoInput =
    post.seo && typeof post.seo === "object" && !Array.isArray(post.seo)
      ? post.seo
      : {};

  const seo = {
    ...emptySeo,
    ...seoInput,
  };

  const slug = safeTrim(post.slug) || slugify(post.title);

  const autoMetaTitle = clip(post.title, 60);

  const autoMetaDesc = clip(
    post.excerpt || stripHtml(post.contentHtml),
    160
  );

  const urlPath = safeString(segment || slug).trim();

  const prefix = safeString(urlPrefix)
    .trim()
    .replace(/^\/+|\/+$/g, "");

  const encodedPath = safeUrlPath(urlPath);

  const canonicalPath = [prefix, encodedPath]
    .filter(Boolean)
    .join("/");

  const siteUrl = getSiteUrl();

  const autoCanonical =
    siteUrl && canonicalPath
      ? `${siteUrl}/${canonicalPath}`
      : siteUrl || "";

  const metaTitle =
    safeTrim(seo.metaTitle) || autoMetaTitle;

  const metaDescription =
    safeTrim(seo.metaDescription) || autoMetaDesc;

  const canonicalUrl =
    safeTrim(seo.canonicalUrl) || autoCanonical;

  const ogTitle =
    safeTrim(seo.ogTitle) || metaTitle;

  const ogDescription =
    safeTrim(seo.ogDescription) || metaDescription;

  const ogImage =
    safeTrim(seo.ogImage) || safeTrim(post.image);

  const twitterTitle =
    safeTrim(seo.twitterTitle) || ogTitle;

  const twitterDescription =
    safeTrim(seo.twitterDescription) || ogDescription;

  const twitterImage =
    safeTrim(seo.twitterImage) || ogImage;

  return {
    ...seo,
    slug,
    urlPath,

    auto: {
      metaTitle: autoMetaTitle,
      metaDescription: autoMetaDesc,
      canonicalUrl: autoCanonical,
    },

    metaTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
  };
}

const has = (text, keyword) =>
  Boolean(keyword) &&
  safeString(text)
    .toLowerCase()
    .includes(safeString(keyword).toLowerCase());

export function analyzeSeo(post = {}, resolved = {}) {
  const keyword = safeTrim(post.focusKeyword);
  const html = safeString(post.contentHtml);

  const doc = parseHtml(html);
  const text = stripHtml(html);
  const words = wordCount(html);

  const firstChunk = text
    .split(/\s+/)
    .slice(0, 150)
    .join(" ");

  const headings = [
    ...doc.body.querySelectorAll("h1,h2,h3,h4"),
  ].map((heading) => safeString(heading.textContent));

  const h2count = doc.body.querySelectorAll("h2").length;
  const links = doc.body.querySelectorAll("a[href]").length;

  const images = [
    ...doc.body.querySelectorAll("img"),
  ];

  const keywordSlug = slugify(keyword);

  const keywordCount =
    keyword && text
      ? text.toLowerCase().split(keyword.toLowerCase()).length - 1
      : 0;

  const faqs = safeArray(post.faqs);

  const validFaqCount = faqs.filter(
    (faq) =>
      faq &&
      safeTrim(faq.q) &&
      safeTrim(faq.a)
  ).length;

  const title = safeTrim(post.title);
  const slug = safeTrim(resolved.slug);

  const metaTitle = safeString(resolved.metaTitle);
  const metaDescription = safeString(resolved.metaDescription);
  const robots = safeString(resolved.robots);

  const tags = safeArray(post.tags);
  const secondaryKeywords = safeArray(post.secondaryKeywords);

  const checks = [
    [Boolean(title), "Add a blog title."],

    [
      title.length >= 10,
      "Blog title should be at least 10 characters.",
    ],

    [
      title.length > 0 && title.length <= 70,
      "Blog title is too long (keep it under 70 characters).",
    ],

    [Boolean(slug), "Add a URL slug."],

    [
      Boolean(slug) && slug.length <= 75,
      "URL slug is too long (keep it under 75 characters).",
    ],

    [Boolean(keyword), "Add a focus keyword."],

    [
      has(title, keyword),
      "Add the focus keyword in the blog title.",
    ],

    [
      Boolean(keywordSlug) && slug.includes(keywordSlug),
      "Add the focus keyword in the URL slug.",
    ],

    [
      has(metaTitle, keyword),
      "Add the focus keyword in the meta title.",
    ],

    [
      has(metaDescription, keyword),
      "Add the focus keyword in the meta description.",
    ],

    [
      has(firstChunk, keyword),
      "Use the focus keyword in the first paragraph.",
    ],

    [
      headings.some((heading) => has(heading, keyword)),
      "Use the focus keyword in at least one heading.",
    ],

    [
      keywordCount >= 2,
      "Use the focus keyword at least 2 times in the content.",
    ],

    [
      Boolean(safeTrim(post.excerpt)),
      "Add an excerpt/summary.",
    ],

    [
      metaTitle.length >= 30 && metaTitle.length <= 60,
      "Meta title should be 30–60 characters.",
    ],

    [
      metaDescription.length >= 120 &&
        metaDescription.length <= 160,
      "Meta description should be 120–160 characters.",
    ],

    [
      words >= 300,
      "Write at least 300 words of content.",
    ],

    [
      h2count >= 2,
      "Add at least 2 H2 subheadings.",
    ],

    [
      links >= 1,
      "Add at least one internal or external link.",
    ],

    [
      images.length >= 1,
      "Add at least one image inside the content.",
    ],

    [
      images.length > 0 &&
        images.every((image) =>
          safeTrim(image.getAttribute("alt"))
        ),
      "Add alt text to all images inside the content.",
    ],

    [
      Boolean(safeTrim(post.image)),
      "Add a featured image.",
    ],

    [
      Boolean(safeTrim(post.image)) &&
        Boolean(safeTrim(post.imageAlt)),
      "Add alt text for the featured image.",
    ],

    [
      Boolean(safeTrim(post.category)),
      "Select a category.",
    ],

    [
      tags.length >= 1,
      "Add at least one tag.",
    ],

    [
      secondaryKeywords.length >= 1,
      "Add at least one secondary keyword.",
    ],

    [
      validFaqCount >= 1,
      "Add at least one FAQ (question and answer).",
    ],

    [
      robots.startsWith("index"),
      "Robots meta is set to noindex (page will not appear in Google).",
    ],
  ];

  const passed = checks.filter(([ok]) => ok).length;

  const score = Math.round(
    (passed / checks.length) * 100
  );

  const tips = checks
    .filter(([ok]) => !ok)
    .map(([, tip]) => tip);

  const label =
    score < 40
      ? "Poor"
      : score < 70
        ? "Needs Work"
        : score < 85
          ? "Good"
          : "Excellent";

  const color =
    score < 40
      ? "#ef4444"
      : score < 70
        ? "#f59e0b"
        : score < 85
          ? "#84cc16"
          : "#22c55e";

  return {
    score,
    tips,
    label,
    color,
    total: checks.length,
    passed,
  };
}

export const toLocalInput = (value = new Date()) => {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}`
  );
};

export const formatDisplayDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};