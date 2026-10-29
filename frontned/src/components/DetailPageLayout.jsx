import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, User,
} from "lucide-react";
import SeoHead from "../components/SeoHead";
import ArticleBody from "../components/ArticleBody";
import ArticleCard from "../components/ArticleCard";
import { fetchBrand } from "../api/brandApi";
import { fetchLatestArticle, fetchLatestArticles } from "../api/latestArticleApi";
import { API as DASH_API } from "../dashboard/config";
import { fetchSlidingCompany } from "../api/slidingCompanyApi";

const COMPANY_API = "https://market-hub-blogs-backend.onrender.com/api";
const APP_API = COMPANY_API;


const isLive = (x) => x && x.status !== "draft";
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const COMPANY_PACK = /<!--COMPANY_PACK:([\s\S]*?)-->/;
const readPack = (s) => {
  const m = COMPANY_PACK.exec(String(s || ""));
  if (!m) return {};
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return {}; }
};
const stripPack = (s) => String(s || "").replace(COMPANY_PACK, "").trim();

const toText = (s) =>
  String(s || "")
    .replace(COMPANY_PACK, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const fmtDate = (v, month = "short") => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month, year: "numeric" });
};


const getList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["items", "articles", "companies", "results", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload[key] && typeof payload[key] === "object") {
      for (const k of ["items", "articles", "companies", "results"]) {
        if (Array.isArray(payload[key][k])) return payload[key][k];
      }
    }
  }
  return [];
};

/* ====================== BRAND ====================== */
const FAQ_START = "<!--BIO_FAQ_START-->";
const META_RE = /<!--BIO_META:([\s\S]*?)-->/;
const FAQ_JSON_RE = /<!--BIO_FAQ_JSON:([\s\S]*?)-->/;

const unpackBlog = (blog) => {
  const raw = String(blog || "");
  const start = raw.indexOf(FAQ_START);
  const html = (start === -1 ? raw : raw.slice(0, start)).replace(META_RE, "").trim();
  let meta = {};
  let faqs = [];
  const mm = META_RE.exec(raw);
  if (mm) { try { meta = JSON.parse(decodeURIComponent(mm[1])); } catch { meta = {}; } }
  const fm = FAQ_JSON_RE.exec(raw);
  if (fm) { try { faqs = JSON.parse(decodeURIComponent(fm[1])); } catch { faqs = []; } }
  return { html, faqs, meta, isHtml: /<\w+[^>]*>/.test(html) };
};

const buildBrandView = (item) => {
  const { html, faqs, meta, isHtml } = unpackBlog(item.blog || item.articleContent);
  const title = item.name || item.articleTitle || item.title;
  const description = item.description || item.shortDescription;
  return {
    ...item,
    title,
    excerpt: description,
    image: item.imageUrl,
    blog: html,
    contentHtml: item.contentHtml || (isHtml ? html : ""),
    faqs: item.faqs?.length ? item.faqs : faqs,
    faqEnabled: item.faqEnabled || faqs.length > 0,
    showToc: item.showToc ?? meta.showToc ?? true,
    status: item.status ?? meta.status,
    imageAlt: item.imageAlt ?? meta.imageAlt,
    focusKeyword: item.focusKeyword ?? meta.focusKeyword,
    secondaryKeywords: item.secondaryKeywords ?? meta.secondaryKeywords,
    tags: item.tags ?? meta.tags,
    publishDate: item.publishDate ?? meta.publishDate,
    readTime: item.readTime ?? meta.readTime,
    seo: item.seo ?? meta.seo,
  };
};

async function loadBrand(slug, { alive, onItem, onSections }) {
  const data = await fetchBrand(slug);
  if (!alive()) return;
  const cur = data.item;
  onItem(cur);

  let items = (data.related || []).filter(isLive);
  let fallback = false;


  if (!items.length) {
    try {
      const all = await (await fetch(`${DASH_API}/brands`)).json();
      const score = (b) => (b.brand === cur.brand ? 2 : 0) + (b.category === cur.category ? 1 : 0);
      items = (Array.isArray(all) ? all : [])
        .filter((b) => isLive(b) && b._id !== cur._id && b.slug !== cur.slug)
        .sort((a, b) => score(b) - score(a))
        .slice(0, 8);
      fallback = items.length > 0;
    } catch { /* ignore */ }
  }
  if (!alive()) return;

  onSections([
    {
      eyebrow: fallback ? "You may also like" : "Keep exploring",
      title: "Related Articles",
      subtitle: "Discover more insights, ideas and guides selected for you.",
      items: items.map((p) => {
        const rt = p.readTime;
        return {
          key: p._id || p.id,
          to: window.location.pathname.replace(slug, p.slug),
          image: p.imageUrl,
          imageAlt: p.imageAlt,
          title: p.name || p.articleTitle || p.title,
          badge: p.brand || p.category,
          author: p.author?.name || p.author || "Admin",
          readTime: rt ? (/^\d+$/.test(String(rt)) ? `${rt} min read` : String(rt)) : "4 min read",
        };
      }),
    },
  ]);
}

