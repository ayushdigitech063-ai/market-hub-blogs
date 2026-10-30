
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { getTypeInfo } from "../data/biographyTypes";
import { SOCIAL_ICONS, getSocialLinks } from "../data/Biographysocials.js";
import { apiUrl } from "../api/apiConfig";


const words = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) =>
      word.length > 3 && word.endsWith("s")
        ? word.slice(0, -1)
        : word
    );

const hasAll = (haystack, needles) =>
  needles.length > 0 && needles.every((word) => haystack.includes(word));


const getSection = (item = {}) => {
  const text = [
    item.category,
    item.type,
    item.role,
    item.slug,
  ]
    .join(" ")
    .toLowerCase();

  if (/actor|actress|bollywood|hollywood|cinema|film/.test(text))
    return "actors";

  if (/entrepreneur|founder|startup/.test(text))
    return "entrepreneur";

  if (/sports?|sportsperson|cricket|cricketer|football|footballer|tennis|athlete|player|badminton|hockey/.test(text))
    return "sports";

  if (/ceo|business|chairman|executive|corporate|director|president/.test(text))
    return "business";

  return "";
};


const sectionFromRoute = (value) => {
  const routeWords = words(value);

  if (
    routeWords.some((word) =>
      /^(actor|actress|bollywood|hollywood|cinema|film)$/.test(word)
    )
  )
    return "actors";

  if (
    routeWords.some((word) =>
      /^(entrepreneur|founder|startup)$/.test(word)
    )
  )
    return "entrepreneur";

  if (
    routeWords.some((word) =>
      /^(sport|sportsperson|cricket|cricketer|football|footballer|tennis|athlete|player|badminton|hockey)$/.test(word)
    )
  )
    return "sports";

  if (
    routeWords.some((word) =>
      /^(business|ceo|chairman|executive|corporate|director|president)$/.test(word)
    )
  )
    return "business";

  return null;
};


const newestFirst = (a, b) => {
  const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
  const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();

  if (dateA && dateB && dateA !== dateB) {
    return dateB - dateA;
  }

  return String(b._id || b.id || "").localeCompare(
    String(a._id || a.id || "")
  );
};

const SHOW_KEYS = ["twitter", "instagram", "linkedin"];
const ICONS = SOCIAL_ICONS.filter(({ key }) => SHOW_KEYS.includes(key));

const cleanText = (value) =>
  String(value || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export default function ViewAll() {
  const { type } = useParams();
  const { label, title, description } = getTypeInfo(type);

  const titleWords = String(title || "Biographies")
    .trim()
    .split(/\s+/);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(false);
    setProfiles([]);

    fetch(apiUrl("/biographies"), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response");
        }

        const section = sectionFromRoute(type);
        const route = words(type);

        const filtered = data.filter((item) => {
          if (section) {
            return getSection(item) === section;
          }

          return (
            hasAll(words(item.type), route) ||
            hasAll(words(item.category), route) ||
            hasAll(words(item.role), route)
          );
        });

        setProfiles([...filtered].sort(newestFirst));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;

        console.error("Error fetching profiles collection:", err);
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [type]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center space-x-2 text-sm font-medium text-amber-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span>Loading profiles collection...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-stone-800">

      <section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpwXYrwfpLtqUfNrWOlTE14nPxsc0nued4uGrqhzwkRQ&s=10"
          alt="Biography collection background"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-[0.85]"
        />

        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111D32]/60 via-transparent to-[#111D32]/20" />

        <div className="mx-auto flex min-h-[360px] w-full max-w-[1600px] items-center px-5 py-10 sm:min-h-[400px] sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-14 lg:py-14 xl:min-h-[460px] xl:px-16">
          <div className="w-full max-w-3xl">
            <Link
              to="/biography"
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition hover:bg-white/20 sm:text-sm"
            >
              <span>←</span>
              <span>Back to Biography</span>
            </Link>

            <div className="mb-5 flex">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/95 backdrop-blur-md sm:text-xs">
                <Sparkles className="h-4 w-4 shrink-0 text-[#E47742]" />
                {label || "Biography Collection"}
              </div>
            </div>

            <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
              {titleWords.length > 1 && (
                <span className="block text-white">
                  {titleWords.slice(0, -1).join(" ")}
                </span>
              )}

              <span className="mt-2 block bg-gradient-to-r from-[#F5D98F] via-[#E8BD70] to-[#FFF0C2] bg-clip-text text-transparent first:mt-0">
                {titleWords[titleWords.length - 1]}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
              {description}
            </p>

            <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-md sm:mt-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E47742]/20 text-[#F5D98F]">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-bold text-white sm:text-base">
                  {profiles.length} Profiles
                </p>
                <p className="mt-0.5 text-xs text-white/75 sm:text-sm">
                  Verified biographies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

 
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-amber-500" />

            <div>
              <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
                Explore {title}
              </h2>

              <p className="mt-0.5 text-xs font-normal text-stone-500">
                {profiles.length} verified profiles available in this category
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-16 text-center">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Unable to load profiles
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Please refresh the page and try again.
            </p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-16 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-700">
              !
            </div>

            <h3 className="font-serif text-xl font-bold text-stone-900">
              No profiles found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs font-light leading-relaxed text-stone-600 sm:text-sm">
              No profiles are available for this category right now. Please
              check back later or explore other sections.
            </p>

            <Link
              to="/biography"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-amber-500 hover:text-stone-950 sm:text-sm"
            >
              ← Back to Biography
            </Link>
          </div>
        ) : (
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((item) => {
              const links = getSocialLinks(item);
              const activeIcons = ICONS.filter(({ key }) => links[key]);
              const about = cleanText(item.shortBio || item.description);

              const profileUrl = `/biography/${item.type || "actor"}/${item.slug}`;

              return (
                <div
                  key={item._id || item.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-xl"
                >
                  <Link to={profileUrl} className="flex flex-1 flex-col">
                    <div className="relative h-[260px] shrink-0 overflow-hidden bg-stone-100">
                      <img
                        src={item.image}
                        alt={item.name || "Biography"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/60 to-transparent" />

                      <span className="absolute left-4 top-4 rounded-full border border-stone-700 bg-stone-900/90 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 shadow-sm backdrop-blur-md">
                        {item.category || label}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5 pb-3">
                      <h3 className="line-clamp-2 min-h-[3.5rem] font-serif text-xl font-bold leading-7 text-stone-900 transition-colors group-hover:text-amber-600">
                        {item.name}
                      </h3>

                      {item.role && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                          {item.role}
                        </p>
                      )}

                      {item.company && (
                        <p className="mt-0.5 truncate text-xs font-medium text-stone-500">
                          {item.company}
                        </p>
                      )}

                      {about && (
                        <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-stone-600">
                          {about}
                        </p>
                      )}
                    </div>
                  </Link>

                  <div className="mt-auto px-5 pb-5">
                    {activeIcons.length > 0 && (
                      <div className="mb-3 flex items-center gap-2 border-t border-stone-100 pt-3">
                        {activeIcons.map(({ key, label: name, Icon }) => (
                          <a
                            key={key}
                            href={links[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={name}
                            aria-label={`${item.name} on ${name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-xs transition-all duration-200 hover:bg-amber-500 hover:text-stone-950"
                          >
                            <Icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    )}

                    <Link
                      to={profileUrl}
                      className="group/cta flex items-center justify-between border-t border-stone-100 pt-3"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        Read Full Biography
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-800 shadow-xs transition-all group-hover/cta:bg-amber-500 group-hover/cta:text-stone-950">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
