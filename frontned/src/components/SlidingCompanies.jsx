import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchSlidingCompanies } from "../api/slidingCompanyApi";

const CACHE_KEY = "sliding_companies_cache";
let memoryCache = null;

const readCache = () => {
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    memoryCache = Array.isArray(parsed) ? parsed : [];
    return memoryCache;
  } catch {
    return [];
  }
};

const writeCache = (data) => {
  memoryCache = data;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
};


const optimizeImage = (url, width = 400) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/w_") || url.includes("/upload/q_")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
};

export default function SlidingCompanies() {
  const sliderRef = useRef(null);
  const [active, setActive] = useState(0);
  const [companies, setCompanies] = useState(() => readCache());

  useEffect(() => {
    fetchSlidingCompanies()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
      
        setCompanies((prev) =>
          JSON.stringify(prev) === JSON.stringify(list) ? prev : list
        );
        writeCache(list);
      })
      .catch((err) =>
        console.error("Error fetching sliding companies:", err)
      );
  }, []);

  const goToSlide = (index) => {
    const slider = sliderRef.current;
    const card = slider?.querySelector(".company-card");

    if (!slider || !card || companies.length === 0) return;

    const gap = 24;
    const cardWidth = card.getBoundingClientRect().width;

    slider.scrollTo({
      left: index * (cardWidth + gap),
      behavior: "smooth",
    });

    setActive(index);
  };


  const move = (direction) => {
    if (companies.length === 0) return;

    const maxIndex = Math.max(0, companies.length - 3);
    let nextIndex = active + direction;

    if (nextIndex > maxIndex) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = maxIndex;
    }

    goToSlide(nextIndex);
  };


  useEffect(() => {
    if (companies.length < 2) return;

    const timer = setInterval(() => {
      const slider = sliderRef.current;
      const card = slider?.querySelector(".company-card");

      if (!slider || !card) return;

      const gap = 24;
      const cardWidth = card.getBoundingClientRect().width;
      const maxIndex = Math.max(
        0,
        companies.length - Math.max(
          1,
          Math.floor(slider.clientWidth / (cardWidth + gap))
        )
      );

      setActive((current) => {
        const nextIndex = current >= maxIndex ? 0 : current + 1;

        slider.scrollTo({
          left: nextIndex * (cardWidth + gap),
          behavior: "smooth",
        });

        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [companies.length]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-rose-50/40 py-14 sm:py-16 lg:py-20">

  
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


        <div className="mb-9 flex flex-col gap-6 md:mb-11 md:flex-row md:items-end md:justify-between">

          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-900">
                Our Company Network
              </span>
            </div>
         
            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Explore Leading{" "}
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-rose-600 bg-clip-text text-transparent">
                Companies & Brands
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Discover leading companies, explore their products and services,
              and stay informed about the latest business and technology trends.
            </p>
          </div>
        </div>


        <div className="relative w-full overflow-hidden pt-3 pb-6">
          <div
            ref={sliderRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {companies.map((company, index) => (
              <Link
                to={`/sliding-company/${company.slug}`}
                key={company._id}
                className="company-card group flex w-[85%] flex-shrink-0 snap-start flex-col rounded-3xl border border-amber-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-[0_18px_40px_rgba(217,119,6,0.12)] sm:w-[46%] lg:w-[calc(33.333%-16px)]"
              >
      
                <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-rose-50/50 p-5">
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-100/60" />

                  {company.imageURL ? (
                    <img
                      src={optimizeImage(company.imageURL)}
                      alt={`${company.name} logo`}
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                      className="relative z-10 max-h-[90px] max-w-[78%] object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="relative z-10 text-3xl font-extrabold text-amber-700">
                      {company.name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>

            
                <div className="flex flex-1 flex-col">
                  <span className="mb-2 inline-flex w-fit items-center rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Company Profile
                  </span>

                  <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-amber-700 sm:text-xl">
                    {company.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {company.description ||
                      "Explore company information, products, services and latest updates."}
                  </p>

                
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 sm:text-xs">
                      {company.tagline || "Explore Company"}
                    </span>

                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 text-lg text-amber-700 transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white">
                      &#8594;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

       
        <div className="mt-2 flex items-center justify-center gap-4">          <p className="text-sm font-medium text-slate-500">
            <span className="font-bold text-amber-600">
              {String(active + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(companies.length).padStart(2, "0")}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous companies"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200 bg-white text-xl text-slate-700 shadow-sm transition duration-300 hover:border-amber-600 hover:bg-amber-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              &#8592;
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next companies"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-xl text-white shadow-md shadow-rose-600/20 transition duration-300 hover:from-amber-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              &#8594;
            </button>
          </div>
        </div>

    
        <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-slate-200/80 pt-6 text-center sm:flex-row sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            &#10003;
          </span>
          <p className="text-xs leading-5 text-slate-500 sm:text-sm">
            Explore company profiles, products, services and technology insights
            in one place.
          </p>
        </div>
      </div>
    </section>
  );
}