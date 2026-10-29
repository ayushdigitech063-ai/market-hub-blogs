import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiUrl } from "../api/apiConfig";
import ProfileCard from "./Profilecard";

const API_URL = apiUrl("/biographies");
const MAX_RELATED = 9;

const getCategory = (item = {}) => {
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

  if (/sport|cricket|cricketer|football|tennis|athlete|player|badminton|hockey/.test(text))
    return "sports";

  if (/ceo|business|chairman|executive|corporate|director|president/.test(text))
    return "business";

  return "";
};

export default function RelatedProfiles({ profile }) {
  const [related, setRelated] = useState([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!profile) {
      setRelated([]);
      return;
    }

    const controller = new AbortController();

    async function loadRelated() {
      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load biographies");

        const data = await response.json();
        const category = getCategory(profile);

        const results = (Array.isArray(data) ? data : [])
          .filter(
            (item) =>
              item.slug !== profile.slug &&
              category &&
              getCategory(item) === category
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.updatedAt || 0) -
              new Date(a.createdAt || a.updatedAt || 0)
          )
          .slice(0, MAX_RELATED);

        if (!controller.signal.aborted) setRelated(results);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Related profiles error:", error);
          setRelated([]);
        }
      }
    }

    loadRelated();

    return () => controller.abort();
  }, [profile]);

  function updateArrows() {
    const element = trackRef.current;
    if (!element) return;

    setCanPrev(element.scrollLeft > 4);
    setCanNext(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4
    );
  }

  function scroll(direction) {
    const element = trackRef.current;
    if (!element) return;

    element.scrollBy({
      left: (direction === "next" ? 1 : -1) * element.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);

    return () => window.removeEventListener("resize", updateArrows);
  }, [related]);

  if (!related.length) return null;

  return (
    <section className="relative overflow-hidden border-t border-amber-100 bg-gradient-to-b from-amber-50/70 via-amber-50/40 to-yellow-50/60 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Related Biographies
          </h2>
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
              className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] [&>article]:h-full"
            >
              <ProfileCard item={item} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => scroll("prev")}
            disabled={!canPrev}
            aria-label="Previous biographies"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!canNext}
            aria-label="Next biographies"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F0D6A0] bg-gradient-to-br from-[#FFF9E9] to-[#FFE8C2] text-[#B96A32] shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}