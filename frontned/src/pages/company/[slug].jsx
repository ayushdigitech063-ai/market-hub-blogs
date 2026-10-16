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

export default function CompanyDetail() {
  const { slug } = useParams();
  const scrollRef = useRef(null);
  const scroll = (amount) =>
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  const [company, setCompany] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    setNotFound(false);
    setArticles([]);

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
      const list = await res.json();
      return (Array.isArray(list) ? list : []).find((c) => c.slug === slug) || null;
    };

    loadCompany()
      .then(async (c) => {
        if (!c) {
          setNotFound(true);
          return;
        }
        setCompany(c);

        try {
          const res = await fetch(`${API}/articles`);
          const all = await res.json();

          const slugKey = norm(c.slug);
          const nameKey = norm(c.name);
          const hasRange =
            c.startId != null &&
            c.endId != null &&
            Number.isFinite(Number(c.startId)) &&
            Number.isFinite(Number(c.endId));
          const start = Number(c.startId);
          const end = Number(c.endId);

          const matches = (a) => {
            const company = norm(a.company);
            const category = norm(a.category);
            const byCompany =
              company &&
              (company === slugKey ||
                company === nameKey ||
                company.includes(slugKey) ||
                nameKey.includes(company));
            const byCategory =
              category &&
              (category === slugKey ||
                category === nameKey ||
                category.includes(slugKey));
            const byRange = hasRange && Number(a.id) >= start && Number(a.id) <= end;
            return byCompany || byCategory || byRange;
          };

          const list = (Array.isArray(all) ? all : [])
            .filter((a) => matches(a) && isLive(a))
            .sort((a, b) => Number(a.id) - Number(b.id));

          setArticles(list);
        } catch (err) {
          console.error("Error fetching articles:", err);
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
          <article className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
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


        <section className="relative mt-14 overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-100/70 via-white to-blue-100/70 px-4 py-8 shadow-sm sm:px-7 sm:py-10 lg:px-9">

          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-rose-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-sky-100/40 blur-3xl" />

          <div className="relative z-10">

            <div className="mb-7 flex flex-wrap items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
              <div className="flex items-start gap-4">
                <span className="mt-1 h-14 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-blue-600 via-indigo-500 to-rose-400" />

                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.17em] text-blue-700">
                    Continue Exploring
                  </span>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Related Articles
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Explore fresh perspectives, discover useful insights, and keep up
                    with the latest developments across business, technology, and
                    digital marketing.
                  </p>
                </div>
              </div>

              {articles.length > 1 && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scroll(-420)}
                    aria-label="Previous articles"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scroll(420)}
                    aria-label="Next articles"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {articles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
                <h3 className="text-base font-semibold text-slate-800">
                  No Related Articles Yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Related articles will appear here when they become available.
                </p>
              </div>
            ) : (

              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-0.5 pb-4 pt-1 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {articles.map((a) => (
                  <article
                    key={a.id}
                    className="group flex w-[285px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10 sm:w-[340px] lg:w-[360px]"
                  >
          
                    <div className="relative overflow-hidden bg-slate-100">
                      <img
                        src={a.image}
                        alt={a.title}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

                      {a.category && (
                        <span className="absolute bottom-4 left-4 max-w-[85%] truncate rounded-full border border-white/70 bg-white/95 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-800 shadow-sm backdrop-blur-sm">
                          {a.category}
                        </span>
                      )}
                    </div>


                    <div className="flex flex-1 flex-col p-5">
                      <span className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-blue-600 to-rose-400" />

                      <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                        {a.title}
                      </h3>


                      <div className="mt-4 flex min-h-[58px] items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-rose-50 text-sm font-bold text-blue-700">
                            {(a.author || "A").charAt(0).toUpperCase()}
                          </span>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Written by
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                              {a.author || "Admin"}
                            </p>
                          </div>
                        </div>

                        {a.readTime && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                            {a.readTime}
                          </span>
                        )}
                      </div>


                      <Link
                        to={`/article/${a.id}`}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                      >
                        Read Article
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}