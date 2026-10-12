import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTypeInfo } from "../data/biographyTypes";
import { getSection, sectionFromRoute, words } from "../data/biographyFilters";
import { getSocialLinks } from "../data/Biographysocials.js";

const hasAll = (haystack, needles) =>
  needles.length > 0 && needles.every((n) => haystack.includes(n));

export default function ViewAll() {
  const { type } = useParams();
  const { label, title, description } = getTypeInfo(type);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all profiles and keep only those that belong to this route
  useEffect(() => {
    fetch("http://localhost:5000/api/biographies")
      .then((res) => res.json())
      .then((data) => {
        // Known routes (ceo / sportsperson / entrepreneur / actor ...) use the
        // same grouping as the main page and the admin Category dropdown.
        const section = sectionFromRoute(type);
        const route = words(type);

        const filtered = (Array.isArray(data) ? data : []).filter((item) => {
          if (section) return getSection(item) === section;

          // Any other route value: match whole words in type, category or role
          return (
            hasAll(words(item.type), route) ||
            hasAll(words(item.category), route) ||
            hasAll(words(item.role), route)
          );
        });

        setProfiles(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profiles collection:", err);
        setLoading(false);
      });
  }, [type]);

  const renderSocialIcon = (platform) => {
    const key = platform.toLowerCase();

    if (key.includes("twitter") || key.includes("x")) {
      return (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    } else if (key.includes("instagram")) {
      return (
        <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    } else if (key.includes("linked")) {
      return (
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
  };

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
      
      {/* ===== FULL BACKGROUND HERO SECTION WITH DUAL-TONE OVERLAY ===== */}
      <section className="relative overflow-hidden bg-stone-950 text-white border-b border-stone-200">
        {/* Background Image with Controlled Brightness & Fit */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpwXYrwfpLtqUfNrWOlTE14nPxsc0nued4uGrqhzwkRQ&s=10" 
            alt="Hero Background" 
            className="h-full w-full object-cover object-center brightness-75 contrast-110 filter"
          />
          {/* Rich Dual-Tone Gradient Overlay (Dark Amber / Black Mix) */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/50" />
        </div>

        {/* Ambient Glows */}
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {profiles.map((item) => (
              <div
                key={item._id || item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500 hover:shadow-xl"
              >
                <Link to={`/biography/${item.type || 'actor'}/${item.slug}`} className="flex-1 flex flex-col">
                  <div className="relative flex h-[320px] items-center justify-center overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-stone-950/60 to-transparent pointer-events-none" />
                    <span className="absolute left-4 top-4 rounded-full bg-stone-900/90 border border-stone-700 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 shadow-sm backdrop-blur-md">
                      {item.category || label}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 pb-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                    {item.role && (
                      <p className="mt-1.5 text-xs sm:text-sm font-bold text-amber-700 uppercase tracking-wider">
                        {item.role}
                      </p>
                    )}
                    {item.company && (
                      <p className="mt-0.5 text-xs sm:text-sm font-medium text-stone-500">
                        {item.company}
                      </p>
                    )}
                    {item.shortBio || item.description ? (
                      <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-stone-600 font-light">
                        {item.shortBio || item.description}
                      </p>
                    ) : null}
                  </div>
                </Link>

                <div className="px-5 sm:px-6 pb-6 pt-2 mt-auto">
                  <div className="flex items-center gap-2 mb-4 pt-3 border-t border-stone-100">
                    {["twitter", "instagram", "linkedin", "website"].map((platform) => {
                      const url = getSocialLinks(item)[platform];
                      if (url) {
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-stone-950 transition-all duration-200 shadow-xs"
                            title={platform}
                          >
                            {renderSocialIcon(platform)}
                          </a>
                        );
                      }
                      // Website is shown only when a link exists
                      if (platform === "website") return null;
                      return (
                        <span
                          key={platform}
                          title={`${platform} link not added yet`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-300"
                        >
                          {renderSocialIcon(platform)}
                        </span>
                      );
                    })}
                  </div>

                  <Link
                    to={`/biography/${item.type || 'actor'}/${item.slug}`}
                    className="flex items-center justify-between border-t border-stone-100 pt-3 group/cta"
                  >
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800">
                      Read Full Biography
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-800 group-hover/cta:bg-amber-500 group-hover/cta:text-stone-950 transition-all shadow-xs">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}