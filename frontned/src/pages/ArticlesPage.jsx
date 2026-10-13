import React, { useState, useEffect } from "react";
import BlogArticleCard from "../components/BlogArticleCard";
import { Sparkles, BookOpen } from "lucide-react";

import { useSearchParams } from "react-router-dom";


const API = "https://market-hub-blogs-backend.onrender.com/api";
const HERO_IMAGE = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80";

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
const searchQuery = searchParams.get("search") || "";
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  Promise.all([
    fetch(`${API}/blog-articles`).then((r) => {
      if (!r.ok) throw new Error("Articles fetch failed");
      return r.json();
    }),
  ])
    .then(([allArticles]) => {
      setArticles(Array.isArray(allArticles) ? allArticles : []);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching articles:", err);
      setLoading(false);
    });
}, []);

const filteredArticles = articles.filter((article) => {
  const query = searchQuery.trim().toLowerCase();

  if (!query) return true;

  const searchableText = [
    article.title,
    article.articleTitle,
    article.name,
    article.description,
    article.shortDescription,
    article.author,
    article.authorName,
    article.category,
    article.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
});
  return (
    <main className="min-h-screen bg-white text-stone-800">
      
      {/* ===== HERO BANNER WITH CLEAR VISIBLE IMAGE ===== */}
      <section className="relative overflow-hidden bg-stone-900 text-white border-b border-stone-200">
        <img
          src={HERO_IMAGE}
          alt="Articles Hero"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-60 brightness-95"
        />
        {/* Soft gradient taaki image clear dikhe aur text bhi legible ho */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl space-y-4">
            
            {/* Tag */}
            <div className="inline-flex items-center space-x-2 bg-amber-500 text-stone-950 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editorial Insights</span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              Latest Articles & <span className="text-amber-400">Digital Stories</span>
            </h1>

            {/* Description */}
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed font-medium drop-shadow">
              Latest stories on SEO, social media, AI and digital marketing written by industry experts.
            </p>

            <div className="pt-1">
              <span className="text-xs text-stone-200 font-light drop-shadow">
                <strong className="text-amber-400 font-semibold">{articles.length}</strong> featured expert articles available
              </span>
            </div>

          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
      </section>

      {/* ===== ARTICLES GRID SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-amber-500" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Featured Publications
              </h2>
              <p className="text-xs text-stone-500 font-normal mt-0.5">
                Explore in-depth analysis and modern digital trends
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center space-x-2 text-amber-600 font-medium text-xs sm:text-sm">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading articles...</span>
            </div>
          </div>
       ) : filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-16 text-center shadow-xs">
            <BookOpen className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-stone-900">
              No articles found
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 font-light">
              Check back later for new stories and updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
           {filteredArticles.map((article) => (
              <div key={article.slug || article.id} className="flex flex-col">
                <BlogArticleCard article={article} />
              </div>
            ))}
            <h3 className="text-xl font-serif font-bold text-stone-900">
  {searchQuery ? "No matching articles found" : "No articles found"}
</h3>
          </div>
        )}

      </section>
    </main>
  );
}