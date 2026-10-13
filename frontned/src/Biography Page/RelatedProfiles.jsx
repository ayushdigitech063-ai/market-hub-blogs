import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { viewAllPath } from "../data/biographyTypes";
import ProfileCard from "./Profilecard";
import { getSection, words } from "../data/biographyFilters";

const MAX_RELATED = 9;

// Comparable key: "Technology Entrepreneurs" and "technology-entrepreneur" match
const key = (v) => words(v).join("");

// Role words that say nothing about the person's field
const ROLE_STOP = new Set(["of", "and", "the", "for", "in", "co", "former", "international", "professional"]);

// Only profiles from the same group (Business / Sports / Entrepreneur / Actors)
// are related. Within the group, a shared company or role ranks higher.
const score = (item, profile, section) => {
  if (section && getSection(item) !== section) return 0;

  let s = section ? 1 : 0;

  const company = key(item.company);
  if (company && company === key(profile.company)) s += 2;

  const role = key(item.role);
  if (role && role === key(profile.role)) {
    s += 2;
  } else {
    const profileRole = words(profile.role);
    if (words(item.role).some((w) => !ROLE_STOP.has(w) && profileRole.includes(w))) s += 1;
  }
  return s;
};

function ArrowButton({ dir, onClick, disabled }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous profiles" : "Next profiles"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 shadow-sm transition-all duration-300 hover:border-amber-500 hover:bg-amber-500 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300 disabled:hover:bg-white disabled:hover:text-stone-700"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function RelatedProfiles({ profile }) {
  const [related, setRelated] = useState([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!profile) return;

    fetch("https://market-hub-blogs-backend.onrender.com/api/biographies")
      .then((res) => res.json())
      .then((data) => {
        // Never show the current person, even if the same name was added twice
        const section = getSection(profile);
        const seen = new Set([key(profile.name)]);

        const list = (Array.isArray(data) ? data : [])
          .map((item) => ({ item, s: score(item, profile, section) }))
          .filter((x) => x.s > 0)
          .sort(
            (a, b) =>
              b.s - a.s || String(a.item.name).localeCompare(String(b.item.name))
          )
          .filter(({ item }) => {
            const k = key(item.name) || item.slug;
            if (item.slug === profile.slug || seen.has(k)) return false;
            seen.add(k);
            return true;
          })
          .slice(0, MAX_RELATED)
          .map((x) => x.item);

        setRelated(list);
      })
      .catch((err) => console.error("Error fetching related profiles:", err));
  }, [profile]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [related, updateArrows]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: (dir === "next" ? 1 : -1) * el.clientWidth * 0.9, behavior: "smooth" });
  };

  if (related.length === 0) return null;

  return (
    <section className="border-t border-stone-200/80 bg-gradient-to-b from-stone-50 to-amber-50/40 py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Related profiles
              </h2>
              <p className="mt-0.5 text-xs font-normal text-stone-500 sm:text-sm">
                More leaders similar to {profile.name}
                {profile.category ? ` in ${profile.category}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={viewAllPath(profile.type || profile.category)}
              className="hidden text-xs font-bold uppercase tracking-wider text-amber-700 transition hover:text-amber-500 sm:inline"
            >
              View all →
            </Link>
            <div className="flex items-center gap-2">
              <ArrowButton dir="prev" onClick={() => scrollByDir("prev")} disabled={!canPrev} />
              <ArrowButton dir="next" onClick={() => scrollByDir("next")} disabled={!canNext} />
            </div>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="-mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {related.map((item) => (
            <div
              key={item._id || item.slug}
              className="flex w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <div className="flex w-full">
                <div className="w-full [&>article]:h-full">
                  <ProfileCard item={item} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}