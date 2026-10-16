import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import ArticleCard from '../components/ArticleCard';
import SeoHead from '../components/SeoHead';
import ArticleBody from '../components/ArticleBody';

// =====================================================
// **bold** ko <strong> me convert karta hai
// =====================================================
const renderInline = (text) => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong
        key={i}
        className="text-gray-900"
      >
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
};

// =====================================================
// ARTICLE COMPANY MATCH
// 1) Article ka Company Slug  2) Article ki Category  3) Start/End ID range
// =====================================================
const toSlug = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const slugMatches = (value, c) => {
  const key = toSlug(value);
  const slug = String(c.slug || '').toLowerCase();
  return !!key && (key === slug || slug.startsWith(`${key}-`));
};

const belongsTo = (item, c) => {
  // Article me Company Slug bhara ho to wahi final hai
  if (String(item.company || '').trim()) return slugMatches(item.company, c);
  // Warna category company ke naam/slug se match ho (jaise category "Microsoft")
  if (slugMatches(item.category, c)) return true;
  // Last me purani Start/End Article ID range
  return item.id >= c.startId && item.id <= c.endId;
};

// Draft articles public site par nahi dikhte
// (purane articles me status nahi hota, wo published maane jaate hain)
const isLive = (item) => item.status !== 'draft';

// =====================================================
// CONTENT RENDERER (purane articles ke liye)
// Headings / Lists / Paragraphs
// =====================================================
function ArticleContent({ content }) {
  if (!content) return null;

  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) return null;

        const first = lines[0];

        // Heading
        if (first.startsWith('### ')) {
          const rest = lines.slice(1);

          return (
            <div key={i}>
              <h3 className="text-xl font-extrabold text-gray-900 mt-8 mb-3">
                {first.slice(4)}
              </h3>

              {rest.length > 0 && (
                <ListOrPara lines={rest} />
              )}
            </div>
          );
        }

        return (
          <ListOrPara
            key={i}
            lines={lines}
          />
        );
      })}
    </div>
  );
}

// =====================================================
// LIST / PARAGRAPH
// =====================================================
function ListOrPara({ lines }) {
  if (!lines || lines.length === 0) {
    return null;
  }

  // Unordered list
  if (lines.every((line) => line.startsWith('- '))) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {lines.map((line, i) => (
          <li key={i}>
            {renderInline(line.slice(2))}
          </li>
        ))}
      </ul>
    );
  }

  // Numbered list
  if (lines.every((line) => /^\d+\.\s/.test(line))) {
    return (
      <ol className="list-decimal pl-6 space-y-2">
        {lines.map((line, i) => (
          <li key={i}>
            {renderInline(
              line.replace(/^\d+\.\s/, '')
            )}
          </li>
        ))}
      </ol>
    );
  }

  // Normal paragraph
  return (
    <p>
      {renderInline(lines.join(' '))}
    </p>
  );
}

