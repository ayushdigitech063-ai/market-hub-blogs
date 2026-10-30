import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

import ArticleCard from "../../components/ArticleCard";
import SeoHead from "../../components/SeoHead";
import ArticleBody from "../../components/ArticleBody";




const renderInline = (text = "") =>
  String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index} className="font-bold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      )
    );

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugMatches = (value, company) => {
  const key = toSlug(value);
  const slug = String(company?.slug || "").toLowerCase();

  return Boolean(key && (key === slug || slug.startsWith(`${key}-`)));
};

const belongsTo = (article, company) => {
  if (String(article?.company || "").trim()) {
    return slugMatches(article.company, company);
  }

  if (slugMatches(article?.category, company)) {
    return true;
  }

  const articleId = Number(article?.id);
  const startId = Number(company?.startId);
  const endId = Number(company?.endId);

  return (
    Number.isFinite(articleId) &&
    Number.isFinite(startId) &&
    Number.isFinite(endId) &&
    articleId >= startId &&
    articleId <= endId
  );
};

const isLive = (article) =>
  String(article?.status || "").toLowerCase() !== "draft";

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.articles)) return data.articles;
  if (Array.isArray(data?.companies)) return data.companies;

  return [];
};



function ArticleContent({ content }) {
  if (!content) return null;

  const blocks = String(content)
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (!lines.length) return null;

        const first = lines[0];

        if (first.startsWith("### ")) {
          return (
            <div key={index}>
              <h3 className="mb-3 mt-8 text-xl font-extrabold text-gray-900">
                {first.slice(4)}
              </h3>

              {lines.length > 1 && <ListOrPara lines={lines.slice(1)} />}
            </div>
          );
        }

        return <ListOrPara key={index} lines={lines} />;
      })}
    </div>
  );
}

function ListOrPara({ lines }) {
  if (!lines?.length) return null;

  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul className="list-disc space-y-2 pl-6">
        {lines.map((line, index) => (
          <li key={index}>{renderInline(line.slice(2))}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return (
      <ol className="list-decimal space-y-2 pl-6">
        {lines.map((line, index) => (
          <li key={index}>
            {renderInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p className="whitespace-pre-line">
      {renderInline(lines.join(" "))}
    </p>
  );
}



export default function ArticleDetail() {
  const { id } = useParams();
  const scrollRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const [articlesResponse, companiesResponse] = await Promise.all([
          fetch(apiUrl("/articles"), {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }),
          fetch(apiUrl("/companies"), {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }),
        ]);

        if (!articlesResponse.ok) {
          throw new Error(`Articles API failed: ${articlesResponse.status}`);
        }

        if (!companiesResponse.ok) {
          throw new Error(`Companies API failed: ${companiesResponse.status}`);
        }

        const [articlesResult, companiesResult] = await Promise.all([
          articlesResponse.json(),
          companiesResponse.json(),
        ]);

        setArticles(getArray(articlesResult));
        setCompaniesData(getArray(companiesResult));
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Article detail API error:", err);
        setError("Unable to load article data. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="mt-4 text-lg font-semibold text-gray-600">
          Loading article...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const article = articles.find(
    (item) => String(item.id) === String(id)
  );

  if (!article || !isLive(article)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Article Not Found
        </h2>
        <p className="mb-6 text-gray-600">
          This article may have been removed or is not available.
        </p>
        <Link
          to="/"
          className="font-semibold text-red-600 underline hover:text-red-700"
        >
          Go back to Home
        </Link>
      </div>
    );
  }

  const articleId = Number(article.id);

  const isSEOArticle = articleId >= 135 && articleId <= 140;

  const isBDAArticle =
    article.category === "Business Development" &&
    articleId >= 141 &&
    articleId <= 145;

  const company = companiesData.find((item) =>
    belongsTo(article, item)
  );

  const others = articles.filter(
    (item) =>
      String(item.id) !== String(article.id) && isLive(item)
  );

  let relatedArticles = [];

  if (isSEOArticle) {
    relatedArticles = others.filter((item) => {
      const relatedId = Number(item.id);
      return relatedId >= 135 && relatedId <= 140;
    });
  } else if (isBDAArticle) {
    relatedArticles = others.filter((item) => {
      const relatedId = Number(item.id);

      return (
        item.category === "Business Development" &&
        relatedId >= 141 &&
        relatedId <= 145
      );
    });
  } else if (company) {
    relatedArticles = others.filter((item) =>
      belongsTo(item, company)
    );
  } else {
    relatedArticles = [
      ...others.filter(
        (item) => item.category === article.category
      ),
      ...others.filter(
        (item) => item.category !== article.category
      ),
    ];
  }

  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SeoHead post={article} />

      <Link
        to="/"
        className="mb-6 inline-block text-sm font-semibold text-gray-500 transition hover:text-red-600"
      >
        ← Back to Home
      </Link>

      <header className="mb-6">
        {article.category && (
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {article.category}
          </span>
        )}

        <h1 className="mb-4 mt-4 text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
          {article.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-gray-200 pb-6 text-sm text-gray-600">
          {article.author && (
            <span className="font-bold text-gray-900">
              By {typeof article.author === "string"
                ? article.author
                : article.author.name || article.author.fullName || ""}
            </span>
          )}

          {article.date && (
            <>
              <span>•</span>
              <span>{article.date}</span>
            </>
          )}

          {article.readTime && (
            <>
              <span>•</span>
              <span>{article.readTime}</span>
            </>
          )}
        </div>
      </header>

      {article.image && (
        <div className="mb-8 max-h-[450px] overflow-hidden rounded-3xl bg-gray-100 shadow-lg">
          <img
            src={article.image}
            alt={article.imageAlt || article.title || "Article image"}
            loading="eager"
            fetchPriority="high"
            className="max-h-[450px] w-full object-cover"
          />
        </div>
      )}

      <article className="mb-16 space-y-4 text-base leading-relaxed text-gray-700">
        {article.contentHtml ? (
          <ArticleBody post={article} />
        ) : (
          <>
            {(article.excerpt || article.description) && (
              <p className="text-lg font-semibold text-gray-900">
                {article.excerpt || article.description}
              </p>
            )}

            {article.content && (
              <ArticleContent content={article.content} />
            )}
          </>
        )}
      </article>

      {relatedArticles.length > 0 && (
        <section className="border-t border-gray-200 pt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
              {isBDAArticle
                ? "Related BDA Articles"
                : isSEOArticle
                  ? "Related SEO Articles"
                  : "Related Articles"}
            </h2>

            {relatedArticles.length > 1 && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByAmount(-320)}
                  aria-label="Scroll related articles left"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 font-bold text-gray-800 shadow-sm transition hover:bg-gray-200"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() => scrollByAmount(320)}
                  aria-label="Scroll related articles right"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100 font-bold text-gray-800 shadow-sm transition hover:bg-gray-200"
                >
                  →
                </button>
              </div>
            )}
          </div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {relatedArticles.map((relatedArticle, index) => (
              <div
                key={relatedArticle.id || relatedArticle._id || index}
                className="w-[300px] min-w-[300px] flex-shrink-0"
              >
                <ArticleCard article={relatedArticle} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}