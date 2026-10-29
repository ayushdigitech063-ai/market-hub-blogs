import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Sparkles, RefreshCw } from "lucide-react";
import { apiUrl } from "../api/apiConfig";
import BlogArticleCard from "../components/BlogArticleCard";
import { sortLatestFirst } from "../utils/sortLatest";


const HERO_IMAGE =
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80";

const AI_IMAGE =
  "https://s44783.pcdn.co/in/wp-content/uploads/sites/3/2022/12/How-to-Grow-Your-Business-with-Growth-Marketing.jpg.optimal.jpg";

const AUTHOR_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const getArticleTitle = (article) =>
  article?.title || article?.articleTitle || article?.name || "";

const getAuthorName = (article) => {
  const author =
    article?.author ??
    article?.authorName ??
    article?.authorInfo ??
    article?.writer ??
    article?.writerName ??
    article?.postedBy ??
    article?.createdBy ??
    article?.publishedBy ??
    article?.user ??
    article?.profile ??
    article?.byline;

  if (typeof author === "string") return author.trim();

  if (author && typeof author === "object") {
    return String(
      author.name ||
        author.fullName ||
        author.username ||
        author.displayName ||
        ""
    ).trim();
  }

  return "";
};

const getArticleList = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;

  if (Array.isArray(response?.articles)) return response.articles;

  if (Array.isArray(response?.blogArticles)) return response.blogArticles;

  return [];
};

