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

{/* ===== COMPACT PREMIUM ARTICLES HERO BANNER ===== */}
<section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#111D32] text-white">

  {/* Background Image */}
  <img
    src={HERO_IMAGE}
    alt="Latest articles and digital marketing insights"
    className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
  />

  {/* Image Overlay */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101B30]/95 via-[#101B30]/80 to-[#101B30]/40" />

  {/* Decorative Glow */}
  <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-orange-400/15 blur-3xl" />

  {/* Hero Content */}
  <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
    <div className="max-w-2xl">

      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-white/[0.08] px-3 py-1.5 backdrop-blur-sm">
        <Sparkles className="h-3 w-3 text-orange-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-200">
          Editorial Insights
        </span>
      </div>

      {/* Heading */}
      <h1 className="mt-3 font-serif text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
        Latest Articles &
        <span className="block text-orange-400">
          Digital Stories
        </span>
      </h1>

      {/* Accent */}
      <div className="mt-3 flex items-center gap-2">
        <span className="h-1 w-10 rounded-full bg-orange-400" />
        <span className="h-1 w-3 rounded-full bg-orange-200/60" />
      </div>

      {/* Description */}
      <p className="mt-3 max-w-xl text-xs leading-5 text-slate-200 sm:text-sm sm:leading-6">
        Explore expert insights on SEO, social media, artificial intelligence,
        and digital marketing. Discover practical strategies, emerging trends,
        and fresh perspectives to help you stay ahead in the digital world.
      </p>

      {/* Article Count */}
      <div className="mt-4 inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.08] px-3 py-2 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-400/15 text-orange-300">
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <p className="text-xs font-bold text-white">
            {articles.length} Articles
          </p>
          <p className="mt-0.5 text-[10px] text-slate-300">
            Insights for curious minds
          </p>
        </div>
      </div>

    </div>
  </div>

  {/* Bottom Accent */}
  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-orange-500 via-amber-300 to-orange-500" />
</section>

{/* AI Content Section */}
<section className="bg-[#F5F7FC] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
  <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_12px_35px_rgba(30,58,95,0.06)]">
    <div className="grid items-stretch lg:grid-cols-2">

      {/* Left Content */}
      <div className="flex flex-col justify-center px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-9">

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-700 sm:text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          AI-Powered Insights
        </span>

        <h2 className="mt-4 text-[25px] font-extrabold leading-[1.2] tracking-tight text-[#17243D] sm:text-[29px] lg:text-[32px]">
          Smarter Content.
          <span className="mt-1 block text-[#3977D5]">
            Better Decisions.
          </span>
        </h2>

        <div className="mt-4 h-1 w-10 rounded-full bg-[#3977D5]" />

        <p className="mt-4 text-[12px] leading-[1.8] text-[#5D687B] sm:text-[13px]">
          Discover how artificial intelligence is transforming the way
          businesses create, understand, and share information. From
          intelligent content strategies to data-driven insights, AI helps
          teams work smarter, communicate effectively, and uncover new
          opportunities.
        </p>

        <p className="mt-2.5 text-[12px] leading-[1.8] text-[#5D687B] sm:text-[13px]">
          At Market Hub, we explore emerging technologies, practical
          applications, and responsible AI innovations to help readers
          stay informed in a changing digital world.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-blue-100 bg-[#F5F8FF] p-3">
            <p className="text-[11px] font-bold text-[#17243D] sm:text-xs">
              Intelligent Insights
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#6B7587] sm:text-[11px]">
              Understand trends and discover ideas.
            </p>
          </div>

          <div className="rounded-lg border border-blue-100 bg-[#F5F8FF] p-3">
            <p className="text-[11px] font-bold text-[#17243D] sm:text-xs">
              Future-Ready Thinking
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#6B7587] sm:text-[11px]">
              Explore technology shaping tomorrow.
            </p>
          </div>
        </div>

        <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#3977D5] sm:text-[10px]">
          Explore AI. Understand Innovation. Move Forward.
        </p>
      </div>

      {/* Right Image */}
      <div className="relative min-h-[260px] overflow-hidden bg-[#E8EEF9] sm:min-h-[300px] lg:min-h-0">
        <img
          src="https://s44783.pcdn.co/in/wp-content/uploads/sites/3/2022/12/How-to-Grow-Your-Business-with-Growth-Marketing.jpg.optimal.jpg"
          alt="AI, digital marketing and business growth"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#17243D]/65 via-transparent to-[#17243D]/10" />

        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-[#17243D]/85 p-3.5 text-white shadow-xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-300">
            The Future of Business
          </p>
          <h3 className="mt-1.5 text-base font-bold sm:text-lg">
            Innovation Starts With Insight.
          </h3>
          <p className="mt-1 text-[10px] leading-5 text-white/75 sm:text-xs">
            Ideas and technology to help businesses grow with confidence.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>


{/* Author Section */}
<section className="bg-[#FBF6F1] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
  <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#EADFD5] bg-white shadow-[0_12px_35px_rgba(91,52,35,0.06)]">
    <div className="grid items-stretch lg:grid-cols-2">

      {/* Left Image */}
      <div className="relative min-h-[260px] overflow-hidden bg-[#F0E4D9] sm:min-h-[300px] lg:min-h-0">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcB_gA-22b0Q97DUScqTRvNsSn-ftAkIoHzaHYHr8zEw&s=10"
          alt="Author and content creator"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#492B25]/70 via-transparent to-[#492B25]/10" />

        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/25 bg-[#492B25]/85 p-3.5 text-white shadow-xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#F2C5A8]">
            Stories That Matter
          </p>
          <h3 className="mt-1.5 text-base font-bold sm:text-lg">
            Every Insight Has a Voice.
          </h3>
          <p className="mt-1 text-[10px] leading-5 text-white/80 sm:text-xs">
            Thoughtful perspectives, meaningful stories, and ideas worth sharing.
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex flex-col justify-center px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-9">

        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#E9CBB8] bg-[#FFF5EC] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#A65E3D] sm:text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B86B47]" />
          Meet Our Authors
        </span>

        <h2 className="mt-4 text-[25px] font-extrabold leading-[1.2] tracking-tight text-[#3B2926] sm:text-[29px] lg:text-[32px]">
          Ideas Begin With People.
          <span className="mt-1 block text-[#B86B47]">
            Stories Create Impact.
          </span>
        </h2>

        <div className="mt-4 h-1 w-10 rounded-full bg-[#B86B47]" />

        <p className="mt-4 text-[12px] leading-[1.8] text-[#74635D] sm:text-[13px]">
          Behind every meaningful article is a person with curiosity,
          experience, and a story to share. Our authors combine research,
          industry knowledge, and fresh perspectives to make complex
          topics easier to understand.
        </p>

        <p className="mt-2.5 text-[12px] leading-[1.8] text-[#74635D] sm:text-[13px]">
          From business and technology to marketing and emerging trends,
          our contributors deliver useful information that inspires
          readers to think critically, learn continuously, and make
          informed decisions.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F8E8DC] text-xs font-bold text-[#A65E3D]">
              ✓
            </span>
            <div>
              <p className="text-[11px] font-bold text-[#3B2926] sm:text-xs">
                Research-Driven Writing
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-[#81716A] sm:text-[11px]">
                Useful information backed by thoughtful research.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F8E8DC] text-xs font-bold text-[#A65E3D]">
              ✓
            </span>
            <div>
              <p className="text-[11px] font-bold text-[#3B2926] sm:text-xs">
                Clear and Practical Insights
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-[#81716A] sm:text-[11px]">
                Ideas readers can understand and apply.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F8E8DC] text-xs font-bold text-[#A65E3D]">
              ✓
            </span>
            <div>
              <p className="text-[11px] font-bold text-[#3B2926] sm:text-xs">
                A Passion for Learning
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-[#81716A] sm:text-[11px]">
                Exploring perspectives across the digital landscape.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 border-t border-[#EEE4DC] pt-4 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#A65E3D] sm:text-[10px]">
          Real Knowledge. Human Perspectives. Lasting Value.
        </p>
      </div>

    </div>
  </div>
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
            
          </div>
        )}

      </section>
    </main>
  );
}