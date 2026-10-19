import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTypeInfo } from "../data/biographyTypes";
import { getSection, sectionFromRoute, words } from "../data/biographyFilters";
import { SOCIAL_ICONS, getSocialLinks } from "../data/Biographysocials.js";

const hasAll = (haystack, needles) =>
  needles.length > 0 && needles.every((n) => haystack.includes(n));

// Naya add hua profile sabse pehle (Mongo _id time ke hisaab se badhta hai)
const newestFirst = (a, b) => String(b._id || "").localeCompare(String(a._id || ""));

const SHOW_KEYS = ["twitter", "instagram", "linkedin"];
const ICONS = SOCIAL_ICONS.filter(({ key }) => SHOW_KEYS.includes(key));


const cleanText = (v) =>
  String(v || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export default function ViewAll() {
  const { type } = useParams();
  const { label, title, description } = getTypeInfo(type);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch("https://market-hub-blogs-backend.onrender.com/api/biographies")
      .then((res) => res.json())
      .then((data) => {
        const section = sectionFromRoute(type);
        const route = words(type);

        const filtered = (Array.isArray(data) ? data : []).filter((item) => {
          if (section) return getSection(item) === section;

          return (
            hasAll(words(item.type), route) ||
            hasAll(words(item.category), route) ||
            hasAll(words(item.role), route)
          );
        });

        setProfiles([...filtered].sort(newestFirst));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profiles collection:", err);
        setLoading(false);
      });
  }, [type]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center space-x-2 text-amber-600 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading profiles collection...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-stone-800">
    
      <section className="relative overflow-hidden bg-stone-950 text-white border-b border-stone-200">
        <div className="absolute inset-0 z-0">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpwXYrwfpLtqUfNrWOlTE14nPxsc0nued4uGrqhzwkRQ&s=10"
            alt="Hero Background"
            className="h-full w-full object-cover object-center brightness-75 contrast-110 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/50" />
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl z-0" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Link
            to="/biography"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-300 transition hover:text-amber-400 mb-8 backdrop-blur-sm bg-stone-900/40 px-3 py-1.5 rounded-full border border-stone-700/50 w-fit"
          >
            <span>←</span>
            <span>Back to Biography</span>
          </Link>

          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full bg-amber-500 text-stone-950 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow">
              {label || "Biography Collection"}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              {title}
            </h1>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-normal max-w-2xl drop-shadow">
              {description}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 z-10" />
      </section>

      {/* ===== PROFILES GRID SECTION ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1.5 rounded-full bg-amber-500" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Explore {title}
              </h2>
              <p className="text-xs text-stone-500 font-normal mt-0.5">
                {profiles.length} verified profiles available in this category
              </p>
            </div>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-16 text-center shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700 font-bold mb-4">
              !
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              No profiles found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              No profiles are available for this category right now. Please check back later or explore other sections.
            </p>
            <Link
              to="/biography"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow"
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
                        alt={item.name}
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