const removeDuplicates = (articles) => {
  const seen = new Set();

  return articles.filter((article) => {
    const key = normalize(
      article?.slug ||
        article?.id ||
        article?._id ||
        getArticleTitle(article)
    );

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

const isPublished = (article) => {
  const status = normalize(article?.status);


  return !["draft", "unpublished", "deleted"].includes(status);
};

function SectionBadge({ children }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E8D5AD] bg-[#FBF5E8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A6729] sm:text-xs">
      <span className="h-2 w-2 rounded-full bg-[#E47742]" />
      {children}
    </span>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[#17243D] sm:text-base">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#536078]">{description}</p>
    </div>
  );
}

function ImageFeature({ image, alt, label, title, description }) {
  return (
    <div className="relative min-h-[300px] overflow-hidden bg-[#17243D] sm:min-h-[360px] lg:min-h-full">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#17243D]/90 via-[#17243D]/15 to-transparent" />

      <div className="absolute bottom-5 left-4 right-4 rounded-2xl border border-white/20 bg-[#17243D]/90 p-4 text-white shadow-xl backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#F5D98F]">
          {label}
        </p>

        <h3 className="mt-2 text-lg font-bold leading-snug sm:text-xl lg:text-2xl">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const controller = new AbortController();

  async function fetchArticles() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("/blog-articles"), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Unable to load articles. Server returned ${response.status}.`
        );
      }

      const result = await response.json();

      const list = getArticleList(result).filter(
        (article) =>
          article &&
          typeof article === "object" &&
          isPublished(article)
      );

      setArticles(sortLatestFirst(removeDuplicates(list)));
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Error fetching blog articles:", err);
      setError("Articles could not be loaded. Please try again.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  fetchArticles();

  return () => controller.abort();
}, []);


  const filteredArticles = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) return articles;

    return articles.filter((article) => {
      const searchableText = [
        getArticleTitle(article),
        article?.description,
        article?.shortDescription,
        article?.excerpt,
        article?.authorName,
        getAuthorName(article),
        typeof article?.author === "string" ? article.author : "",
        article?.category,
        article?.slug,
      ]
        .filter(Boolean)
        .join(" ");

      return normalize(searchableText).includes(query);
    });
  }, [articles, searchQuery]);

  const latestPerAuthor = useMemo(() => {
    const seenAuthors = new Set();

    return filteredArticles.filter((article) => {
      const authorId =
        article?.authorId ??
        article?.author?._id ??
        article?.author?.id;

      const authorName = normalize(getAuthorName(article));

   
      const authorKey = authorId
        ? `author-${authorId}`
        : authorName
          ? `author-${authorName}`
          : "";

      if (!authorKey) return true;

      if (seenAuthors.has(authorKey)) return false;

      seenAuthors.add(authorKey);
      return true;
    });
  }, [filteredArticles]);

  const handleRetry = () => {

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-white text-stone-800">
      {/* Hero */}
      <section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">
        <img
          src={HERO_IMAGE}
          alt="Technology, business and digital insights"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.55]"
        />

        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />

        <div className="mx-auto flex min-h-[360px] w-full max-w-[1600px] items-center px-5 py-10 sm:min-h-[400px] sm:px-8 lg:min-h-[440px] lg:px-14 xl:px-16">
          <div className="w-full max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md sm:text-xs">
              <Sparkles className="h-4 w-4 text-[#E47742]" />
              Editorial Insights
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
              <span className="block">Latest Articles &amp;</span>
              <span className="mt-2 block bg-gradient-to-r from-[#F5D98F] via-[#E8BD70] to-[#FFF0C2] bg-clip-text text-transparent">
                Digital Stories
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Explore expert insights on SEO, social media, artificial
              intelligence, business and digital marketing. Discover practical
              strategies, emerging trends and fresh perspectives.
            </p>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E47742]/20 text-[#F5D98F]">
                <BookOpen className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-bold text-white">
                  {articles.length} Articles
                </p>
                <p className="text-xs text-white/75">
                  Insights for curious minds
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

   
      <section className="bg-[#F8F7F3] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-[1600px] overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_12px_35px_rgba(23,36,61,0.07)] sm:rounded-3xl">
          <div className="grid items-stretch lg:grid-cols-2">
            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
              <SectionBadge>AI-Powered Insights</SectionBadge>

              <h2 className="mt-5 text-2xl font-bold leading-tight text-[#17243D] sm:text-3xl lg:text-4xl">
                Smarter Content.
                <span className="mt-1 block bg-gradient-to-r from-[#B88635] via-[#D9A84F] to-[#E47742] bg-clip-text text-transparent">
                  Better Decisions.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#536078] sm:text-base">
                Discover how artificial intelligence is transforming the way
                businesses create, understand and share information. Explore
                intelligent content strategies, data-driven insights and
                practical applications.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#536078] sm:text-base">
                At Market Hub, we explore emerging technologies and responsible
                AI innovations to help readers stay informed in a changing
                digital world.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <FeatureCard
                  title="Intelligent Insights"
                  description="Understand trends and discover useful ideas."
                />
                <FeatureCard
                  title="Future-Ready Thinking"
                  description="Explore technology shaping tomorrow."
                />
              </div>

              <p className="mt-6 text-xs font-bold uppercase leading-5 tracking-[0.1em] text-[#B86B38] sm:text-sm">
                Explore AI. Understand Innovation. Move Forward.
              </p>
            </div>

            <ImageFeature
              image={AI_IMAGE}
              alt="Digital marketing and business growth"
              label="The Future of Business"
              title="Innovation Starts With Insight."
              description="Ideas and technology to help businesses grow with confidence."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#F8F7F3] px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12">
        <div className="mx-auto w-full max-w-[1600px] overflow-hidden rounded-2xl border border-[#E8E3D8] bg-white shadow-[0_12px_35px_rgba(23,36,61,0.07)] sm:rounded-3xl">
          <div className="grid items-stretch lg:grid-cols-2">
            <ImageFeature
              image={AUTHOR_IMAGE}
              alt="Content creation and editorial research"
              label="Stories That Matter"
              title="Every Insight Has a Voice."
              description="Thoughtful perspectives, meaningful stories and ideas worth sharing."
            />

            <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-12">
              <SectionBadge>Meet Our Authors</SectionBadge>

              <h2 className="mt-5 text-2xl font-bold leading-tight text-[#17243D] sm:text-3xl lg:text-4xl">
                Ideas Begin With People.
                <span className="mt-1 block bg-gradient-to-r from-[#B88635] via-[#D9A84F] to-[#E47742] bg-clip-text text-transparent">
                  Stories Create Impact.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#536078] sm:text-base">
                Behind every meaningful article is a person with curiosity,
                experience and a story to share. Our authors combine research,
                industry knowledge and fresh perspectives to make complex
                topics easier to understand.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#536078] sm:text-base">
                From business and technology to marketing and emerging trends,
                our contributors deliver useful information that helps readers
                learn and make informed decisions.
              </p>

              <div className="mt-6 grid gap-3 sm:gap-4">
                {[
                  [
                    "Research-Driven Writing",
                    "Useful information backed by thoughtful research.",
                  ],
                  [
                    "Clear and Practical Insights",
                    "Ideas readers can understand and apply.",
                  ],
                  [
                    "A Passion for Learning",
                    "Exploring perspectives across the digital landscape.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-[#E8E3D8] bg-[#F8F7F3] p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FBF5E8] text-xs font-bold text-[#B86B38]">
                      ✓
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-[#17243D] sm:text-base">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#536078]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xs font-bold uppercase leading-5 tracking-[0.1em] text-[#B86B38] sm:text-sm">
                Real Knowledge. Human Perspectives. Lasting Value.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center gap-3 border-b border-stone-200 pb-4">
          <span className="h-8 w-1.5 rounded-full bg-amber-500" />

          <div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              Featured Publications
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Explore in-depth analysis and modern digital trends
            </p>
          </div>
        </div>

        {loading ? (
          <div
            className="py-20 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="inline-flex items-center gap-3 text-sm font-medium text-amber-600">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Loading articles...
            </div>
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
            role="alert"
          >
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-red-500" />

            <h3 className="text-lg font-bold text-stone-900">
              Unable to load articles
            </h3>

            <p className="mt-2 text-sm text-stone-600">{error}</p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17243D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#263957] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : latestPerAuthor.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-amber-600" />

            <h3 className="font-serif text-lg font-bold text-stone-900">
              No articles found
            </h3>

            <p className="mt-2 text-sm text-stone-600">
              {searchQuery
                ? "Try a different search term."
                : "Check back later for new stories and updates."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-stone-500" aria-live="polite">
              Showing {latestPerAuthor.length}{" "}
              {latestPerAuthor.length === 1 ? "article" : "articles"}
              {searchQuery ? ` for "${searchQuery}"` : ""}
            </p>

            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPerAuthor.map((article, index) => (
                <div
                  key={
                    article.slug ||
                    article.id ||
                    article._id ||
                    `${getArticleTitle(article)}-${index}`
                  }
                  className="flex min-w-0 flex-col"
                >
                  <BlogArticleCard article={article} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}