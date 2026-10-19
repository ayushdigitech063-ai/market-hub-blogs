import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { viewAllPath } from "../data/biographyTypes";
import ProfileCard from "./Profilecard";
import { getSection, words } from "../data/biographyFilters";

const MAX_RELATED = 9;


const key = (v) => words(v).join("");


const ROLE_STOP = new Set(["of", "and", "the", "for", "in", "co", "former", "international", "professional"]);


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
    <section className="relative overflow-hidden border-t border-amber-100 bg-gradient-to-b from-amber-50/70 via-amber-50/40 to-yellow-50/60 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                Related profiles
              </h2>
            
            </div>
          </div>

         
        </div>


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
   
{/* Navigation Arrows - Below Cards */}
<div className="mt-5 flex items-center justify-center gap-3">
  <ArrowButton
    dir="prev"
    onClick={() => scrollByDir("prev")}
    disabled={!canPrev}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
  />

  <ArrowButton
    dir="next"
    onClick={() => scrollByDir("next")}
    disabled={!canNext}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition-all duration-300 hover:border-[#E9B96D] hover:from-[#FFE8C2] hover:to-[#F7D58A] hover:text-[#8F4D25] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
  />
</div>

    </section>
    
  );
}