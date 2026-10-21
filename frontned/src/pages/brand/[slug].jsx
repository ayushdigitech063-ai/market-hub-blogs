import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import BrandCard from "../../components/BrandCard";
import SeoHead from "../../components/SeoHead";
import ArticleBody from "../../components/ArticleBody";
import { fetchBrand } from "../../api/brandApi";
import { API } from "../../dashboard/config";

const isLive = (x) => x && x.status !== "draft";


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
  if (mm) {
    try { meta = JSON.parse(decodeURIComponent(mm[1])); } catch { meta = {}; }
  }
  const fm = FAQ_JSON_RE.exec(raw);
  if (fm) {
    try { faqs = JSON.parse(decodeURIComponent(fm[1])); } catch { faqs = []; }
  }
  return { html, faqs, meta, isHtml: /<\w+[^>]*>/.test(html) };
};

export default function BrandDetail() {
  const { slug } = useParams();
  const scrollRef = useRef(null);

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [relatedFallback, setRelatedFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0, behavior: "smooth" });

    setLoading(true);
    setNotFound(false);
    setRelatedFallback(false);

    fetchBrand(slug)
      .then((data) => {
        if (!active) return;
        setItem(data.item);
        const related = (data.related || []).filter(isLive);
        setRelatedItems(related);

        // Same brand ka koi aur product na ho to baaki live products dikhao
        if (related.length === 0) {
          fetch(`${API}/brands`)
            .then((r) => r.json())
            .then((all) => {
              if (!active) return;
              const cur = data.item;
              const score = (b) =>
                (b.brand === cur.brand ? 2 : 0) + (b.category === cur.category ? 1 : 0);
              const others = (Array.isArray(all) ? all : [])
                .filter((b) => isLive(b) && b._id !== cur._id && b.slug !== cur.slug)
                .sort((a, b) => score(b) - score(a))
                .slice(0, 8);
              setRelatedItems(others);
              setRelatedFallback(others.length > 0);
            })
            .catch(() => {});
        }
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [slug]);


  const view = useMemo(() => {
    if (!item) return null;
    const { html, faqs, meta, isHtml } = unpackBlog(item.blog || item.articleContent);
    return {
      ...item,
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
  }, [item]);

  const seoPost = useMemo(
    () =>
      view
        ? {
            ...view,
            title: view.name || view.articleTitle || view.title,
            excerpt: view.description || view.shortDescription,
            image: view.imageUrl,
          }
        : null,
    [view]
  );

  const scroll = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };


  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-600 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading article & insights...</span>
        </div>
      </main>
    );
  }


  if (notFound || !view || !isLive(view)) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-md p-8 rounded-2xl border border-stone-200 shadow-sm bg-stone-50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold text-xl">
            !
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Article / Product Not Found
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-stone-600">
            The information or article you are looking for could not be found or has been removed.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back Home
          </Link>
        </div>
      </main>
    );
  }


  const brand = view.brand || "Brand";
  const title = view.name || view.articleTitle || view.title;
  const description = view.description || view.shortDescription;
  const blog = view.blog;

  return (
    <main className="min-h-screen bg-white text-stone-700">

      <SeoHead post={seoPost} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">


        <Link
          to="/"
          className="group mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded-full bg-amber-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              {brand}
            </span>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-medium text-stone-500">
              {view.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tight text-stone-900">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-500 font-light">
            <span className="font-semibold text-stone-800">{view.category}</span>
            {view.subCategory && (
              <>
                <span className="text-stone-300">•</span>
                <span>{view.subCategory}</span>
              </>
            )}
            {view.date && (
              <>
                <span className="text-stone-300">•</span>
                <span>{view.date}</span>
              </>
            )}
            {view.readTime && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-amber-600 font-medium">{view.readTime}</span>
              </>
            )}
          </div>

          <div className="mt-6 h-px bg-stone-200/80" />
        </header>

  
        {view.imageUrl && (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50 shadow-md">
            <div className="absolute left-0 top-0 z-10 h-1.5 w-32 bg-amber-500" />
            <div className="flex h-[260px] sm:h-[380px] lg:h-[420px] items-center justify-center p-6">
              <img
                src={view.imageUrl}
                alt={view.imageAlt || title}
                className="h-full w-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        )}

        {description && (
          <section className="mb-8">
            <div className="border-l-4 border-amber-500 pl-4 sm:pl-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Overview
              </span>
              <p className="mt-2 text-base sm:text-lg font-normal leading-relaxed text-stone-700">
                {description}
              </p>
            </div>
          </section>
        )}

   
        {(view.contentHtml || blog) && (
          <article className="mb-12">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                In-Depth Insights
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-stone-900">
                About {title}
              </h2>
              <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full" />
            </div>

            {view.contentHtml ? (

              <div className="text-stone-700">
                <ArticleBody post={view} />
              </div>
            ) : (
 
              <div className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed text-stone-700 space-y-4 whitespace-pre-line font-light">
                {blog}
              </div>
            )}
          </article>
        )}


        {view.features?.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Specifications
              </span>
              <h2 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Key Features & Highlights
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {view.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-3.5 transition-all hover:border-amber-500/40 hover:bg-white shadow-xs"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                    ✓
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed text-stone-800">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}


        {relatedItems.length > 0 && (
          <section className="border-t border-stone-200 pt-10 mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                  {relatedFallback ? "You May Also Like" : `More From ${brand}`}
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Related Articles & Products
                </h2>
              </div>


              <div className="flex gap-2">
                <button
                  onClick={() => scroll(-300)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 transition-all hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 cursor-pointer shadow-xs"
                  aria-label="Previous products"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scroll(300)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 transition-all hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 cursor-pointer shadow-xs"
                  aria-label="Next products"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>


            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {relatedItems.map((product) => (
                <div key={product._id || product.id} className="min-w-[260px] sm:min-w-[280px] max-w-[280px] flex-shrink-0">
                  <BrandCard item={product} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}