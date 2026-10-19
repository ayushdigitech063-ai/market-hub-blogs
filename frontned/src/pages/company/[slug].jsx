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

  // dir = -1 (previous) ya 1 (next): ek card jitna scroll karta hai
  const scroll = (dir) => {
    const el = scrollRef.current;
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

        try {
          const res = await fetch(`${API}/companies`);
          const all = await res.json();
          const others = (Array.isArray(all) ? all : []).filter(
            (x) => x && x.slug && x.slug !== c.slug && isLive(x)
          );
          const sameCategory = c.category
            ? others.filter((x) => norm(x.category) === norm(c.category))
            : [];
          setRelated((sameCategory.length ? sameCategory : others).slice(0, 12));
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


        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 border-l-4 border-teal-500 pl-3 font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
              Related companies
            </h2>

            <div
              ref={scrollRef}
              className="flex snap-x snap-proximity gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/companies/${r.slug}`}
                  className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl sm:w-[calc((100%-2.5rem)/2.5)]"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100 sm:h-60">
                    {r.imageURL && (
                      <img
                        src={r.imageURL}
                        alt={r.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                      {r.category || "Company"}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-xl font-bold text-slate-900">
                      {r.name}
                    </h3>

                    <span className="mt-2 block text-[11px] font-bold uppercase tracking-wider text-teal-700">
                      Company
                    </span>

                    {cleanDesc(r.description) && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {cleanDesc(r.description)}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                        Read full profile
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Previous / Next arrows — cards ke niche center mein */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Previous companies"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-teal-500 hover:bg-teal-500 hover:text-white hover:shadow-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Next companies"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-teal-500 hover:bg-teal-500 hover:text-white hover:shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}