/* ====================== COMPANY ====================== */
const ARTICLE_BASE = "/article";
const articleLink = (a) =>
  a.__source === "latest"
    ? `/latest-article/${a.slug || a._id}`
    : `${ARTICLE_BASE}/${a.id ?? a.slug ?? a._id}`;

const valuesFrom = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(valuesFrom);
  if (typeof value === "object") {
    return [value.slug, value.name, value.companyName, value.title, value._id, value.id].filter(Boolean);
  }
  return [value];
};

const articleImage = (a) => {
  const img = a?.image || a?.imageURL || a?.featuredImage || a?.bannerImage || a?.thumbnail || "";
  if (typeof img === "string") return img;
  return img?.url || img?.secure_url || img?.src || "";
};
const articleDate = (a) => a?.publishDate || a?.publishedAt || a?.createdAt || null;
const articleTime = (a) => {
  const t = new Date(articleDate(a)).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const buildCompanyView = (company) => {
  const pack = readPack(company.description);
  const m = pack.meta || {};
  return {
    ...company,
    description: stripPack(company.description),
    title: company.name,
    excerpt: stripPack(company.description),
    image: company.imageURL,
    contentHtml: pack.html || company.contentHtml || "",
    faqs: pack.faqs ?? company.faqs ?? [],
    faqEnabled: pack.faqEnabled ?? company.faqEnabled ?? false,
    showToc: m.showToc ?? company.showToc ?? true,
    status: m.status ?? company.status,
    imageAlt: m.imageAlt ?? company.imageAlt,
    focusKeyword: m.focusKeyword ?? company.focusKeyword,
    secondaryKeywords: m.secondaryKeywords ?? company.secondaryKeywords,
    tags: m.tags ?? company.tags,
    publishDate: m.publishDate ?? company.publishDate,
    readTime: m.readTime ?? company.readTime,
    seo: m.seo ?? company.seo,
  };
};

const makeCompanyMatcher = (c) => {
  const slugKey = norm(c.slug);
  const nameKey = norm(c.name);
  const companyId = String(c._id || c.id || "");
  const hasRange =
    c.startId != null && c.endId != null &&
    Number.isFinite(Number(c.startId)) && Number.isFinite(Number(c.endId));
  const startId = Number(c.startId);
  const endId = Number(c.endId);

  const matchesValue = (value) =>
    valuesFrom(value).some((entry) => {
      const key = norm(entry);
      if (!key) return false;
      if (key === slugKey || key === nameKey) return true;
      if (slugKey.length >= 5 && key.startsWith(slugKey)) return true;
      if (nameKey.length >= 5 && key.startsWith(nameKey)) return true;
      if (key.length >= 5 && slugKey.startsWith(key)) return true;
      if (key.length >= 5 && nameKey.startsWith(key)) return true;
      return false;
    });

  return (a) => {
    if (!a) return false;
    const structured = [
      a.companySlug, a.companyName, a.company, a.relatedCompany,
      a.relatedCompanies, a.companyId, a.brand, a.brands,
    ];
    if (structured.some(matchesValue)) return true;
    if (matchesValue(a.category) || matchesValue(a.tags) || matchesValue(a.keywords)) return true;

    const titleKey = norm(a.title);
    const slugOfArticle = norm(a.slug);
    if (
      (slugKey.length >= 5 && titleKey.startsWith(slugKey)) ||
      (nameKey.length >= 5 && titleKey.startsWith(nameKey)) ||
      (slugKey.length >= 5 && slugOfArticle.startsWith(slugKey)) ||
      (nameKey.length >= 5 && slugOfArticle.startsWith(nameKey))
    ) return true;

    const n = Number(a.id);
    if (hasRange && Number.isFinite(n) && n >= startId && n <= endId) return true;

    const articleCompanyId = String(a.companyId || a.company?._id || a.company?.id || "");
    return Boolean(companyId && articleCompanyId && articleCompanyId === companyId);
  };
};

async function loadCompany(slug, { alive, onItem, onSections }) {
  // 1) company
  let c = null;
  try {
    const res = await fetch(`${COMPANY_API}/companies/${slug}`);
    if (res.ok) {
      const data = await res.json();
      const item = data?.item || data?.company || data;
      if (item && item.slug) c = item;
    }
  } catch { /* fallback neeche */ }

  if (!c) {
    const res = await fetch(`${COMPANY_API}/companies`);
    if (res.ok) c = getList(await res.json()).find((x) => x.slug === slug) || null;
  }
  if (!c) throw new Error("not found");
  if (!alive()) return;
  onItem(c);

  let articleSection = null;
  let companySection = null;
  const push = () => alive() && onSections([articleSection, companySection].filter(Boolean));

  // 2) isi company ke articles
  try {
    const endpoints = [
      { url: `${COMPANY_API}/articles`, source: "article" },
      { url: `${COMPANY_API}/latest-articles?all=true`, source: "latest" },
    ];
    const responses = await Promise.allSettled(
      endpoints.map(async ({ url, source }) => {
        const res = await fetch(url);
        if (!res.ok) return [];
        return getList(await res.json()).map((it) => ({ ...it, __source: source }));
      })
    );
    const all = responses.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const matches = makeCompanyMatcher(c);

    const seen = new Set();
    const list = all
      .filter((a) => isLive(a) && matches(a))
      .filter((a) => {
        const key = String(a._id || a.slug || a.id || "");
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => articleTime(b) - articleTime(a) || Number(b.id || 0) - Number(a.id || 0));

    if (list.length) {
      articleSection = {
        eyebrow: "Related Articles",
        title: `More about ${c.name}`,
        countLabel: `${list.length} ${list.length === 1 ? "article" : "articles"}`,
        items: list.slice(0, 12).map((a) => ({
          key: a._id || a.id || a.slug,
          to: articleLink(a),
          image: articleImage(a),
          imageAlt: a.imageAlt,
          title: a.title,
          text: toText(a.excerpt || a.shortDescription || a.description || a.contentHtml),
          date: fmtDate(articleDate(a)),
        })),
      };
      push();
    }
  } catch (err) {
    console.error("Error fetching related articles:", err);
  }

  // 3) same category ki companies
  try {
    const res = await fetch(`${COMPANY_API}/companies`);
    if (res.ok) {
      const catKey = norm(c.category);
      const others = getList(await res.json())
        .filter((x) => x && x.slug && x.slug !== c.slug && isLive(x) && catKey && norm(x.category) === catKey)
        .slice(0, 12);
      if (others.length) {
        companySection = {
          eyebrow: "Keep Exploring",
          title: "Related Companies",
          items: others.map((x) => ({
            key: x._id || x.slug,
            to: `/company/${x.slug}`,
            image: x.imageURL,
            title: x.name,
            text: toText(x.description),
            cta: "View Articles",
          })),
        };
        push();
      }
    }
  } catch (err) {
    console.error("Error fetching related companies:", err);
  }
}

/* ====================== LATEST ARTICLE ====================== */
const buildLatestView = (raw) => {
  const pack = readPack(raw.content);
  const meta = pack.meta || {};
  const faqs = pack.faqs || [];
  return {
    ...raw,
    content: stripPack(raw.content),
    contentHtml: pack.html || raw.contentHtml || "",
    faqs: faqs.length ? faqs : raw.faqs || [],
    faqEnabled: faqs.length > 0 || !!raw.faqEnabled,
    showToc: raw.showToc ?? meta.showToc ?? true,
    status: raw.status ?? meta.status,
    imageAlt: raw.imageAlt ?? meta.imageAlt,
    focusKeyword: raw.focusKeyword ?? meta.focusKeyword,
    secondaryKeywords: raw.secondaryKeywords ?? meta.secondaryKeywords,
    tags: raw.tags ?? meta.tags,
    publishDate: raw.publishDate ?? meta.publishDate,
    seo: raw.seo ?? meta.seo,
  };
};


const renderInline = (text = "") =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-bold text-stone-950">{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );


const renderContent = (content = "") =>
  String(content)
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("### ")) {
        return (
          <h2 key={index} className="mb-4 mt-10 font-serif text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">
            {block.replace(/^###\s+/, "")}
          </h2>
        );
      }
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) {
        return (
          <ul key={index} className="my-6 space-y-3">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-3 leading-7">
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>{renderInline(line.slice(2))}</span>
              </li>
            ))}
          </ul>
        );
      }
      return <p key={index} className="my-5 whitespace-pre-line">{renderInline(block)}</p>;
    });

