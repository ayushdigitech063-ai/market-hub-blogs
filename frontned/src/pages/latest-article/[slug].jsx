import React, { useEffect,useRef, useState } from "react";

import { ArrowLeft, ChevronLeft, ChevronRight, Clock, User, CalendarDays } from "lucide-react";
import { useParams, Link } from "react-router-dom";

import ArticleCard from "../../components/ArticleCard";
import {
  fetchLatestArticle,
  fetchLatestArticles,
} from "../../api/latestArticleApi";

// **bold** support
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-stone-950">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );

// Content: khali line = paragraph, "### " = heading, "- " = list
const renderContent = (content = "") =>
  content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("### ")) {
        return (
          <h2
            key={i}
            className="mt-10 mb-4 font-serif text-2xl font-bold text-stone-950 sm:text-3xl"
          >
            {block.replace(/^###\s+/, "")}
          </h2>
        );
      }
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) {
        return (
          <ul key={i} className="my-5 space-y-2">
            {lines.map((l, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                <span>{renderInline(l.slice(2))}</span>
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="my-5 whitespace-pre-line">
          {renderInline(block)}
        </p>
      );
    });

export default function LatestArticleDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
const [author, setAuthor] = useState(null);
const sliderRef = useRef(null);

const scrollSlider = (dir) => {
  const el = sliderRef.current;
  if (!el) return;
  el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
};
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);

    Promise.all([fetchLatestArticle(slug), fetchLatestArticles()])
      .then(([current, all]) => {
        setItem(current);
        const others = (Array.isArray(all) ? all : []).filter(
          (a) => a.slug !== current.slug
        );
        // same category pehle, phir baaki
        others.sort(
          (a, b) =>
            Number(b.category === current.category) -
            Number(a.category === current.category)
        );
        setRelated(others.slice(0, 3)); // 3 ki jagah 4/5 chahiye to yahan badlo
      })
      .catch(() => {
        setItem(null);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <p className="text-sm font-medium text-stone-500">Loading...</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF8F0] px-5 text-center">
        <h2 className="font-serif text-3xl font-bold text-stone-950">
          Article Not Found
        </h2>
        <p className="text-sm text-stone-500">
          Ye article exist nahi karta ya hata diya gaya hai.
        </p>
        <Link
          to="/"
          className="rounded-xl bg-emerald-950 px-6 py-3 text-sm font-semibold text-[#FFF8F0] transition hover:bg-emerald-800"
        >
          Go Back Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-stone-700 selection:bg-emerald-200 selection:text-stone-950">
      {/* ================= ARTICLE ================= */}
      <div className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-6">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-emerald-800"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
          {item.category}
        </span>

        <h1 className="mt-4 font-serif text-3xl font-bold leading-[1.2] tracking-tight text-stone-950 sm:text-4xl lg:text-[44px]">
          {item.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-4 w-4 text-emerald-700" />
            <span className="font-semibold text-stone-800">{item.author}</span>
          </span>
          {item.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-emerald-700" />
              {item.date}
            </span>
          )}
          {item.readTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-700" />
              {item.readTime}
            </span>
          )}
        </div>

        <div className="my-8 h-px bg-stone-200" />

        {item.image && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-emerald-950/5 bg-white p-3 shadow-sm">
            <img
              src={item.image}
              alt={item.title}
              className="max-h-[460px] w-full rounded-2xl object-cover"
            />
          </div>
        )}

        {item.excerpt && (
          <p className="mb-10 rounded-r-2xl border-l-4 border-emerald-700 bg-emerald-50/70 px-6 py-5 font-serif text-lg font-medium leading-8 text-stone-800">
            {item.excerpt}
          </p>
        )}

        <article className="text-[17px] leading-8 text-stone-700">
          {renderContent(item.content)}
        </article>
      </div>

      {/* ================= RELATED ARTICLES ================= */}
      {related.length > 0 && (
  <section className="border-t border-stone-200 bg-[#FDF2E9]/70 py-14">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
        Keep Reading
      </p>

      <div className="mt-2 mb-8 flex items-end justify-between border-b border-stone-200 pb-3">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
          Related Articles
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollSlider(-1)}
            aria-label="Scroll left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-emerald-800 hover:bg-emerald-800 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollSlider(1)}
            aria-label="Scroll right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:border-emerald-800 hover:bg-emerald-800 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {related.map((a) => (
          <div
            key={a._id}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <ArticleCard article={a} basePath="/latest-article" />
          </div>
        ))}
      </div>
    </div>
  </section>
)}
  
    </main>
  );
}