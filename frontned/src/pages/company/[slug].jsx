import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SeoHead from "../../components/SeoHead";
import ArticleBody from "../../components/ArticleBody";

const API = "https://market-hub-blogs-backend.onrender.com/api";

const isLive = (x) => x && x.status !== "draft";

// API kabhi direct array aur kabhi { items: [...] } / { articles: [...] } return karti hai.
const getList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const key of ["items", "articles", "companies", "results", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
    if (payload[key] && typeof payload[key] === "object") {
      for (const nestedKey of ["items", "articles", "companies", "results"]) {
        if (Array.isArray(payload[key][nestedKey])) return payload[key][nestedKey];
      }
    }
  }
  return [];
};

// Company ke alag-alag fields se naam/slug/ID nikalta hai.
const valuesFrom = (value) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.flatMap(valuesFrom);
  if (typeof value === "object") {
    return [
      value.slug,
      value.name,
      value.companyName,
      value.title,
      value._id,
      value.id,
    ].filter(Boolean);
  }
  return [value];
};

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const COMPANY_PACK = /<!--COMPANY_PACK:([\s\S]*?)-->/;
const cleanDesc = (s) => String(s || "").replace(COMPANY_PACK, "").trim();
const readPack = (s) => {
  const m = COMPANY_PACK.exec(String(s || ""));
  if (!m) return {};
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return {};
  }
};

