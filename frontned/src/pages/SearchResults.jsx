import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, LoaderCircle, ArrowUpRight } from "lucide-react";
import {
  loadSearchIndex,
  searchItems,
  SEARCH_TYPES,
  TYPE_ICONS,
} from "../api/searchApi";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    let cancelled = false;

    loadSearchIndex()
      .then(({ items, failed }) => {
        if (cancelled) return;
        setAllResults(items);
        setFailedSources(failed);
      })
      .catch((error) => console.error("Search failed:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(
    () => searchItems(allResults, query, { type: activeType }),
    [allResults, query, activeType]
  );

  const types = ["All", ...SEARCH_TYPES];

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-[#E8D9B5] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A87922]">
            <Search size={16} />
            Website Search
          </div>

          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Search Results
          </h1>

          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            {query
              ? `Searching across your website for "${query}"`
              : "Search articles, companies, brands, authors and biographies."}
          </p>

          <form
            action="/search"
            method="get"
            className="mt-6 flex gap-2"
          >
            <input
              name="q"
              defaultValue={query}
              placeholder="Search anything..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#C49A3A] focus:ring-2 focus:ring-[#C49A3A]/20"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#B8862B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#91651C]"
            >
              <Search size={17} />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {query && (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    activeType === type
                      ? "border-[#B8862B] bg-[#B8862B] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#D7B66C] hover:text-[#91651C]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mb-5 mt-6 flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-bold text-slate-900">
                {loading
                  ? "Finding results..."
                  : `${results.length} result${results.length === 1 ? "" : "s"} found`}
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#A87922]">
                <LoaderCircle className="animate-spin" size={22} />
                Searching your content...
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Search className="mx-auto text-slate-400" size={36} />
                <h3 className="mt-4 font-serif text-xl font-bold text-slate-800">
                  No matching results
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try another keyword or search for a company, article,
                  person or product name.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => {
                  const Icon = TYPE_ICONS[item.type] || Search;

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D7B66C] hover:shadow-lg"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="h-48 w-full bg-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[#FFF5DD] to-[#F4E3BB]">
                          <Icon size={42} className="text-[#A87922]" />
                        </div>
                      )}

                      <div className="p-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D9] px-3 py-1 text-[11px] font-bold text-[#91651C]">
                          <Icon size={13} />
                          {item.type}
                        </span>

                        <h3 className="mt-3 line-clamp-2 font-serif text-lg font-bold text-slate-900 transition group-hover:text-[#A87922]">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-[#A87922]">
                          View details
                          <ArrowUpRight
                            size={17}
                            className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {failedSources.length > 0 && !loading && (
              <p className="mt-6 text-xs leading-5 text-slate-500">
                Some categories could not be loaded:{" "}
                {failedSources.join(", ")}. Check the backend API and
                browser console.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}