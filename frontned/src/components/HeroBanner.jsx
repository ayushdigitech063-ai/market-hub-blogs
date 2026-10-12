import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock3,
} from "lucide-react";
import { heroBannerData as bannerData } from "../data/AllData"; // Path apne folder ke mutabiq adjust kar lein

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
    <section className="bg-[#fffdf8] px-3 py-3 sm:px-5 sm:py-4 lg:px-8">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[22px] bg-[#101827] shadow-lg">

        {/* Background Image */}
        <img
          key={currentItem.id}
          src={currentItem.image}
          alt={currentItem.title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/95 via-[#101827]/80 to-[#101827]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/50 via-transparent to-black/10" />

        {/* Main Content */}
        <div
          key={`content-${currentItem.id}`}
          className="relative flex min-h-[340px] items-center px-5 py-8 sm:min-h-[355px] sm:px-9 sm:py-9 lg:min-h-[370px] lg:px-12 lg:py-10"
        >
          <div className="w-full max-w-[690px]">

            {/* Category */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 text-[11px] font-semibold text-amber-300 backdrop-blur-sm">
              <Sparkles size={13} />
              {currentItem.category}
            </div>

            {/* Heading */}
            <h1 className="max-w-[650px] text-[25px] font-bold leading-[1.2] tracking-tight text-white sm:text-[30px] lg:text-[36px]">
              {currentItem.title}
            </h1>

            {/* Description */}
            <p className="mt-3 max-w-[590px] text-[13px] leading-5 text-slate-200 sm:text-sm sm:leading-6">
              {currentItem.excerpt}
            </p>

            {/* Author Details */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-white/10 text-sm font-bold text-amber-300">
                  {currentItem.author.charAt(0)}
                </div>

                <div>
                  <p className="text-xs font-semibold text-white sm:text-sm">
                    {currentItem.author}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-300">
                    {currentItem.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Clock3 size={14} />
                {currentItem.readTime}
              </div>
            </div>

            {/* Biography Button */}
            <div className="mt-5">
              <Link
                to="/Biography"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#c5a264] px-5 py-2.5 text-sm font-semibold text-[#172033] transition duration-300 hover:-translate-y-0.5 hover:bg-[#dfbf82]"
              >
                Biography
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 sm:bottom-5 sm:right-6">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition hover:border-amber-300 hover:bg-[#c5a264] hover:text-[#101827] sm:h-10 sm:w-10"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition hover:border-amber-300 hover:bg-[#c5a264] hover:text-[#101827] sm:h-10 sm:w-10"
          >
            <ChevronRight size={19} />
          </button>
        </div>

      </div>
    </section>
  );
}