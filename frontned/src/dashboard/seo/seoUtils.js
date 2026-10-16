import { SITE_URL } from "../config";


export const ROBOTS_OPTIONS = [
  { value: "index, follow", label: "index, follow" },
  { value: "index, nofollow", label: "index, nofollow" },
  { value: "noindex, follow", label: "noindex, follow" },
  { value: "noindex, nofollow", label: "noindex, nofollow" },
];
export const SCHEMA_OPTIONS = ["Article", "BlogPosting", "NewsArticle", "HowTo", "FAQPage"]
  .map((v) => ({ value: v, label: v }));
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];
export const TWITTER_CARD_OPTIONS = [
  { value: "summary_large_image", label: "Summary Large Image (Recommended)" },
  { value: "summary", label: "Summary" },
];
export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const emptySeo = {
  metaTitle: "", metaDescription: "", canonicalUrl: "",
  robots: "index, follow", schemaType: "BlogPosting", language: "en",
  ogTitle: "", ogDescription: "", ogImage: "",
  twitterCard: "summary_large_image", twitterTitle: "", twitterDescription: "", twitterImage: "",
};

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ऀ-ॿ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseHtml = (html) => new DOMParser().parseFromString(`<body>${html || ""}</body>`, "text/html");

export const stripHtml = (html) =>
  (parseHtml(html).body.textContent || "").replace(/\s+/g, " ").trim();

export const wordCount = (html) => {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).length : 0;
};


export const readingMinutes = (html) => Math.max(1, Math.ceil(wordCount(html) / 200));


export const htmlToParagraphs = (html) => {
  const doc = parseHtml(html);
  const out = [];
  doc.body.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote").forEach((el) => {
    const t = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (t) out.push(t);
  });
  if (!out.length) {
    const t = stripHtml(html);
    if (t) out.push(t);
  }
  return out;
};


export const extractHeadings = (html) => {
  const doc = parseHtml(html);
  const used = {};
  return [...doc.body.querySelectorAll("h2,h3")]
    .map((el) => {
      const text = (el.textContent || "").trim();
      if (!text) return null;
      let id = slugify(text) || "section";
      used[id] = (used[id] || 0) + 1;
      if (used[id] > 1) id = `${id}-${used[id]}`;
      return { level: Number(el.tagName[1]), text, id };
    })
    .filter(Boolean);
};

const clip = (s, n) => {
  const t = String(s || "").trim();
  return t.length > n ? `${t.slice(0, n - 1).trim()}…` : t;
};


export function resolveSeo(post, urlPrefix = "", segment = "") {
  const seo = { ...emptySeo, ...(post.seo || {}) };
  const slug = post.slug || slugify(post.title);

  const autoMetaTitle = clip(post.title, 60);
  const autoMetaDesc = clip(post.excerpt || stripHtml(post.contentHtml), 160);
  const urlPath = String(segment || slug || "");
  const autoCanonical = urlPath ? `${SITE_URL}${urlPrefix}/${urlPath}` : "";

  const metaTitle = seo.metaTitle.trim() || autoMetaTitle;
  const metaDescription = seo.metaDescription.trim() || autoMetaDesc;
  const canonicalUrl = seo.canonicalUrl.trim() || autoCanonical;
  const ogTitle = seo.ogTitle.trim() || metaTitle;
  const ogDescription = seo.ogDescription.trim() || metaDescription;
  const ogImage = seo.ogImage.trim() || post.image || "";
  const twitterTitle = seo.twitterTitle.trim() || ogTitle;
  const twitterDescription = seo.twitterDescription.trim() || ogDescription;
  const twitterImage = seo.twitterImage.trim() || ogImage;

  return {
    ...seo,
    slug,
    urlPath,
    auto: { metaTitle: autoMetaTitle, metaDescription: autoMetaDesc, canonicalUrl: autoCanonical },
    metaTitle, metaDescription, canonicalUrl,
    ogTitle, ogDescription, ogImage,
    twitterTitle, twitterDescription, twitterImage,
  };
}


