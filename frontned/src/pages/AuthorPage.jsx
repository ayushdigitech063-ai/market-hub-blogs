import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import BlogArticleCard from "../components/BlogArticleCard";
import { Globe, ArrowLeft, BookOpen, UserRound } from "lucide-react";

const API = "http://localhost:5000/api";

const socialIcons = {
  twitter: (
    <svg
      className="h-4 w-4 text-slate-800"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),

  linkedin: (
    <svg
      className="h-4 w-4 text-blue-700"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2v-8.37H6.46M7.83 6.25a1.53 1.53 0 0 0 0 3.06 1.53 1.53 0 0 0 0-3.06z" />
    </svg>
  ),

  instagram: (
    <svg
      className="h-4 w-4 text-pink-600"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),

  youtube: (
    <svg
      className="h-4 w-4 text-red-600"
      fill="currentColor"
      viewBox="0 0 24 24"
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

export default function AuthorPage() {
  const { authorId } = useParams();

  const [author, setAuthor] = useState(null);
  const [authorArticles, setAuthorArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/blog-authors/${authorId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/blog-articles?authorId=${authorId}`).then((r) => r.json()),
    ])
      .then(([authorData, articlesList]) => {
        setAuthor(authorData);
        setAuthorArticles(Array.isArray(articlesList) ? articlesList : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching author:", err);
        setLoading(false);
      });
  }, [authorId]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-5">
        <p className="font-semibold text-slate-500">Loading author...</p>
      </main>
    );
  }

  if (!author) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-5">
        <div className="text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
            <UserRound className="h-8 w-8 text-orange-500" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-[#0F2747]">
            Author Not Found
          </h1>

          <p className="mt-2 text-slate-500">
            The author you're looking for could not be found.
          </p>

          <Link
            to="/articles"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0F2747] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16385F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>

        </div>
      </main>
    );
  }

  const socials = Object.entries(author.social || {}).filter(
    ([, url]) => url
  );

  return (
    <main className="min-h-screen bg-[#F7F9FC] text-slate-700 selection:bg-orange-100 selection:text-orange-900">

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[330px_1fr] lg:gap-10 lg:px-10 xl:px-12">

        {/* =====================================================
            LEFT AUTHOR SIDEBAR
        ===================================================== */}

        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,39,71,0.06)] lg:sticky lg:top-8">

          {/* Blue Header */}
          <div className="relative h-24 bg-gradient-to-r from-[#0F2747] via-[#16385F] to-[#2563A6]">

            {/* Orange Accent */}
            <div className="absolute right-5 top-5 h-3 w-3 rounded-full bg-orange-400" />

          </div>

          {/* Profile */}
          <div className="px-7 pb-7">

            <div className="-mt-16 relative mx-auto h-36 w-36 overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-lg">

              <img
                src={author.image}
                alt={author.name}
                className="h-full w-full object-cover"
              />

            </div>

            <h1 className="mt-5 text-center text-2xl font-serif font-bold tracking-tight text-[#0F2747]">
              {author.name}
            </h1>

            <p className="mx-auto mt-2 max-w-[250px] text-center text-[11px] font-bold uppercase leading-relaxed tracking-[0.14em] text-orange-600">
              {author.role}
            </p>

            {/* Divider */}
            <div className="my-6 h-px bg-slate-100" />

            {/* =================================================
                ORGANIZATION
            ================================================= */}

            <div>

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Organization
              </span>

              <div className="mt-2 flex items-center gap-3">

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                  <Globe className="h-4 w-4 text-orange-600" />
                </span>

                <p className="text-sm font-semibold text-[#0F2747]">
                  {author.company}
                </p>

              </div>

            </div>

            {/* =================================================
                SOCIAL LINKS
            ================================================= */}

            {socials.length > 0 && (
              <div className="mt-7 border-t border-slate-100 pt-6">

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Connect
                </span>

                <ul className="mt-3 space-y-1.5">

                  {socials.map(([name, url]) => (

                    <li key={name}>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-all duration-200 hover:bg-slate-50"
                      >

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-all group-hover:border-blue-200 group-hover:shadow">
                          {socialIcons[name] || (
                            <Globe className="h-4 w-4 text-slate-500" />
                          )}
                        </span>

                        <span className="text-xs font-semibold text-slate-600 transition-colors group-hover:text-[#0F2747]">
                          {socialLabels[name] || name}
                        </span>

                      </a>

                    </li>

                  ))}

                </ul>

              </div>
            )}

            {/* =================================================
                EDUCATION / BACKGROUND
            ================================================= */}

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

            {/* =================================================
                EXPERTISE
            ================================================= */}

            {author.expertise?.length > 0 && (
              <div className="mt-7 border-t border-slate-100 pt-6">

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Expertise
                </span>

                <div className="mt-3 flex flex-wrap gap-2">

                  {author.expertise.map((tag) => (

                    <span
                      key={tag}
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

        {/* =====================================================
            RIGHT CONTENT
        ===================================================== */}

        <section className="min-w-0">

          {/* =================================================
              ABOUT AUTHOR
          ================================================= */}

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,39,71,0.05)] sm:p-9">

            {/* Decorative Accent */}
            <div className="absolute right-0 top-0 h-1.5 w-32 bg-gradient-to-r from-orange-500 to-orange-400" />

            <div className="flex items-center gap-3">

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
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

            <p className="text-[16px] leading-8 text-slate-600">
              {author.about}
            </p>

          </div>

          {/* =================================================
              ARTICLES SECTION
          ================================================= */}

          <div className="mt-12">

            {/* Section Header */}

            <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-orange-500" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                    Latest Stories
                  </span>

                </div>

                <h2 className="mt-2 text-3xl font-serif font-bold tracking-tight text-[#0F2747]">
                  Stories by {author.name}
                </h2>

              </div>

              {/* Article Count */}

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

            {/* =================================================
                BLOG CARDS
            ================================================= */}

            <div className="grid gap-7 sm:grid-cols-2">

              {authorArticles.map((article) => (

                <div
                  key={article.slug}
                  className="group transition-all duration-300 hover:-translate-y-1"
                >
                  <BlogArticleCard
                    article={article}
                    showAuthor={false}
                  />
                </div>

              ))}

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}