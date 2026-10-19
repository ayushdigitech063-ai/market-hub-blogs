import React, { useState, useEffect } from "react";
import BlogArticleCard from "../components/BlogArticleCard";
import { Sparkles, BookOpen } from "lucide-react";
import { sortLatestFirst } from "../utils/sortLatest";  
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
  console.table(
    sortLatestFirst(allArticles).map((a) => ({
      title: String(a.title).slice(0, 25),
      id: a.id,
      date: a.date,
      publishDate: a.publishDate,
      createdAt: a.createdAt,
    }))
  );
  setArticles(sortLatestFirst(allArticles));
  setLoading(false);
})
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

{/* ===== LATEST ARTICLES HERO BANNER ===== */}
<section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">
  {/* Background Image */}
  <img
    src={HERO_IMAGE}
    alt="Latest articles and digital marketing insights"
    className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-[0.85]"
  />

  {/* Same Overlay as Biography & Companies */}
  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />
  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111D32]/60 via-transparent to-[#111D32]/20" />

  {/* Hero Content - Same Width and Height */}
  <div className="mx-auto flex min-h-[360px] w-full max-w-[1600px] items-center px-5 py-10 sm:min-h-[400px] sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-14 lg:py-14 xl:min-h-[460px] xl:px-16">
    <div className="w-full max-w-3xl">

      {/* Badge */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/95 backdrop-blur-md sm:text-xs">
        <Sparkles className="h-4 w-4 shrink-0 text-[#E47742]" />
        Editorial Insights
      </div>



{/* Heading */}
<h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
  <span className="block text-white">
    Latest Articles &amp;
  </span>

  <span className="mt-2 block bg-gradient-to-r from-[#F5D98F] via-[#E8BD70] to-[#FFF0C2] bg-clip-text text-transparent">
    Digital Stories
  </span>
</h1>



      {/* Description */}
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
        Explore expert insights on SEO, social media, artificial intelligence,
        and digital marketing. Discover practical strategies, emerging trends,
        and fresh perspectives to help you stay ahead in the digital world.
      </p>

      {/* Article Count */}
      <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md sm:mt-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E47742]/20 text-[#F5D98F]">
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-bold text-white sm:text-base">
            {articles.length} Articles
          </p>
          <p className="mt-0.5 text-xs text-white/75 sm:text-sm">
            Insights for curious minds
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

{/* ===== AI CONTENT SECTION ===== */}
<section className="bg-[#F8F7F3] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
  <div className="mx-auto w-full max-w-[1600px] overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_12px_35px_rgba(23,36,61,0.07)] sm:rounded-3xl">
    <div className="grid items-stretch lg:grid-cols-2">

      {/* Left Content */}
      <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">

        {/* Badge */}
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E8D5AD] bg-[#FBF5E8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A6729] sm:text-xs">
          <span className="h-2 w-2 rounded-full bg-[#E47742]" />
          AI-Powered Insights
        </span>

        {/* Heading - Matching Hero Theme */}
        <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-[#17243D] sm:text-3xl lg:text-4xl">
          Smarter Content.
          <span className="mt-1 block bg-gradient-to-r from-[#B88635] via-[#D9A84F] to-[#E47742] bg-clip-text text-transparent">
            Better Decisions.
          </span>
        </h2>

        {/* Description */}
        <p className="mt-5 text-sm leading-7 text-[#536078] sm:text-base sm:leading-7">
          Discover how artificial intelligence is transforming the way
          businesses create, understand, and share information. From
          intelligent content strategies to data-driven insights, AI helps
          teams work smarter, communicate effectively, and uncover new
          opportunities.
        </p>

        <p className="mt-4 text-sm leading-7 text-[#536078] sm:text-base sm:leading-7">
          At Market Hub, we explore emerging technologies, practical
          applications, and responsible AI innovations to help readers
          stay informed in a changing digital world.
        </p>

        {/* Feature Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] p-4 sm:p-5">
            <p className="text-sm font-bold text-[#17243D] sm:text-base">
              Intelligent Insights
            </p>
            <p className="mt-2 text-sm leading-6 text-[#536078]">
              Understand trends and discover ideas.
            </p>
          </div>

          <div className="rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] p-4 sm:p-5">
            <p className="text-sm font-bold text-[#17243D] sm:text-base">
              Future-Ready Thinking
            </p>
            <p className="mt-2 text-sm leading-6 text-[#536078]">
              Explore technology shaping tomorrow.
            </p>
          </div>
        </div>

        {/* Closing Text */}
        <p className="mt-6 text-xs font-bold uppercase leading-5 tracking-[0.1em] text-[#B86B38] sm:text-sm">
          Explore AI. Understand Innovation. Move Forward.
        </p>
      </div>

      {/* Right Image */}
      <div className="relative min-h-[300px] overflow-hidden bg-[#17243D] sm:min-h-[360px] lg:min-h-full">
        <img
          src="https://s44783.pcdn.co/in/wp-content/uploads/sites/3/2022/12/How-to-Grow-Your-Business-with-Growth-Marketing.jpg.optimal.jpg"
          alt="AI, digital marketing and business growth"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Navy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#17243D]/85 via-[#17243D]/10 to-[#17243D]/10" />

        {/* Image Caption */}
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/20 bg-[#17243D]/90 p-4 text-white shadow-xl backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#F5D98F]">
            The Future of Business
          </p>
          <h3 className="mt-2 text-lg font-bold leading-snug sm:text-xl lg:text-2xl">
            Innovation Starts With Insight.
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
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