const has = (text, kw) => !!kw && String(text || "").toLowerCase().includes(kw.toLowerCase());

export function analyzeSeo(post, resolved) {
  const kw = (post.focusKeyword || "").trim();
  const html = post.contentHtml || "";
  const doc = parseHtml(html);
  const text = stripHtml(html);
  const words = wordCount(html);
  const firstChunk = text.split(/\s+/).slice(0, 150).join(" ");
  const headings = [...doc.body.querySelectorAll("h1,h2,h3,h4")].map((h) => h.textContent || "");
  const h2count = doc.body.querySelectorAll("h2").length;
  const links = doc.body.querySelectorAll("a[href]").length;
  const imgs = [...doc.body.querySelectorAll("img")];
  const kwSlug = slugify(kw);
  const kwCount = kw && text ? text.toLowerCase().split(kw.toLowerCase()).length - 1 : 0;
  const faqOk = (post.faqs || []).filter((f) => f.q.trim() && f.a.trim()).length;
  const title = (post.title || "").trim();
  const slug = resolved.slug || "";

  const checks = [
    [!!title, "Add a blog title."],
    [title.length >= 10, "Blog title should be at least 10 characters."],
    [title.length > 0 && title.length <= 70, "Blog title is too long (keep it under 70 characters)."],
    [!!slug, "Add a URL slug."],
    [!!slug && slug.length <= 75, "URL slug is too long (keep it under 75 characters)."],
    [!!kw, "Add a focus keyword."],
    [has(title, kw), "Add the focus keyword in the blog title."],
    [!!kwSlug && slug.includes(kwSlug), "Add the focus keyword in the URL slug."],
    [has(resolved.metaTitle, kw), "Add the focus keyword in the meta title."],
    [has(resolved.metaDescription, kw), "Add the focus keyword in the meta description."],
    [has(firstChunk, kw), "Use the focus keyword in the first paragraph."],
    [headings.some((h) => has(h, kw)), "Use the focus keyword in at least one heading."],
    [kwCount >= 2, "Use the focus keyword at least 2 times in the content."],
    [!!(post.excerpt || "").trim(), "Add an excerpt/summary."],
    [resolved.metaTitle.length >= 30 && resolved.metaTitle.length <= 60, "Meta title should be 30–60 characters."],
    [resolved.metaDescription.length >= 120 && resolved.metaDescription.length <= 160, "Meta description should be 120–160 characters."],
    [words >= 300, "Write at least 300 words of content."],
    [h2count >= 2, "Add at least 2 H2 subheadings."],
    [links >= 1, "Add at least one internal or external link."],
    [imgs.length >= 1, "Add at least one image inside the content."],
    [imgs.length > 0 && imgs.every((i) => (i.getAttribute("alt") || "").trim()), "Add alt text to all images inside the content."],
    [!!post.image, "Add a featured image."],
    [!!post.image && !!(post.imageAlt || "").trim(), "Add alt text for the featured image."],
    [!!(post.category || "").trim(), "Select a category."],
    [(post.tags || []).length >= 1, "Add at least one tag."],
    [(post.secondaryKeywords || []).length >= 1, "Add at least one secondary keyword."],
    [faqOk >= 1, "Add at least one FAQ (question and answer)."],
    [String(resolved.robots).startsWith("index"), "Robots meta is set to noindex (page will not appear in Google)."],
  ];

  const passed = checks.filter(([ok]) => ok).length;
  const score = Math.round((passed / checks.length) * 100);
  const tips = checks.filter(([ok]) => !ok).map(([, tip]) => tip);
  const label = score < 40 ? "Poor" : score < 70 ? "Needs Work" : score < 85 ? "Good" : "Excellent";
  const color = score < 40 ? "#ef4444" : score < 70 ? "#f59e0b" : score < 85 ? "#84cc16" : "#22c55e";
  return { score, tips, label, color, total: checks.length, passed };
}

export const toLocalInput = (d = new Date()) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
};
export const formatDisplayDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};
