
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Building2,
  BookOpen,
  UserRound,
  Package,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";

const API = "https://market-hub-blogs-backend.onrender.com/api";

const SOURCES = [
  {
    type: "Article",
    endpoint: `${API}/blog-articles`,
    icon: BookOpen,
    getTitle: (x) => x.title || x.articleTitle || x.name,
    getDescription: (x) =>
      x.description || x.excerpt || x.summary || x.content,
    getImage: (x) => x.imageURL || x.imageUrl || x.image,
    getUrl: (x) =>
      `/articles/${x.slug || x._id || x.id}`,
  },
  {
    type: "Company",
    endpoint: `${API}/companies`,
    icon: Building2,
    getTitle: (x) => x.name || x.title,
    getDescription: (x) => x.description,
    getImage: (x) => x.imageURL || x.imageUrl || x.image,
    getUrl: (x) => `/company/${x.slug}`,
  },
  {
    type: "Author",
    endpoint: `${API}/blog-authors`,
    icon: UserRound,
    getTitle: (x) => x.name || x.authorName || x.title,
    getDescription: (x) =>
      x.bio || x.biography || x.description || x.about,
    getImage: (x) => x.imageURL || x.imageUrl || x.image,
    getUrl: (x) => `/author/${x.id || x._id}`,
  },
  {
    type: "Biography",
    endpoint: `${API}/biographies`,
    icon: UserRound,
    getTitle: (x) => x.name || x.title,
    getDescription: (x) =>
      x.description || x.shortBio || x.role || x.company,
    getImage: (x) => x.imageURL || x.imageUrl || x.image,
    getUrl: (x) =>
      `/biography/${getBioType(x)}/${x.slug}`,
  },
  {
    type: "Brand / Product",
    endpoint: `${API}/brands/featured`,
    icon: Package,
    getTitle: (x) =>
      x.name || x.articleTitle || x.title || x.brand,
    getDescription: (x) =>
      x.description || x.shortDescription || x.category,
    getImage: (x) => x.imageURL || x.imageUrl || x.image,
    getUrl: (x) => `/brand/${x.slug}`,
  },
];

function getBioType(item) {
  const raw = String(item.type || item.category || "ceo")
    .toLowerCase()
    .replace(/\s+/g, "");

  if (raw.includes("sport")) return "sports";
  if (raw.includes("entrepreneur")) return "entrepreneur";
  return "ceo";
}

function asArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function searchableText(item) {
  return [
    item.title,
    item.description,
    item.author,
    item.authorName,
    item.category,
    item.subCategory,
    item.brand,
    item.company,
    item.name,
    item.role,
    item.shortBio,
    ...(Array.isArray(item.tags) ? item.tags : []),
    ...(Array.isArray(item.keywords) ? item.keywords : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");
  const [failedSources, setFailedSources] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const responses = await Promise.all(
        SOURCES.map(async (source) => {
          try {
            const response = await fetch(source.endpoint);
            if (!response.ok) throw new Error("Request failed");

            const data = await response.json();

            return {
              source,
              items: asArray(data),
              failed: false,
            };
          } catch (error) {
            console.error(
              `Search source failed: ${source.type}`,
              error
            );

            return {
              source,
              items: [],
              failed: true,
            };
          }
        })
      );

      if (cancelled) return;

      const results = [];
      const failed = [];

      responses.forEach(({ source, items, failed: hasFailed }) => {
        if (hasFailed) failed.push(source.type);

        items.forEach((item, index) => {
          const title = source.getTitle(item);
          const url = source.getUrl(item);

          if (!title || !url || url.endsWith("/undefined")) return;

          results.push({
            id: `${source.type}-${item._id || item.id || item.slug || index}`,
            type: source.type,
            title,
            description: source.getDescription(item) || "",
            image: source.getImage(item) || "",
            url,
            searchText: searchableText({
              ...item,
              title,
              description: source.getDescription(item),
            }),
            Icon: source.icon,
          });
        });
      });

      setAllResults(results);
      setFailedSources(failed);
      setLoading(false);
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!query) return [];

    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return allResults
      .map((item) => {
        const title = item.title.toLowerCase();
        const text = item.searchText;

        const score = words.reduce((total, word) => {
          if (title === word) return total + 10;
          if (title.startsWith(word)) return total + 6;
          if (title.includes(word)) return total + 4;
          if (text.includes(word)) return total + 1;
          return total;
        }, 0);

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .filter(
        (item) => activeType === "All" || item.type === activeType
      )
      .sort((a, b) => b.score - a.score);
  }, [allResults, query, activeType]);

  const types = [
    "All",
    "Article",
    "Company",
    "Brand / Product",
    "Author",
    "Biography",
  ];

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
                  const Icon = item.Icon;

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

