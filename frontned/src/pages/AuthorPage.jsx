
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Globe,
  ArrowLeft,
  BookOpen,
  UserRound,
  RefreshCw,
} from "lucide-react";

import BlogArticleCard from "../components/BlogArticleCard";
import { sortLatestFirst } from "../utils/sortLatest";
import { apiUrl } from "../api/apiConfig";

const socialIcons = {
  twitter: (
    <svg
      className="h-4 w-4 text-slate-800"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),

  linkedin: (
    <svg
      className="h-4 w-4 text-blue-700"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2v-8.37H6.46M7.83 6.25a1.53 1.53 0 0 0 0 3.06 1.53 1.53 0 0 0 0-3.06z" />
    </svg>
  ),

  instagram: (
    <svg
      className="h-4 w-4 text-pink-600"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),

  youtube: (
    <svg
      className="h-4 w-4 text-red-600"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

const socialLabels = {
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
};

const getArticleList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.articles)) return data.articles;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getAuthorData = (data) => {
  if (!data || typeof data !== "object") return null;

  // Supports common API response formats.
  const author = data.author ?? data.data ?? data;

  return author && typeof author === "object" && !Array.isArray(author)
    ? author
    : null;
};

const isValidSocialUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

function LoadingState() {
  return (
    <main
      className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-5"
      aria-live="polite"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563A6]" />
        <p className="font-semibold text-slate-500">Loading author...</p>
      </div>
    </main>
  );
}

