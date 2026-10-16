
import React, { useEffect, useState } from "react";
import { marketingTopics as topics } from "../data/AllData";

export default function MarketingCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!topics?.length) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % topics.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  if (!topics?.length) return null;

  const prevIndex = (active - 1 + topics.length) % topics.length;
  const currentTopic = topics[active];
  const prevTopic = topics[prevIndex];

  return (
    <section className="relative my-4 overflow-hidden border-y border-[#203A5B] bg-[#071426] px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(37,99,235,0.18),transparent_40%),radial-gradient(ellipse_at_90%_85%,rgba(6,182,212,0.12),transparent_38%)]" />

      <div className="pointer-events-none absolute right-[10%] top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">

  
          <div className="relative z-10">

            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 sm:text-xs">
                Digital Insights & Strategies
              </span>
            </div>

            <p className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              <span className="h-px w-8 bg-blue-400" />
              {String(active + 1).padStart(2, "0")} /{" "}
              {currentTopic.tag}
            </p>

          <h2
  key={`title-${active}`}
  className="mt-4 animate-[fadeIn_450ms_ease_both] font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-4xl"
>
  {currentTopic.title}
</h2>

            <div className="mt-5 flex items-center gap-3">
              <span className="h-1 w-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-300" />
<p
  key={`subtitle-${active}`}
  className="animate-[fadeIn_450ms_ease_both] bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl lg:text-xl"
>
  {currentTopic.subtitle}
</p>
            </div>

         <p
  key={`desc-${active}`}
  className="mt-5 max-w-xl animate-[fadeIn_500ms_ease_both] text-sm leading-6 text-slate-300 sm:text-base sm:leading-7"
>
  {currentTopic.description}
</p>

  
            <div className="mt-9 flex items-center gap-2.5">
              {topics.map((topic, index) => (
                <button
                  key={topic.id ?? index}
                  type="button"
                  aria-label={`Show ${topic.title}`}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    active === index
                      ? "w-11 bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                      : "w-2.5 bg-slate-600 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Auto Explore</span>
              <span className="text-cyan-400">/</span>
              <span>
                {String(active + 1).padStart(2, "0")} of{" "}
                {String(topics.length).padStart(2, "0")}
              </span>
            </div>
          </div>


          <div className="relative mx-auto flex h-[360px] w-full max-w-[460px] items-center justify-center sm:h-[430px] lg:h-[470px]">


            <button
              type="button"
              onClick={() => setActive(prevIndex)}
              aria-label={`View previous topic: ${prevTopic.title}`}
              className="group absolute bottom-5 left-0 z-10 h-32 w-40 -rotate-[9deg] overflow-hidden rounded-2xl border border-white/15 bg-[#12233B] shadow-xl transition-all duration-500 hover:-rotate-3 hover:scale-105 sm:h-40 sm:w-48"
            >
              <img
                src={prevTopic.image}
                alt={prevTopic.title}
                className="h-full w-full object-contain p-2"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#06101F] to-transparent px-2 pb-2 pt-7 text-left">
                <span className="block truncate text-[10px] font-semibold text-white/90">
                  {prevTopic.title}
                </span>
              </div>
            </button>

       
            <div
              key={`card-${active}`}
              className="absolute right-0 top-0 z-20 h-[330px] w-[min(100%,340px)] overflow-hidden rounded-[26px] border border-white/15 bg-[#101F35] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.45)] animate-[fadeIn_450ms_ease_both] sm:h-[390px] sm:w-[365px]"
            >

              <div className="relative h-[220px] overflow-hidden rounded-[17px] bg-[#0A1729] sm:h-[270px]">

                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl"
                  style={{
                    backgroundImage: `url("${currentTopic.image}")`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />

                <img
                  src={currentTopic.image}
                  alt={currentTopic.title}
                  className="relative z-10 h-full w-full object-contain p-3"
                />

             
                <div className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-[#071426]/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                  {currentTopic.tag}
                </div>

        
                <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-bold text-white backdrop-blur-md">
                  {String(active + 1).padStart(2, "0")}
                </div>

            
                <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#101F35]/80 to-transparent" />
              </div>


              <div className="px-2 pb-2 pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1 w-9 rounded-full bg-gradient-to-r from-orange-500 to-amber-300" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
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


            <div className="absolute bottom-0 right-2 h-16 w-16 rounded-full border border-cyan-400/20 sm:bottom-2 sm:right-0" />
            <div className="absolute bottom-5 right-7 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.5)]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
