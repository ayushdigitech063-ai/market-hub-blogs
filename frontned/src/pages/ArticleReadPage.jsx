
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SeoHead from "../components/SeoHead";
import ArticleBody from "../components/ArticleBody";
import { apiUrl } from "../api/apiConfig";

export default function ArticleReadPage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchArticle = async () => {
      setLoading(true);
      setError("");
      setArticle(null);
      setAuthor(null);

      try {
      
        const response = await fetch(
          apiUrl(`/blog-articles/slug/${encodeURIComponent(slug)}`),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setArticle(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch article (${response.status})`);
        }

        const articleData = await response.json();
        setArticle(articleData);


        if (articleData?.authorId) {
          try {
            const authorResponse = await fetch(
              apiUrl(
                `/blog-authors/${encodeURIComponent(articleData.authorId)}`
              ),
              { signal: controller.signal }
            );

            if (authorResponse.ok) {
              const authorData = await authorResponse.json();
              setAuthor(authorData);
            }
          } catch (authorError) {
            if (authorError.name === "AbortError") {
              return;
            }


            console.error("Error fetching author:", authorError);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Error fetching article:", err);
        setError("Unable to load this article. Please try again later.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchArticle();
    } else {
      setArticle(null);
      setLoading(false);
    }

    return () => controller.abort();
  }, [slug]);


  if (loading) {
    return (
      <main
        className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold text-slate-600">
          Loading article...
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load article
          </h1>

          <p className="mt-2 text-slate-600">{error}</p>

          <Link
            to="/articles"
            className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Back to articles
          </Link>
        </div>
      </main>
    );
  }

  if (!article || article.status === "draft") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Article not found
          </h1>

          <p className="mt-2 text-slate-600">
            This article does not exist or was removed.
          </p>

          <Link
            to="/articles"
            className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Back to articles
          </Link>
        </div>
      </main>
    );
  }


  const seoPost = {
    ...article,
    author: author?.name || "",
  };

  return (
    <main className="min-h-screen bg-white">
      <SeoHead post={seoPost} />

      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {/* Breadcrumb */}
        <div>
          <Link
            to="/articles"
            className="text-sm text-slate-500 transition hover:text-red-600"
          >
            Articles
          </Link>

          <span className="mx-2 text-slate-300">/</span>

          <span className="text-sm font-semibold text-red-600">
            {article.category}
          </span>
        </div>


        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          {article.title}
        </h1>


        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          {author && (
            <Link
              to={`/author/${author.id}`}
              className="flex items-center gap-2 font-semibold text-slate-800 transition hover:text-red-600"
            >
              {author.image && (
                <img
                  src={author.image}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}

              {author.name}
            </Link>
          )}

          {article.readTime && <span>{article.readTime}</span>}

          {article.date && <span>{article.date}</span>}
        </div>


        {article.image && (
          <img
            src={article.image}
            alt={article.imageAlt || article.title}
            fetchPriority="high"
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
          />
        )}

        <div className="mt-8 text-base text-slate-700 sm:text-lg">
          {article.contentHtml ? (
            <ArticleBody post={article} />
          ) : (
            <div className="space-y-5 leading-8">
              {(Array.isArray(article.content) ? article.content : []).map(
                (paragraph, index) => (
                  <p key={`${index}-${paragraph}`}>{paragraph}</p>
                )
              )}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}