function MessageState({
  title,
  message,
  onRetry,
  showBackButton = true,
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
          <UserRound className="h-8 w-8 text-orange-500" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#0F2747]">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2747] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16385F]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}

          {showBackButton && (
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#0F2747] transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AuthorPage() {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [authorArticles, setAuthorArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authorId) {
      setAuthor(null);
      setAuthorArticles([]);
      setError("The author URL is missing a valid author ID.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAuthorPage = async () => {
      setLoading(true);
      setError("");
      setAuthor(null);
      setAuthorArticles([]);

      try {
        const encodedAuthorId = encodeURIComponent(authorId);

        const [authorResponse, articlesResponse] = await Promise.all([
          fetch(apiUrl(`/blog-authors/${encodedAuthorId}`), {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }),
          fetch(
            apiUrl(`/blog-articles?authorId=${encodedAuthorId}`),
            {
              headers: { Accept: "application/json" },
              signal: controller.signal,
            }
          ),
        ]);

        if (!authorResponse.ok) {
          if (authorResponse.status === 404) {
            setAuthor(null);
            return;
          }

          throw new Error(
            `Unable to load author. Server returned ${authorResponse.status}.`
          );
        }

        if (!articlesResponse.ok) {
          throw new Error(
            `Unable to load articles. Server returned ${articlesResponse.status}.`
          );
        }

        const [authorResult, articlesResult] = await Promise.all([
          authorResponse.json(),
          articlesResponse.json(),
        ]);

        const authorData = getAuthorData(authorResult);

        if (!authorData) {
          setAuthor(null);
          return;
        }

        const articles = getArticleList(articlesResult).filter(
          (article) =>
            article &&
            typeof article === "object" &&
            !Array.isArray(article)
        );

        setAuthor(authorData);
        setAuthorArticles(sortLatestFirst(articles));
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Error fetching author page:", err);
        setError(
          "We couldn't load this author profile. Please check your connection and try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAuthorPage();

    return () => controller.abort();
  }, [authorId]);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <MessageState
        title="Unable to Load Profile"
        message={error}
        onRetry={() => {
          // Re-trigger the effect without changing the URL.
          setLoading(true);
          setError("");
          setAuthor(null);
          setAuthorArticles([]);

          // The browser reload is a reliable fallback for retrying
          // the current route and its API requests.
          window.location.reload();
        }}
        showBackButton
      />
    );
  }

  if (!author) {
    return (
      <MessageState
        title="Author Not Found"
        message="The author you're looking for could not be found."
      />
    );
  }

  const authorName = author.name || "Author";
  const authorSocials =
    author.social && typeof author.social === "object"
      ? Object.entries(author.social).filter(([, url]) =>
          isValidSocialUrl(url)
        )
      : [];

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-700 selection:bg-orange-100 selection:text-orange-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[330px_1fr] lg:gap-10 lg:px-10 xl:px-12">
        {/* Author Sidebar */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,39,71,0.06)] lg:sticky lg:top-8">
          <div className="relative h-24 bg-gradient-to-r from-[#0F2747] via-[#16385F] to-[#2563A6]">
            <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-orange-400" />
          </div>

          <div className="px-7 pb-7">
            <div className="relative mx-auto -mt-16 h-36 w-36 overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-lg">
              {author.image ? (
                <img
                  src={author.image}
                  alt={authorName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound className="h-14 w-14 text-slate-400" />
                </div>
              )}
            </div>

            <h1 className="mt-5 break-words text-center text-2xl font-serif font-bold tracking-tight text-[#0F2747]">
              {authorName}
            </h1>

            {author.role && (
              <p className="mx-auto mt-2 max-w-[250px] text-center text-[11px] font-bold uppercase leading-relaxed tracking-[0.14em] text-orange-600">
                {author.role}
              </p>
            )}

            <div className="my-6 h-px bg-slate-100" />

            {author.company && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Organization
                </span>

                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                    <Globe className="h-4 w-4 text-orange-600" />
                  </span>

                  <p className="break-words text-sm font-semibold text-[#0F2747]">
                    {author.company}
                  </p>
                </div>
              </div>
            )}

            {authorSocials.length > 0 && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Connect
                </span>

                <ul className="mt-3 space-y-1.5">
                  {authorSocials.map(([name, url]) => (
                    <li key={name}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${authorName} on ${socialLabels[name] || name}`}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition group-hover:border-blue-200 group-hover:shadow">
                          {socialIcons[name] || (
                            <Globe className="h-4 w-4 text-slate-500" />
                          )}
                        </span>

                        <span className="break-words text-xs font-semibold capitalize text-slate-600 transition-colors group-hover:text-[#0F2747]">
                          {socialLabels[name] || name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {author.education && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Background
                </span>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {author.education}
                </p>
              </div>
            )}

            {Array.isArray(author.expertise) &&
              author.expertise.length > 0 && (
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Expertise
                  </span>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {author.expertise.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-[#2563A6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0">
          {/* About Author */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,39,71,0.05)] sm:p-9">
            <div className="absolute right-0 top-0 h-1.5 w-32 bg-gradient-to-r from-orange-500 to-orange-400" />

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <UserRound className="h-5 w-5 text-[#2563A6]" />
              </span>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Author Profile
                </span>

                <h2 className="mt-0.5 text-2xl font-serif font-bold tracking-tight text-[#0F2747]">
                  About the Author
                </h2>
              </div>
            </div>

            <div className="my-5 h-px bg-slate-100" />

            <p className="whitespace-pre-line break-words text-base leading-8 text-slate-600">
              {author.about || "Author biography is not available yet."}
            </p>
          </div>

          {/* Author Articles */}
          <div className="mt-12">
            <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                    Latest Stories
                  </span>
                </div>

                <h2 className="mt-2 break-words text-3xl font-serif font-bold tracking-tight text-[#0F2747]">
                  Stories by {authorName}
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm sm:self-auto">
                <BookOpen className="h-4 w-4 text-[#2563A6]" />

                <span className="text-xs font-bold text-[#0F2747]">
                  {authorArticles.length}
                </span>

                <span className="text-xs font-medium text-slate-500">
                  Articles
                </span>
              </div>
            </div>

            {authorArticles.length > 0 ? (
              <div className="grid gap-7 sm:grid-cols-2">
                {authorArticles.map((article, index) => (
                  <div
                    key={article._id || article.id || article.slug || index}
                    className="min-w-0 transition-transform duration-300 hover:-translate-y-1"
                  >
                    <BlogArticleCard
                      article={article}
                      showAuthor={false}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <BookOpen className="mx-auto h-9 w-9 text-slate-300" />

                <h3 className="mt-4 text-lg font-semibold text-[#0F2747]">
                  No articles yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  This author hasn't published any articles yet.
                </p>

                <Link
                  to="/articles"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563A6] hover:text-[#0F2747]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Explore all articles
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