// =====================================================
// ARTICLE DETAIL
// =====================================================
export default function ArticleDetail() {
  const { id } = useParams();
  const scrollRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // PAGE TOP
  // =====================================================
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [id]);

  // =====================================================
  // BACKEND SE ARTICLES + COMPANIES
  // =====================================================
  useEffect(() => {
    Promise.all([
      fetch('https://market-hub-blogs-backend.onrender.com/api/articles').then((r) => r.json()),
      fetch('https://market-hub-blogs-backend.onrender.com/api/companies').then((r) => r.json()),
    ])
      .then(([articlesList, companiesList]) => {
        setArticles(articlesList);
        setCompaniesData(companiesList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching:', err);
        setLoading(false);
      });
  }, []);

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-600 font-semibold text-lg">
          Loading article...
        </p>
      </div>
    );
  }

  // =====================================================
  // CURRENT ARTICLE
  // =====================================================
  const article = articles.find(
    (item) => String(item.id) === String(id)
  );

  // =====================================================
  // ARTICLE NOT FOUND (draft bhi "not found" hai)
  // =====================================================
  if (!article || !isLive(article)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Article Not Found
        </h2>

        <Link
          to="/"
          className="text-red-600 underline font-semibold"
        >
          Go back to Home
        </Link>
      </div>
    );
  }

  // =====================================================
  // SEO ARTICLES
  // ID 135 - 140
  // =====================================================
  const isSEOArticle =
    Number(article.id) >= 135 &&
    Number(article.id) <= 140;

  // =====================================================
  // BDA ARTICLES
  // ID 141 - 145
  // =====================================================
  const isBDAArticle =
    article.category === 'Business Development' &&
    Number(article.id) >= 141 &&
    Number(article.id) <= 145;

  // =====================================================
  // COMPANY (backend wali companies se)
  // =====================================================
  const company = companiesData.find((c) => belongsTo(article, c));

  // =====================================================
  // ALL OTHER ARTICLES
  // Current article aur drafts ko remove karta hai
  // =====================================================
  const others = articles.filter(
    (item) => String(item.id) !== String(article.id) && isLive(item)
  );

  // =====================================================
  // RELATED ARTICLES
  // =====================================================
  let relatedArticles;

  if (isSEOArticle) {
    relatedArticles = others.filter(
      (item) =>
        Number(item.id) >= 135 &&
        Number(item.id) <= 140
    );
  } else if (isBDAArticle) {
    relatedArticles = others.filter(
      (item) =>
        item.category === 'Business Development' &&
        Number(item.id) >= 141 &&
        Number(item.id) <= 145
    );
  } else if (company) {
    relatedArticles = others.filter((item) => belongsTo(item, company));
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

  // =====================================================
  // SCROLL
  // =====================================================
  const scrollByAmount = (amount) => {
    scrollRef.current?.scrollBy({
      left: amount,
      behavior: 'smooth',
    });
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* title, meta, canonical, OG, Twitter, JSON-LD (Article + FAQ schema) */}
      <SeoHead post={article} />

      <Link
        to="/"
        className="text-sm font-semibold text-gray-500 hover:text-red-600 transition mb-6 inline-block"
      >
        ← Back to Home
      </Link>

      <div className="mb-6">
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {article.category}
        </span>

        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mt-4 mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 border-b border-gray-200 pb-6 mb-6">
          <span className="font-bold text-gray-900">
            By {article.author}
          </span>

          {article.date && (
            <>
              <span>•</span>
              <span>{article.date}</span>
            </>
          )}

          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden shadow-lg mb-8 max-h-[450px]">
        <img
          src={article.image}
          alt={article.imageAlt || article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-gray-700 leading-relaxed text-base space-y-4 mb-16">
        {article.contentHtml ? (
          // Naya article: HTML content + Table of Contents + FAQ accordion
          <ArticleBody post={article} />
        ) : (
          // Purana article (contentHtml nahi hai): pehle jaisa hi dikhega
          <>
            {(article.excerpt || article.description) && (
              <p className="font-semibold text-lg text-gray-900">
                {article.excerpt || article.description}
              </p>
            )}

            {article.content && (
              <ArticleContent
                content={article.content}
              />
            )}
          </>
        )}
      </div>

      {relatedArticles.length > 0 && (
        <div className="border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-gray-900">
              {isBDAArticle
                ? 'Related BDA Articles'
                : isSEOArticle
                  ? 'Related SEO Articles'
                  : 'Related Articles'}
            </h3>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollByAmount(-350)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-800 font-bold transition cursor-pointer shadow-sm"
                aria-label="Scroll Left"
              >
                ←
              </button>

              <button
                onClick={() => scrollByAmount(350)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-800 font-bold transition cursor-pointer shadow-sm"
                aria-label="Scroll Right"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                className="min-w-[300px] max-w-[300px] flex-shrink-0"
              >
                <ArticleCard
                  article={rel}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}