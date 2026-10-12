
import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article, basePath }) {
  const url = basePath
    ? `${basePath}/${article.slug}`
    : `/article/${article.id}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/10">

      {/* Image Section */}
      <Link
        to={url}
        className="relative block overflow-hidden bg-slate-100 p-2.5"
      >
        <img
          src={article.image}
          alt={article.title || "Article image"}
          loading="lazy"
          className="h-48 w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105 sm:h-52"
        />

        {/* Image Overlay */}
        <div className="pointer-events-none absolute inset-2.5 rounded-xl bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />

        {/* Category Badge */}
        {article.category && (
          <span className="absolute bottom-5 left-5 max-w-[85%] truncate rounded-full border border-teal-100 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 shadow-sm sm:text-[11px]">
            {article.category}
          </span>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">

        {/* Decorative Accent */}
        <div className="mb-3 h-1 w-10 rounded-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-300 group-hover:w-16" />

        {/* Article Title */}
        <Link to={url}>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-[#12345A] transition-colors duration-300 group-hover:text-teal-700 sm:text-xl">
            {article.title}
          </h3>
        </Link>

        {/* Author & Read Time */}
        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">

            {/* Author */}
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-sm font-bold text-teal-800 transition-colors group-hover:border-amber-300 group-hover:bg-amber-50">
                {article.author?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Written by
                </p>
                <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                  {article.author || "Editorial Team"}
                </p>
              </div>
            </div>

            {/* Read Time */}
            <span className="shrink-0 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-2 text-[10px] font-medium text-slate-600 sm:text-xs">
              {article.readTime || "5 min read"}
            </span>
          </div>

          {/* Read Article Button */}
          <Link
            to={url}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#12345A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-teal-600 hover:shadow-md hover:shadow-teal-600/20"
          >
            <span>Read Article</span>
            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}