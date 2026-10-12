import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AUTHORS_URL = "http://localhost:5000/api/blog-authors";

/* Authors ek baar fetch honge, baaki cards cache se lenge */
let authorsPromise = null;
const loadAuthors = () => {
  if (!authorsPromise) {
    authorsPromise = fetch(AUTHORS_URL)
      .then((r) => r.json())
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => {
        authorsPromise = null; 
        return [];
      });
  }
  return authorsPromise;
};

/* Card ko pura <Link> me nahi lapeta: article aur author ke links alag hain */
export default function BlogArticleCard({ article, showAuthor = true }) {
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!showAuthor || !article.authorId) {
      setAuthor(null);
      return;
    }
    loadAuthors().then((list) => {
      if (alive) {
        setAuthor(list.find((a) => a.id === article.authorId) || null);
      }
    });
    return () => {
      alive = false;
    };
  }, [article.authorId, showAuthor]);

  const articlePath = `/articles/${article.slug}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={articlePath} className="block overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-sm font-semibold text-red-600">{article.category}</span>

        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
          <Link to={articlePath} className="transition hover:text-red-600">
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{article.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
          {showAuthor && author && (
            <Link
              to={`/author/${author.id}`}
              className="flex items-center gap-2 font-semibold text-slate-800 transition hover:text-red-600"
            >
              <img
                src={author.image || "https://via.placeholder.com/150"}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
              {author.name}
            </Link>
          )}
          <span>{article.readTime}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </article>
  );
}