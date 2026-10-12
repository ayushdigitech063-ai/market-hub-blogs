import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchSlidingCompanies } from "../api/slidingCompanyApi";

export default function SlidingCompanies() {
  const sliderRef = useRef(null);
  const [active, setActive] = useState(0);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchSlidingCompanies()
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
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

  // Previous / Next
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

  // Automatic slider
  useEffect(() => {
    if (companies.length < 2) return;

    const timer = setInterval(() => {
      setActive((current) => {
        const maxIndex = Math.max(0, companies.length - 3);
        const nextIndex = current >= maxIndex ? 0 : current + 1;
        
        const slider = sliderRef.current;
        const card = slider?.querySelector(".company-card");

        if (slider && card) {
          slider.scrollTo({
            left: nextIndex * (card.getBoundingClientRect().width + 24),
            behavior: "smooth",
          });
        }

        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [companies.length]);

  if (companies.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-sky-50 via-white to-blue-50 py-14 sm:py-16 lg:py-20">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mb-9 flex flex-col gap-6 md:mb-11 md:flex-row md:items-end md:justify-between">

          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-800">
                Our Company Network
              </span>
            </div>
       
            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Explore Leading{" "}
              <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-500 bg-clip-text text-transparent">
                Companies & Brands
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Discover leading companies, explore their products and services,
              and stay informed about the latest business and technology trends.
            </p>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center justify-between gap-4 md:justify-end">
            <p className="text-sm font-medium text-slate-500">
              <span className="font-bold text-blue-700">
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition duration-300 hover:border-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                &#8592;
              </button>

              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next companies"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-xl text-white shadow-md shadow-blue-700/20 transition duration-300 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>

        {/* Company Cards Slider Wrapper with hidden scrollbar */}
        <div className="relative w-full overflow-hidden pt-3 pb-6">
          <div
            ref={sliderRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {companies.map((company) => (
              <Link
                to={`/sliding-company/${company.slug}`}
                key={company._id}
                className="company-card group flex w-[85%] flex-shrink-0 snap-start flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)] sm:w-[46%] lg:w-[calc(33.333%-16px)]"
              >
                {/* Company Logo */}
                <div className="relative mb-5 flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5">
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-sky-100/60" />

                  {company.imageURL ? (
                    <img
                      src={company.imageURL}
                      alt={`${company.name} logo`}
                      loading="lazy"
                      className="relative z-10 max-h-[90px] max-w-[78%] object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="relative z-10 text-3xl font-extrabold text-blue-700">
                      {company.name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>

                {/* Company Details */}
                <div className="flex flex-1 flex-col">
                  <span className="mb-2 inline-flex w-fit items-center rounded-md bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Company Profile
                  </span>

                  <h3 className="text-lg font-bold leading-snug text-slate-900 transition-colors duration-300 group-hover:text-blue-700 sm:text-xl">
                    {company.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600">
                    {company.description ||
                      "Explore company information, products, services and latest updates."}
                  </p>

                  {/* Card Footer */}
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 sm:text-xs">
                      {company.tagline || "Explore Company"}
                    </span>

                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-700 transition-all duration-300 group-hover:bg-blue-700 group-hover:text-white">
                      &#8594;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-slate-200/80 pt-6 text-center sm:flex-row sm:gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700">
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