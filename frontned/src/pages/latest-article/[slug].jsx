import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CalendarDays,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";

import ArticleCard from "../../components/ArticleCard";
import SeoHead from "../../components/SeoHead";
import ArticleBody from "../../components/ArticleBody";
import {
  fetchLatestArticle,
  fetchLatestArticles,
} from "../../api/latestArticleApi";


const isLive = (article) =>
  article && article.status !== "draft";

const PACK_RE = /<!--COMPANY_PACK:([\s\S]*?)-->/;
const readPack = (content) => {
  const m = PACK_RE.exec(String(content || ""));
  if (!m) return {};
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return {};
  }
};


const renderInline = (text = "") =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong
          key={index}
          className="font-bold text-stone-950"
        >
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={index}>
          {part}
        </React.Fragment>
      )
    );


const renderContent = (content = "") =>
  String(content)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("### ")) {
        return (
          <h2
            key={index}
            className="mb-4 mt-10 font-serif text-2xl font-bold leading-tight text-stone-950 sm:text-3xl"
          >
            {block.replace(/^###\s+/, "")}
          </h2>
        );
      }

      const lines = block
        .split("\n")
        .map((line) => line.trim());

      if (lines.every((line) => line.startsWith("- "))) {
        return (
          <ul
            key={index}
            className="my-6 space-y-3"
          >
            {lines.map((line, lineIndex) => (
              <li
                key={lineIndex}
                className="flex items-start gap-3 leading-7"
              >
                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                <span>{renderInline(line.slice(2))}</span>
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={index}
          className="my-5 whitespace-pre-line"
        >
          {renderInline(block)}
        </p>
      );
    });

export default function LatestArticleDetail() {
  const { slug } = useParams();

  const [itemRaw, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    const element = sliderRef.current;
    if (!element) return;

    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let cancelled = false;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setLoading(true);
    setItem(null);
    setRelated([]);


    fetchLatestArticle(slug)
      .then((article) => {
        if (cancelled) return;

        setItem(article || null);
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(
          "Latest article detail error:",
          error
        );

        setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });


    fetchLatestArticles()
      .then((articles) => {
        if (cancelled || !Array.isArray(articles)) return;

        setRelated(
          articles.filter(
            (article) =>
              isLive(article) && article.slug !== slug
          )
        );
      })
      .catch((error) => {
        if (cancelled) return;

        console.error(
          "Related articles error:",
          error
        );

        setRelated([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  
  const item = useMemo(() => {
    if (!itemRaw) return null;
    const pack = readPack(itemRaw.content);
    const meta = pack.meta || {};
    const faqs = pack.faqs || [];
    return {
      ...itemRaw,
      content: String(itemRaw.content || "").replace(PACK_RE, "").trim(),
      contentHtml: pack.html || itemRaw.contentHtml || "",
      faqs: faqs.length ? faqs : itemRaw.faqs || [],
      faqEnabled: faqs.length > 0 || !!itemRaw.faqEnabled,
      showToc: itemRaw.showToc ?? meta.showToc ?? true,
      status: itemRaw.status ?? meta.status,
      imageAlt: itemRaw.imageAlt ?? meta.imageAlt,
      focusKeyword: itemRaw.focusKeyword ?? meta.focusKeyword,
      secondaryKeywords: itemRaw.secondaryKeywords ?? meta.secondaryKeywords,
      tags: itemRaw.tags ?? meta.tags,
      publishDate: itemRaw.publishDate ?? meta.publishDate,
      seo: itemRaw.seo ?? meta.seo,
    };
  }, [itemRaw]);


  const sortedRelated = [...related].sort((a, b) => {
    if (item?.category && a.category === item.category &&
        b.category !== item.category) {
      return -1;
    }

    if (item?.category && b.category === item.category &&
        a.category !== item.category) {
      return 1;
    }

    return 0;
  });

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#FFF8F0] px-4">
        <p className="text-sm font-medium text-stone-500">
          Loading article...
        </p>
      </main>
    );
  }

  if (!item || !isLive(item)) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center gap-4 bg-[#FFF8F0] px-5 text-center">
        <h2 className="font-serif text-3xl font-bold text-stone-950">
          Article Not Found
        </h2>

     <p className="max-w-md text-sm leading-6 text-stone-500">
  This article does not exist, is a draft, or is currently unavailable.
</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-[#FFF8F0] transition hover:bg-emerald-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back Home
        </Link>
      </main>
    );
  }

  const hasHtmlContent =
    typeof item.contentHtml === "string" &&
    item.contentHtml.trim().length > 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFF8F0] text-stone-700 selection:bg-emerald-200 selection:text-stone-950">
    
      <SeoHead post={item} />

      <section className="w-full px-4 pb-14 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            to="/"
            className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <header className="max-w-4xl">
            {item.category && (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800 sm:text-xs">
                {item.category}
              </span>
            )}

            <h1 className="mt-4 break-words font-serif text-3xl font-bold leading-tight tracking-tight text-stone-950 sm:text-4xl lg:text-5xl">
              {item.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-stone-500 sm:text-sm">
              {item.author && (
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span className="font-semibold text-stone-800">
                    {item.author}
                  </span>
                </span>
              )}

              {item.date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-emerald-700" />
                  {item.date}
                </span>
              )}

              {item.readTime && (
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-emerald-700" />
                  {item.readTime}
                </span>
              )}
            </div>
          </header>

          <div className="my-7 h-px w-full bg-stone-200 sm:my-9" />

          {item.image && (
            <figure className="mb-8 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-2 shadow-sm sm:mb-10 sm:rounded-3xl sm:p-3">
              <img
                src={item.image}
                alt={item.imageAlt || item.title || "Article image"}
                className="mx-auto block max-h-[520px] w-full rounded-xl object-contain sm:rounded-2xl"
                loading="eager"
              />
            </figure>
          )}

          {item.excerpt && (
            <p className="mb-8 rounded-r-xl border-l-4 border-emerald-700 bg-emerald-50/80 px-5 py-4 font-serif text-base leading-7 text-stone-800 sm:px-7 sm:py-5 sm:text-lg sm:leading-8">
              {item.excerpt}
            </p>
          )}

          {hasHtmlContent ? (
            <div className="latest-article-body w-full min-w-0 text-base leading-8 text-stone-700 sm:text-[17px]">
              <ArticleBody post={item} />
            </div>
          ) : (
            <article className="latest-article-body w-full min-w-0 text-base leading-8 text-stone-700 sm:text-[17px]">
              {renderContent(item.content)}
            </article>
          )}
        </div>
      </section>

    
{sortedRelated.length > 0 && (
  <section className="relative isolate overflow-hidden border-t border-[#E9E2D8] bg-[#F8F7F3] py-12 sm:py-16 lg:py-20">
    {/* Soft background accents */}
    <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-[#E47742]/10 blur-3xl" />
    <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-[#E8BD70]/15 blur-3xl" />

    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Section heading */}
      <div className="mb-7 border-b border-[#E5DED3] pb-6 sm:mb-9">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E9DCCB] bg-white/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#A9552F] shadow-sm sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E47742]" />
          Keep Exploring
        </span>

        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#17243D] sm:text-3xl lg:text-4xl">
          Related{" "}
          <span className="bg-gradient-to-r from-[#E47742] to-[#C85B35] bg-clip-text text-transparent">
            Articles
          </span>
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#626979] sm:text-base">
          Discover more insights, ideas and guides selected for you.
        </p>
      </div>

      {/* Related articles slider */}
      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
      >
        {sortedRelated.slice(0, 6).map((article) => (
          <div
            key={article._id || article.slug}
            className="w-[88%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#EAE4DA] bg-white shadow-[0_8px_28px_rgba(23,36,61,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#E8C4A8] hover:shadow-[0_16px_38px_rgba(23,36,61,0.11)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <ArticleCard
              article={article}
              basePath="/latest-article"
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons below the cards */}
      {sortedRelated.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
         
<button
  type="button"
  onClick={() => scrollSlider(-1)}
  aria-label="Previous articles"
  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B96D] focus-visible:ring-offset-2"
>
  <ChevronLeft className="h-5 w-5" />
</button>

<button
  type="button"
  onClick={() => scrollSlider(1)}
  aria-label="Next articles"
  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:translate-x-0.5 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B96D] focus-visible:ring-offset-2"
>
  <ChevronRight className="h-5 w-5" />
</button>

           
        </div>
      )}
    </div>
  </section>
)}

  
    </main>
  );
}