async function loadLatest(slug, { alive, onItem, onSections }) {
  const relatedPromise = fetchLatestArticles().catch((e) => {
    console.error("Related articles error:", e);
    return [];
  });

  const article = await fetchLatestArticle(slug);
  if (!article) throw new Error("not found");
  if (!alive()) return;
  onItem(article);

  const all = await relatedPromise;
  if (!alive() || !Array.isArray(all)) return;

  const cat = article.category;
  const items = all
    .filter((a) => isLive(a) && a.slug !== slug)
    .sort((a, b) => Number(b.category === cat) - Number(a.category === cat))
    .slice(0, 6);

  onSections([
    {
      eyebrow: "Keep Exploring",
      title: "Related Articles",
      subtitle: "Discover more insights, ideas and guides selected for you.",
      items,
      renderCard: (a) => (
        <div className="h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <ArticleCard article={a} basePath="/latest-article" />
        </div>
      ),
    },
  ]);
}
/* ====================== SLIDING COMPANY ====================== */
const buildSlidingView = (item) => {
  const { html, faqs, meta, isHtml } = unpackBlog(item.blog);
  return {
    ...item,
    title: item.name,
    excerpt: item.description,
    image: item.imageURL,
    blog: html,
    contentHtml: item.contentHtml || (isHtml ? html : ""),
    faqs: item.faqs?.length ? item.faqs : faqs,
    faqEnabled: item.faqEnabled || faqs.length > 0,
    showToc: item.showToc ?? meta.showToc ?? true,
    status: item.status ?? meta.status,
    imageAlt: item.imageAlt ?? meta.imageAlt,
    focusKeyword: item.focusKeyword ?? meta.focusKeyword,
    secondaryKeywords: item.secondaryKeywords ?? meta.secondaryKeywords,
    tags: item.tags ?? meta.tags,
    publishDate: item.publishDate ?? meta.publishDate,
    readTime: item.readTime ?? meta.readTime,
    seo: item.seo ?? meta.seo,
  };
};

