
import React from "react";
import { Link } from "react-router-dom";

export default function BrandCard({ item }) {
  // Product ID ranges
  const isVivo = item.id >= 135 && item.id <= 140;
  const isMac = item.id >= 141 && item.id <= 145;
  const isEarbuds = item.id >= 146 && item.id <= 150;

  // Product type
  const isProduct = isVivo || isMac || isEarbuds;

  // Title
  const title =
    item.name ||
    item.articleTitle ||
    item.title ||
    "Untitled Product";

  // Description
  const description =
    item.description ||
    item.shortDescription ||
    item.snippet ||
    "";

  // Brand name
  const brand = isVivo
    ? "Vivo"
    : isMac
      ? "Apple"
      : item.brand || (isEarbuds ? "Earbuds" : "Brand");

  // Image fallback
  const displayImage =
    item.imageUrl ||
    item.image ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdwcMdauwH9KNnIugo7yWr7glEBG6n8WPMbpe5qdEjsg&s=10";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-300 hover:shadow-xl hover:shadow-slate-900/10">

      {/* Image Section */}
      <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-teal-50/60 p-5 sm:h-[240px]">

        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
        />

        {/* Brand Badge */}
        <span className="absolute left-4 top-4 rounded-full border border-teal-100 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 shadow-sm backdrop-blur-sm">
          {brand}
        </span>

        {/* Product Label */}
        {isProduct && (
          <span className="absolute right-4 top-4 rounded-full bg-[#12345A] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm">
            Product
          </span>
        )}

        {/* Golden Accent */}
        <div className="absolute bottom-0 left-5 h-1 w-12 rounded-t-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-300 group-hover:w-20" />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">

        <div>
          {/* Small Category Label */}
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Featured {isProduct ? "Product" : "Brand"}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-3 line-clamp-2 min-h-[52px] text-lg font-bold leading-snug tracking-tight text-[#12345A] transition-colors duration-300 group-hover:text-teal-700 sm:text-xl">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="line-clamp-3 min-h-[60px] text-xs leading-6 text-slate-600 sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Button */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <Link
            to={`/brand/${item.slug || item.id}`}
            className="group/btn flex h-12 w-full items-center justify-between rounded-xl bg-[#12345A] px-5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-teal-600 hover:shadow-md hover:shadow-teal-600/20 sm:text-sm"
          >
            <span>Explore {isProduct ? "Product" : "Brand"}</span>

            <span className="text-base transition-transform duration-300 group-hover/btn:translate-x-1.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}