import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import BrandCard from "../../components/BrandCard";
import { fetchBrand } from "../../api/brandApi";

export default function BrandDetail() {
  const { slug } = useParams();
  const scrollRef = useRef(null);

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setLoading(true);
    setNotFound(false);

    fetchBrand(slug)
      .then((data) => {
        setItem(data.item);
        setRelatedItems(data.related || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const scroll = (amount) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  // ---------- LOADING ----------
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

  // ---------- NOT FOUND ----------
  if (notFound || !item) {
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

  // ---------- DATA ----------
  const brand = item.brand || "Brand";
  const title = item.name || item.articleTitle || item.title;
  const description = item.description || item.shortDescription;
  const blog = item.blog || item.articleContent;

  return (
    <main className="min-h-screen bg-white text-stone-700">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">

        {/* BACK LINK */}
        <Link
          to="/"
          className="group mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-500 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* HEADER */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded-full bg-amber-100 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 shadow-xs">
              {brand}
            </span>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-medium text-stone-500">
              {item.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tight text-stone-900">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-stone-500 font-light">
            <span className="font-semibold text-stone-800">{item.category}</span>
            {item.subCategory && (
              <>
                <span className="text-stone-300">•</span>
                <span>{item.subCategory}</span>
              </>
            )}
            {item.date && (
              <>
                <span className="text-stone-300">•</span>
                <span>{item.date}</span>
              </>
            )}
            {item.readTime && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-amber-600 font-medium">{item.readTime}</span>
              </>
            )}
          </div>

          <div className="mt-6 h-px bg-stone-200/80" />
        </header>

        {/* IMAGE CONTAINER */}
        {item.imageUrl && (
          <div className="relative mb-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50 shadow-md">
            <div className="absolute left-0 top-0 z-10 h-1.5 w-32 bg-amber-500" />
            <div className="flex h-[260px] sm:h-[380px] lg:h-[420px] items-center justify-center p-6">
              <img
                src={item.imageUrl}
                alt={title}
                className="h-full w-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        )}

        {/* DESCRIPTION / OVERVIEW */}
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

        {/* BLOG / ARTICLE CONTENT */}
        {blog && (
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

            <div className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed text-stone-700 space-y-4 whitespace-pre-line font-light">
              {blog}
            </div>
          </article>
        )}

        {/* FEATURES */}
        {item.features?.length > 0 && (
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
              {item.features.map((feature, index) => (
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

        {/* RELATED PRODUCTS / ARTICLES */}
        {relatedItems.length > 0 && (
          <section className="border-t border-stone-200 pt-10 mt-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                  More From {brand}
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Related Articles & Products
                </h2>
              </div>

              {/* Slider Controls */}
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

            {/* Scrollable Row */}
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