async function loadSliding(slug, { alive, onItem }) {
  const data = await fetchSlidingCompany(slug);
  if (!data) throw new Error("not found");
  if (!alive()) return;
  onItem(data);
}

/* ====================== ARTICLE (/article/:id) ====================== */
const DEFAULT_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" fill="#6b7280">Image unavailable</text></svg>`
  );

// retryable = network/server error (Not Found nahi), isse "Try Again" dikhega
const retryable = (msg) => Object.assign(new Error(msg), { retryable: true });

const getArticleId = (a) => String(a?._id ?? a?.id ?? "");

const getArticleData = (r) => r?.article || r?.data?.article || r?.data || r;

const getAuthorName = (a) => {
  const author = a?.author;
  if (typeof author === "string" && author.trim()) return author;
  if (author && typeof author === "object") {
    return author.name || author.fullName || author.username || "Editorial Team";
  }
  return (
    a?.authorName ||
    (typeof a?.authorId === "string" ? a.authorId : "") ||
    a?.authorId?.name ||
    "Editorial Team"
  );
};

const getReadTime = (a) => {
  if (a?.readTime) {
    return typeof a.readTime === "number" ? `${a.readTime} min read` : a.readTime;
  }
  const content = [
    a?.description || "",
    a?.contentHtml?.replace(/<[^>]*>/g, " ") || "",
    Array.isArray(a?.content) ? a.content.join(" ") : a?.content || "",
  ].join(" ");
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const getImageUrl = (a) => {
  const img = a?.image || a?.featuredImage || a?.thumbnail || a?.imageUrl;
  return typeof img === "string" && img.trim() ? img.trim() : DEFAULT_IMAGE;
};

const buildArticleView = (a) => ({
  ...a,
  title: a.title || "Untitled Article",
  image: getImageUrl(a),
});

const articleParagraphs = (c) =>
  (Array.isArray(c) ? c : typeof c === "string" ? [c] : []).filter(
    (p) => typeof p === "string" && p.trim()
  );

async function loadArticle(id, { alive, signal, onItem, onSections }) {
  if (!id || !String(id).trim()) throw new Error("not found");

  let res;
  try {
    res = await fetch(`${APP_API}/articles/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw retryable("Please check your internet connection and try again.");
  }

  if (res.status === 404) throw new Error("not found");
  if (!res.ok) throw retryable(`Request failed (${res.status}).`);

  const cur = getArticleData(await res.json());
  if (
    !cur ||
    typeof cur !== "object" ||
    cur.message ||
    cur.error ||
    (!cur._id && !cur.id && !cur.title)
  ) {
    throw new Error("not found");
  }
  if (!alive()) return;
  onItem(cur);


  try {
    const rRes = await fetch(`${APP_API}/articles`, {
      headers: { Accept: "application/json" },
      signal,
    });
    if (!rRes.ok) throw new Error(`Related request failed (${rRes.status}).`);
    const all = getList(await rRes.json());
    if (!alive()) return;

    const curId = getArticleId(cur);
    const cat = String(cur.category || "").toLowerCase();
    const sameCat = (x) => cat && String(x.category || "").toLowerCase() === cat;

    const filtered = all.filter((x) => {
      if (!x || typeof x !== "object") return false;
      const xid = getArticleId(x);
      return xid && xid !== curId && xid !== String(id);
    });

    const items = [...filtered.filter(sameCat), ...filtered.filter((x) => !sameCat(x))].slice(0, 10);

    onSections([
      {
        eyebrow: "Keep Exploring",
        title: "Related Articles",
        items,
        renderCard: (a) => <ArticleCard article={a} />,
      },
    ]);
  } catch (e) {
    if (e.name !== "AbortError") console.error("Related articles error:", e);
  }
}

const CONFIG = {
  brand: {
    load: loadBrand,
    build: buildBrandView,
    loadingText: "Loading article & insights...",
    notFoundTitle: "Article / Product Not Found",
    notFoundText: "The information or article you are looking for could not be found or has been removed.",
    backTo: "/",
    backLabel: "Back to Home",
    props: (v) => ({
      badge: v.brand || "Brand",
      category: v.category,
      meta: [{ text: v.subCategory }, { text: v.date }, { text: v.readTime }],
      image: v.imageUrl,
      imageAlt: v.imageAlt,
      summary: v.excerpt,
      summaryLabel: "Overview",
      bodyTitle: `About ${v.title}`,
      fallbackBody: v.blog ? <div className="space-y-4 whitespace-pre-line font-light">{v.blog}</div> : null,
      features: v.features || [],
    }),
  },
  company: {
    load: loadCompany,
    build: buildCompanyView,
    loadingText: "Loading company...",
    notFoundTitle: "Company Not Found",
    notFoundText: "The company you are looking for could not be found or has been removed.",
    backTo: "/companies",
    backLabel: "Back to Companies",
    props: (v) => ({
      badge: "Company Profile",
      category: v.category,
      meta: [
        { Icon: CalendarDays, text: fmtDate(v.publishDate, "long") },
        { Icon: Clock, text: v.readTime },
      ],
      image: v.imageURL,
      imageAlt: v.imageAlt || v.name,
      imageFit: "cover",
      summary: v.description,
      bodyEyebrow: "About the company",
      bodyTitle: `About ${v.name}`,
    }),
  },
  latest: {
    load: loadLatest,
    build: buildLatestView,
    loadingText: "Loading article...",
    notFoundTitle: "Article Not Found",
    notFoundText: "This article does not exist, is a draft, or is currently unavailable.",
    backTo: "/",
    backLabel: "Back to Home",
    props: (v) => ({
      category: v.category,
      meta: [
        { Icon: User, text: v.author },
        { Icon: CalendarDays, text: v.date },
        { Icon: Clock, text: v.readTime },
      ],
      image: v.image,
      imageAlt: v.imageAlt || v.title,
      summary: v.excerpt,
      fallbackBody: v.content ? renderContent(v.content) : null,
    }),
  },
    sliding: {
    load: loadSliding,
    build: buildSlidingView,
    loadingText: "Loading...",
    notFoundTitle: "Company Not Found",
    notFoundText: "The company you are looking for could not be found or has been removed.",
    backTo: "/",
    backLabel: "Back to Home",
    props: (v) => ({
      badge: v.tagline,
      image: v.imageURL,
      imageAlt: v.imageAlt || v.name,
      summary: v.description,
      fallbackBody: v.blog ? <div className="whitespace-pre-line">{v.blog}</div> : null,
      features: v.features || [],
    }),
  },
  article: {
    load: loadArticle,
    build: buildArticleView,
    loadingText: "Loading article...",
    notFoundTitle: "Article Not Found",
    notFoundText: "This article may have been removed or the link may be incorrect.",
    backTo: "/",
    backLabel: "Back to Home",
    props: (v) => {
      const paras = articleParagraphs(v.content);
      return {
        category: typeof v.category === "string" ? v.category : "Article",
        meta: [
          { text: `By ${getAuthorName(v)}` },
          { Icon: CalendarDays, text: fmtDate(v.publishedAt || v.date || v.createdAt, "long") },
          { Icon: Clock, text: getReadTime(v) },
        ],
        image: v.image,
        imageAlt: v.title,
        imageFit: "cover",
        summary: v.description,
        fallbackBody: paras.length ? (
          <div className="space-y-4">
            {paras.map((t, i) => (
              <p key={i}>{t.trim()}</p>
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Article content is not available.</p>
        ),
      };
    },
  },
};

/* ====================== UI PIECES ====================== */
const ARROW_BTN =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95";
const CARD_WIDTH = "w-[82%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]";
const EYEBROW = "text-[11px] font-bold uppercase tracking-widest text-amber-700";

function RelatedCard({ c }) {
  return (
    <Link
      to={c.to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
        {c.image ? (
          <img
            src={c.image}
            alt={c.imageAlt || c.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-300">
            <FileText className="h-10 w-10" />
          </div>
        )}
        {c.badge && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full border border-stone-200 bg-white/95 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-800 shadow-sm">
            {c.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {c.date && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
            <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
            {c.date}
          </span>
        )}
        <h3 className="mt-2 line-clamp-2 font-serif text-lg font-bold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">
          {c.title}
        </h3>
        {c.text && <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{c.text}</p>}

        {(c.author || c.readTime) && (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-500">
            {c.author && <span className="font-semibold text-stone-800">{c.author}</span>}
            {c.readTime && (
              <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[10px] font-medium">{c.readTime}</span>
            )}
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-wider text-amber-700">
          {c.cta || "Read Article"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function RelatedSection({ section }) {
  const ref = useRef(null);
  const { items = [], renderCard } = section;
  if (!items.length) return null;

  const move = (dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild;
    el.scrollBy({ left: dir * (card ? card.offsetWidth + 20 : 340), behavior: "smooth" });
  };

  return (
    <section className="mt-14 border-t border-stone-200 pt-12 sm:mt-16 sm:pt-14">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          {section.eyebrow && <span className={EYEBROW}>{section.eyebrow}</span>}
          <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">{section.title}</h2>
          {section.subtitle && <p className="mt-1.5 text-xs text-stone-500 sm:text-sm">{section.subtitle}</p>}
          <div className="mt-3 h-1 w-14 rounded-full bg-amber-500" />
        </div>
        {section.countLabel && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            {section.countLabel}
          </span>
        )}
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <div key={it.key || it._id || it.slug || i} className={CARD_WIDTH}>
            {renderCard ? renderCard(it) : <RelatedCard c={it} />}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button type="button" onClick={() => move(-1)} aria-label="Previous" className={ARROW_BTN}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next" className={ARROW_BTN}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}

export default function DetailPage({ type = "latest" }) {
  const params = useParams();
  const slug = params.slug ?? params.id; 
  const cfg = CONFIG[type] || CONFIG.latest;

  const [item, setItem] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    setNotFound(false);
    setError("");
    setItem(null);
    setSections([]);

    cfg
      .load(slug, {
        alive: () => active,
        signal: controller.signal,
        onItem: (data) => {
          if (!active) return;
          setItem(data);
          setLoading(false);
        },
        onSections: (list) => active && setSections(list),
      })
      .catch((err) => {
        if (!active || err?.name === "AbortError") return;
        console.error(`${type} detail error:`, err);
        if (err?.retryable) setError(err.message);
        else setNotFound(true);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, type, reloadKey]); 

  const view = useMemo(() => (item ? cfg.build(item) : null), [item, cfg]);


  if (!loading && error) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl font-bold text-red-600">
          !
        </div>
        <h1 className="mb-3 font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
          Unable to Load
        </h1>
        <p className="mb-7 max-w-lg text-sm text-stone-600">{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
          >
            Try Again
          </button>
          <Link
            to={cfg.backTo}
            className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            {cfg.backLabel}
          </Link>
        </div>
      </main>
    );
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span>{cfg.loadingText}</span>
        </div>
      </main>
    );
  }


  if (notFound || !view || !isLive(view)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-600">
            !
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">{cfg.notFoundTitle}</h2>
          <p className="mt-2 text-xs text-stone-600 sm:text-sm">{cfg.notFoundText}</p>
          <Link
            to={cfg.backTo}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-amber-500 hover:text-stone-950 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {cfg.backLabel}
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- Content ---------- */
  const p = cfg.props(view);
  const hasHtml = typeof view.contentHtml === "string" && view.contentHtml.trim().length > 0;
  const metaItems = (p.meta || []).filter((m) => m && m.text);
  const cover = p.imageFit === "cover";

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-stone-700">
      <SeoHead post={view} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <Link
          to={cfg.backTo}
          className="group mb-6 inline-flex items-center gap-2 text-xs font-medium text-stone-500 transition-colors hover:text-amber-600 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          {cfg.backLabel}
        </Link>


        <header className="mb-8">
          {(p.badge || p.category) && (
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              {p.badge && (
                <span className="rounded-full bg-amber-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  {p.badge}
                </span>
              )}
              {p.badge && p.category && <span className="text-stone-300">/</span>}
              {p.category && <span className="text-xs font-medium text-stone-500">{p.category}</span>}
            </div>
          )}

          <h1 className="break-words font-serif text-2xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            {view.title}
          </h1>

          {metaItems.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-500 sm:text-sm">
              {metaItems.map(({ Icon, text }, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-amber-600" />}
                  {text}
                </span>
              ))}
            </div>
          )}
          <div className="mt-6 h-px bg-stone-200/80" />
        </header>

 
        {p.image && (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50 shadow-md">
            <div className="absolute left-0 top-0 z-10 h-1.5 w-32 bg-amber-500" />
            <div className={`flex h-[260px] items-center justify-center sm:h-[380px] lg:h-[420px] ${cover ? "" : "p-6"}`}>
              <img
                src={p.image}
                alt={p.imageAlt || view.title}
                loading="eager"
                className={`h-full w-full ${cover ? "object-cover" : "object-contain drop-shadow-lg"}`}
              />
            </div>
          </div>
        )}

        {/* SUMMARY */}
        {p.summary && (
          <section className="mb-8">
            <div className="border-l-4 border-amber-500 pl-4 sm:pl-6">
              {p.summaryLabel && <span className={EYEBROW}>{p.summaryLabel}</span>}
              <p className="mt-2 text-base leading-relaxed text-stone-700 sm:text-lg">{p.summary}</p>
            </div>
          </section>
        )}

  
        {(hasHtml || p.fallbackBody) && (
          <article className="mb-12">
            {p.bodyTitle && (
              <div className="mb-6">
                <span className={EYEBROW}>{p.bodyEyebrow || "In-Depth Insights"}</span>
                <h2 className="mt-1 font-serif text-xl font-bold text-stone-900 sm:text-2xl">{p.bodyTitle}</h2>
                <div className="mt-2 h-1 w-12 rounded-full bg-amber-500" />
              </div>
            )}

            {hasHtml ? (
              <div className="w-full min-w-0 text-stone-700 [&_a]:font-medium [&_a]:text-amber-700 [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-md">
                <ArticleBody post={view} />
              </div>
            ) : (
              <div className="w-full min-w-0 text-sm leading-relaxed text-stone-700 sm:text-base">
                {p.fallbackBody}
              </div>
            )}
          </article>
        )}


        {p.features?.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <span className={EYEBROW}>Specifications</span>
              <h2 className="mt-1 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                Key Features & Highlights
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {p.features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-3.5 transition-all hover:border-amber-500/40 hover:bg-white"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                    ✓
                  </span>
                  <span className="text-xs font-medium leading-relaxed text-stone-800 sm:text-sm">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

  
        {sections.map((s, i) => (
          <RelatedSection key={s.title || i} section={s} />
        ))}
      </div>
    </main>
  );
}