// HTML hata kar plain text banata hai (card ke summary ke liye)
const toText = (s) =>
  String(s || "")
    .replace(COMPANY_PACK, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const articleImage = (a) => {
  const img =
    a?.image ||
    a?.imageURL ||
    a?.featuredImage ||
    a?.bannerImage ||
    a?.thumbnail ||
    "";
  if (typeof img === "string") return img;
  return img?.url || img?.secure_url || img?.src || "";
};

const articleDate = (a) => a?.publishDate || a?.publishedAt || a?.createdAt || null;

const articleTime = (a) => {
  const t = new Date(articleDate(a)).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ARROW_BTN =
  "flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95";

export default function CompanyDetail() {
  const { slug } = useParams();
  const scrollRef = useRef(null); // related companies slider
  const articlesRef = useRef(null); // company articles slider

  // dir = -1 (previous) ya 1 (next): ek card jitna scroll karta hai
  const scroll = (dir, ref = scrollRef) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.offsetWidth + 20 : 340; // card width + gap-5
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const [company, setCompany] = useState(null);
  const [articles, setArticles] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    setNotFound(false);
    setArticles([]);
    setRelated([]);

    const loadCompany = async () => {
      try {
        const res = await fetch(`${API}/companies/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const item = data?.item || data?.company || data;
          if (item && item.slug) return item;
        }
      } catch (_) {}

      const res = await fetch(`${API}/companies`);
      if (!res.ok) return null;
      const payload = await res.json();
      return getList(payload).find((c) => c.slug === slug) || null;
    };

    loadCompany()
      .then(async (c) => {
        if (!c) {
          setNotFound(true);
          return;
        }
        setCompany(c);

        // ---------- Isi company ke related articles (global matching) ----------
        try {
          // Articles alag-alag APIs mein ho sakte hain; dono sources check karo.
          const endpoints = [
            `${API}/articles`,
            `${API}/latest-articles?all=true`,
          ];

          const responses = await Promise.allSettled(
            endpoints.map(async (url) => {
              const res = await fetch(url);
              if (!res.ok) return [];
              return getList(await res.json());
            })
          );

          const all = responses.flatMap((result) =>
            result.status === "fulfilled" ? result.value : []
          );

          const slugKey = norm(c.slug);
          const nameKey = norm(c.name);
          const companyId = String(c._id || c.id || "");
          const hasRange =
            c.startId != null &&
            c.endId != null &&
            Number.isFinite(Number(c.startId)) &&
            Number.isFinite(Number(c.endId));
          const startId = Number(c.startId);
          const endId = Number(c.endId);

          // Exact company metadata ko pehle match karo.
          const matchesCompanyValue = (value) => {
            return valuesFrom(value).some((entry) => {
              const key = norm(entry);
              if (!key) return false;
              if (key === slugKey || key === nameKey) return true;

              // Long enough prefixes handle names such as "JPMorgan Chase AI..."
              // without matching very short/generic company names.
              if (slugKey.length >= 5 && key.startsWith(slugKey)) return true;
              if (nameKey.length >= 5 && key.startsWith(nameKey)) return true;
              if (key.length >= 5 && slugKey.startsWith(key)) return true;
              if (key.length >= 5 && nameKey.startsWith(key)) return true;
              return false;
            });
          };

          const matches = (a) => {
            if (!a) return false;

            const structuredFields = [
              a.companySlug,
              a.companyName,
              a.company,
              a.relatedCompany,
              a.relatedCompanies,
              a.companyId,
              a.brand,
              a.brands,
            ];

            if (structuredFields.some(matchesCompanyValue)) return true;

            // Category/tags are checked as metadata too, but broad categories won't
            // match unless they resemble this specific company's name/slug.
            if (
              matchesCompanyValue(a.category) ||
              matchesCompanyValue(a.tags) ||
              matchesCompanyValue(a.keywords)
            ) {
              return true;
            }

            // Fallback for older records where company metadata was not saved:
            // match the article title/slug only when it begins with this company.
            const titleKey = norm(a.title);
            const articleSlugKey = norm(a.slug);
            const titleMatch =
              (slugKey.length >= 5 && titleKey.startsWith(slugKey)) ||
              (nameKey.length >= 5 && titleKey.startsWith(nameKey)) ||
              (slugKey.length >= 5 && articleSlugKey.startsWith(slugKey)) ||
              (nameKey.length >= 5 && articleSlugKey.startsWith(nameKey));
            if (titleMatch) return true;

            // Support legacy companies that store an article ID range.
            const articleNumericId = Number(a.id);
            const byRange =
              hasRange &&
              Number.isFinite(articleNumericId) &&
              articleNumericId >= startId &&
              articleNumericId <= endId;
            if (byRange) return true;

            // A company ID is only reliable when the article explicitly stores it.
            const articleCompanyId = String(
              a.companyId || a.company?._id || a.company?.id || ""
            );
            return Boolean(companyId && articleCompanyId && articleCompanyId === companyId);
          };

          // Merge both APIs and remove duplicates using Mongo ID, slug, or numeric ID.
          const seen = new Set();
          const list = all
            .filter((a) => isLive(a) && matches(a))
            .filter((a) => {
              const key = String(a._id || a.slug || a.id || "");
              if (!key || seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .sort(
              (a, b) =>
                articleTime(b) - articleTime(a) ||
                Number(b.id || 0) - Number(a.id || 0)
            );

                 setArticles(list);
        } catch (err) {
          console.error("Error fetching related articles:", err);
          setArticles([]);
        }

        // ---------- Same category ki baaki companies ----------
        try {
          const res = await fetch(`${API}/companies`);
          if (!res.ok) {
            setRelated([]);
          } else {
            const payload = await res.json();
            const all = getList(payload);
            const catKey = norm(c.category);
            const others = all.filter(
            (x) =>
              x &&
              x.slug &&
              x.slug !== c.slug &&
              isLive(x) &&
              catKey &&
              norm(x.category) === catKey
          );
            setRelated(others.slice(0, 12));
          }
        } catch (err) {
          console.error("Error fetching related companies:", err);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const view = useMemo(() => {
    if (!company) return null;
    const pack = readPack(company.description);
    const m = pack.meta || {};
    return {
      ...company,
      description: cleanDesc(company.description),
      title: company.name,
      excerpt: cleanDesc(company.description),
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
  }, [company]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <span>Loading company...</span>
        </div>
      </main>
    );
  }

  if (notFound || !view || !isLive(view)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-teal-600">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Company Not Found</h2>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">
            The company you are looking for could not be found or has been removed.
          </p>
          <Link
            to="/companies"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-teal-500 hover:text-slate-950 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50/60 via-white to-white text-slate-700">
      <SeoHead post={view} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link
            to="/companies"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Companies
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">{view.name}</span>
        </nav>

        <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-slate-900 shadow-xl shadow-sky-900/10">
          {view.imageURL && (
            <img
              src={view.imageURL}
              alt={view.imageAlt || view.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#091827]/95 via-[#102D46]/70 to-[#0F4560]/30" />
          <div className="relative z-10 flex min-h-[300px] flex-col justify-end p-6 sm:min-h-[360px] sm:p-10">
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800">
              <Building2 className="h-3.5 w-3.5 text-teal-600" />
              Company Profile
            </span>
            <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {view.name}
            </h1>
            {view.description && (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                {view.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
              {view.publishDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-cyan-200" />
                  {new Date(view.publishDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {view.readTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-cyan-200" />
                  {view.readTime}
                </span>
              )}
            </div>
          </div>
        </section>

        {view.contentHtml && (
          <article className="mx-auto mt-10 max-w-4xl">
            <div className="mb-8">
              <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
                About the company
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
                About {view.name}
              </h2>
              <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-sky-500 to-teal-500" />
            </div>
            <div className="text-slate-700 [&_a]:font-medium [&_a]:text-teal-700 [&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-md">
              <ArticleBody post={view} />
            </div>
          </article>
        )}

        {/* ================= Isi company ke articles (3 ek baar mein) ================= */}
        {articles.length > 0 && (
          <section className="mt-14 border-t border-sky-100 pt-12 sm:mt-16 sm:pt-14">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
                  Related Articles
                </span>
                <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
                  More about {view.name}
                </h2>
                <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-sky-500 to-teal-500" />
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                {articles.length} {articles.length === 1 ? "article" : "articles"}
              </span>
            </div>

            <div
              ref={articlesRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {articles.slice(0, 12).map((a) => {
                const img = articleImage(a);
                const text = toText(a.excerpt || a.shortDescription || a.description || a.contentHtml);
                const date = fmtDate(articleDate(a));
                const key = a._id || a.id || a.slug;
                return (
                  <Link
                    key={key}
                    to={`/latest-article/${a.slug || a._id}`}
                    className="group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-sky-900/10 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      {img ? (
                        <img
                          src={img}
                          alt={a.imageAlt || a.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-teal-300">
                          <Building2 className="h-10 w-10" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {date && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                          {date}
                        </span>
                      )}
                      <h3 className="mt-2 line-clamp-2 font-serif text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-teal-700">
                        {a.title}
                      </h3>
                      {text && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {text}
                        </p>
                      )}
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-wider text-teal-700">
                        Read Article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* < > arrows: 3 se zyada ho tabhi desktop par dikhte hain */}
            {articles.length > 1 && (
              <div
                className="mt-3 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => scroll(-1, articlesRef)}
                  aria-label="Previous articles"
                  className={ARROW_BTN}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1, articlesRef)}
                  aria-label="Next articles"
                  className={ARROW_BTN}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* ================= Same category ki companies (3 ek baar mein) ================= */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-sky-100 pt-12 sm:mt-16 sm:pt-14">
            <div className="mb-7">
              <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
                Keep Exploring
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
                Related Companies
              </h2>
              <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-sky-500 to-teal-500" />
            </div>

            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {related.map((c) => (
                <Link
                  key={c._id || c.slug}
                  to={`/company/${c.slug}`}
                  className="group relative w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/20 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
                >
                  <div className="relative h-56 sm:h-60">
                    {c.imageURL && (
                      <img
                        src={c.imageURL}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091827]/95 via-[#102D46]/60 to-[#0F4560]/20" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-5">
                      <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-white">
                        {c.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-200">
                        {toText(c.description)}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                        View Articles
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {related.length > 1 && (
              <div
                className="mt-3 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => scroll(-1, scrollRef)}
                  aria-label="Previous companies"
                  className={ARROW_BTN}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1, scrollRef)}
                  aria-label="Next companies"
                  className={ARROW_BTN}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}