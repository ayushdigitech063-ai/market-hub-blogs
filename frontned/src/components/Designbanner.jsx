
import React, { useEffect, useState } from "react";
import { marketingTopics as topics } from "../data/AllData";

export default function MarketingCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!topics?.length || topics.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % topics.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  if (!topics?.length) return null;

  const currentTopic = topics[active];
  const previousTopic = topics[(active - 1 + topics.length) % topics.length];

  return (
    <section className="relative isolate my-6 overflow-hidden bg-[#100C24] text-white">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[120px]" />
        <div className="absolute right-1/3 top-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">

          {/* LEFT CONTENT */}
          <div className="relative z-10">

            <div className="inline-flex items-center gap-3 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 sm:text-xs">
                Digital Insights & Strategies
              </span>
            </div>

            <p className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-fuchsia-300">
              <span className="h-px w-8 bg-fuchsia-400" />

              FEATURED TOPIC

              <span className="text-violet-300/60">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(topics.length).padStart(2, "0")}
              </span>
            </p>

            <h2
              key={`title-${active}`}
              className="mt-5 animate-[fadeIn_600ms_ease_both] font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {currentTopic.title}
            </h2>

            <div className="mt-5 flex items-start gap-3">
              <span className="mt-2 h-1 w-10 shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400" />

              <p
                key={`subtitle-${active}`}
                className="animate-[fadeIn_600ms_ease_both] bg-gradient-to-r from-fuchsia-300 via-violet-300 to-blue-300 bg-clip-text text-lg font-bold leading-snug text-transparent sm:text-xl"
              >
                {currentTopic.subtitle}
              </p>
            </div>

            <p
              key={`description-${active}`}
              className="mt-6 max-w-xl animate-[fadeIn_600ms_ease_both] text-sm leading-7 text-slate-300 sm:text-base sm:leading-8"
            >
              {currentTopic.description}
            </p>

            {/* Slider Dots */}
            <div className="mt-9 flex flex-wrap items-center gap-2.5">
              {topics.map((topic, index) => (
                <button
                  key={topic.id ?? index}
                  type="button"
                  aria-label={`Show ${topic.title}`}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 ${
                    active === index
                      ? "w-10 bg-gradient-to-r from-fuchsia-400 to-violet-400 shadow-[0_0_16px_rgba(192,132,252,0.45)]"
                      : "w-2.5 bg-white/20 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Discover More</span>
              <span className="text-fuchsia-400">/</span>
              <span>
                {String(active + 1).padStart(2, "0")} of{" "}
                {String(topics.length).padStart(2, "0")}
              </span>
            </div>

            {/* Auto-playing indicator */}
            <div className="mt-7 flex items-center gap-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Exploring insights automatically
              </span>
            </div>
          </div>

          {/* RIGHT IMAGE SLIDER */}
          <div className="relative mx-auto h-[370px] w-full max-w-[470px] sm:h-[450px] lg:h-[480px]">

            {/* Decorative circles */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/15 sm:h-80 sm:w-80" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-400/10 sm:h-64 sm:w-64" />

            {/* Previous Image Preview */}
            {topics.length > 1 && (
              <div
                key={`previous-${active}`}
                className="absolute bottom-5 left-0 z-10 h-32 w-32 -rotate-6 animate-[fadeIn_600ms_ease_both] overflow-hidden rounded-2xl border border-white/15 bg-[#21163A] shadow-2xl sm:bottom-8 sm:h-40 sm:w-40"
              >
                <img
                  src={previousTopic.image}
                  alt={previousTopic.title}
                  loading="lazy"
                  className="h-full w-full object-contain p-3"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#100C24] to-transparent px-3 pb-3 pt-8">
                  <p className="truncate text-[10px] font-semibold text-white/90">
                    {previousTopic.title}
                  </p>
                </div>
              </div>
            )}

            {/* Main Image Card */}
            <div
              key={`main-${active}`}
              className="absolute right-0 top-0 z-20 h-[340px] w-[min(88%,350px)] animate-[fadeIn_650ms_ease_both] overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-[#24173D] via-[#17152F] to-[#11182E] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:h-[410px] sm:w-[360px]"
            >

              {/* Image Area */}
              <div className="relative h-[225px] overflow-hidden rounded-[20px] bg-[#17132B] sm:h-[285px]">

                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl"
                  style={{
                    backgroundImage: `url("${currentTopic.image}")`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-fuchsia-500/15" />

                <img
                  src={currentTopic.image}
                  alt={currentTopic.title}
                  className="relative z-10 h-full w-full animate-[imageReveal_800ms_ease_both] object-contain p-4"
                />

                {/* Topic Badge */}
                <div className="absolute left-3 top-3 z-20 max-w-[75%] truncate rounded-full border border-white/15 bg-[#100C24]/80 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-fuchsia-200 backdrop-blur-xl">
                  {currentTopic.tag}
                </div>

                {/* Number Badge */}
                <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#100C24]/80 text-[10px] font-bold text-white backdrop-blur-xl">
                  {String(active + 1).padStart(2, "0")}
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#17152F] to-transparent" />
              </div>

              {/* Card Information */}
              <div className="px-2 pb-2 pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-200/70">
                    Featured Insight
                  </span>
                </div>

                <h3 className="truncate font-serif text-lg font-bold text-white sm:text-xl">
                  {currentTopic.title}
                </h3>

                <p className="mt-1.5 truncate text-xs text-slate-300 sm:text-sm">
                  {currentTopic.subtitle}
                </p>
              </div>
            </div>

            {/* Decorative Accents */}
            <div className="pointer-events-none absolute bottom-0 right-7 h-16 w-16 rounded-full border border-fuchsia-400/20 sm:bottom-2 sm:right-3" />

            <div className="pointer-events-none absolute bottom-7 right-12 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_16px_rgba(192,132,252,0.7)]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes imageReveal {
          from {
            opacity: 0.4;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
