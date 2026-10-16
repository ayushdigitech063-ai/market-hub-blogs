
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock3,
  BookOpen,
} from "lucide-react";
import { heroBannerData as bannerData } from "../data/AllData";

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!bannerData?.length) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  if (!bannerData?.length) return null;

  const currentItem = bannerData[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + bannerData.length) % bannerData.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerData.length);
  };

  return (
    <section className="bg-[#fffaf3] px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
      <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-2xl border border-[#e9dfce] bg-[#101827] shadow-[0_14px_40px_rgba(15,23,42,0.14)] sm:rounded-[26px]">

        <img
          key={currentItem.id}
          src={currentItem.image}
          alt={currentItem.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

  
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/95 via-[#101827]/80 to-[#101827]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080e19]/65 via-transparent to-[#080e19]/10" />


        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

        <div
          key={`content-${currentItem.id}`}
          className="relative flex min-h-[350px] items-center px-5 py-8 sm:min-h-[370px] sm:px-9 sm:py-9 lg:min-h-[390px] lg:px-14 lg:py-10"
        >
          <div className="w-full max-w-[740px] pb-10 sm:pb-8">

       
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-[#c5a264]/15 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-amber-300 backdrop-blur-md sm:text-[11px]">
              <Sparkles size={14} />
              <span>{currentItem.category}</span>
            </div>


            <h1 className="max-w-[700px] text-[27px] font-extrabold leading-[1.16] tracking-[-0.035em] text-white sm:text-[36px] lg:text-[46px]">
              {currentItem.title}
            </h1>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-[3px] w-10 rounded-full bg-[#d8b574]" />
              <span className="h-[3px] w-3 rounded-full bg-[#d8b574]/45" />
            </div>


            <p className="mt-4 max-w-[580px] text-[13px] leading-6 text-slate-200 sm:text-[14px] sm:leading-7">
              {currentItem.excerpt}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-7">

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8b574]/60 bg-white/10 text-sm font-bold text-[#e8c981] shadow-inner backdrop-blur-sm">
                  {currentItem.author?.charAt(0) || "A"}
                </div>

                <div>
                  <p className="text-[13px] font-bold text-white sm:text-sm">
                    {currentItem.author}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    {currentItem.date}
                  </p>
                </div>
              </div>


              <span className="hidden h-9 w-px bg-white/20 sm:block" />


              <div className="flex items-center gap-2 text-xs font-medium text-[#e8c981]">
                <Clock3 size={16} />
                <span>{currentItem.readTime}</span>
              </div>
            </div>


            <div className="mt-5">
              <Link
                to="/Biography"
                className="group inline-flex items-center gap-3 rounded-lg bg-[#d0ad6c] px-5 py-3 text-[13px] font-bold text-[#111827] shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#e5c78e] hover:shadow-xl"
              >
                <BookOpen size={17} />
                Explore Biography
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-3 sm:bottom-6 sm:right-7">
          <span className="hidden text-[11px] font-semibold tracking-wider text-white/70 sm:block">
            {String(currentIndex + 1).padStart(2, "0")} /{" "}
            {String(bannerData.length).padStart(2, "0")}
          </span>


          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#101827]/60 text-white backdrop-blur-md transition hover:border-[#d8b574] hover:bg-[#d0ad6c] hover:text-[#101827] sm:h-11 sm:w-11"
          >
            <ChevronLeft size={21} />
          </button>


          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#101827]/60 text-white backdrop-blur-md transition hover:border-[#d8b574] hover:bg-[#d0ad6c] hover:text-[#101827] sm:h-11 sm:w-11"
          >
            <ChevronRight size={21} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#b88a43] via-[#f0d59b] to-[#b88a43]" />
      </div>
    </section>
  );
}
