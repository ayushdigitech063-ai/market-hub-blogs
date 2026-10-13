import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const API = "https://market-hub-blogs-backend.onrender.com/api";

export default function ArticleReadPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/blog-articles/slug/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(async (art) => {
        setArticle(art);
        if (art && art.authorId) {
          const a = await fetch(`${API}/blog-authors/${art.authorId}`).then((r) =>
            r.ok ? r.json() : null
          );
          setAuthor(a);
        } else {
          setAuthor(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">
        <p className="font-semibold text-slate-600">Loading article...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Article not found</h1>
          <p className="mt-2 text-slate-600">This article does not exist or was removed.</p>
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

  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link to="/articles" className="text-sm text-slate-500 transition hover:text-red-600">
          Articles
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-sm font-semibold text-red-600">{article.category}</span>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          {author && (
            <Link
              to={`/author/${author.id}`}
              className="flex items-center gap-2 font-semibold text-slate-800 transition hover:text-red-600"
            >
              <img src={author.image} alt="" className="h-9 w-9 rounded-full object-cover" />
              {author.name}
            </Link>
          )}
          <span>{article.readTime}</span>
          <span>{article.date}</span>
        </div>

        <img
          src={article.image}
          alt={article.title}
          className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
        />

        <div className="mt-8 space-y-5 text-base leading-8 text-slate-700 sm:text-lg">
          {(article.content || []).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>
    </main>
  );
}