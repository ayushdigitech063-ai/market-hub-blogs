import React, { useEffect, useState } from "react";
import { marketingTopics as topics } from "../data/AllData"; // Path apne folder ke mutabiq adjust kar lein (jaise ../../../data/AllData)

export default function MarketingCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % topics.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prevIndex = (active - 1 + topics.length) % topics.length;
  const currentTopic = topics[active];
  const prevTopic = topics[prevIndex];

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFF9F2] via-[#FDF3E6] to-[#FBE8D4] border-y border-amber-200/50 shadow-inner overflow-hidden my-4">
      
      {/* Decorative subtle background elements */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* LEFT CONTENT */}
          <div className="relative z-10 transition-all duration-300">
            <span className="inline-flex rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-800 shadow-sm">
              DIGITAL INSIGHTS & STRATEGIES
            </span>

            <p className="mt-5 text-xs font-bold tracking-widest text-stone-500">
              {currentTopic.tag}
            </p>

            <h2
              key={`title-${active}`}
              className="mt-2 animate-[fadeIn_300ms_ease_both] text-3xl font-serif font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl lg:text-5xl"
            >
              {currentTopic.title}
              <span
                className={`mt-2 block bg-gradient-to-r ${currentTopic.color} bg-clip-text text-2xl text-transparent sm:text-3xl font-sans`}
              >
                {currentTopic.subtitle}
              </span>
            </h2>

            <p
              key={`desc-${active}`}
              className="mt-3 max-w-xl animate-[fadeIn_400ms_ease_both] text-sm sm:text-base leading-relaxed text-stone-700 font-normal"
            >
              {currentTopic.description}
            </p>

            {/* Interactive Progress Indicators */}
            <div className="mt-6 flex items-center gap-2">
              {topics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  aria-label={`Show ${topic.title}`}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    active === index
                      ? "w-8 bg-amber-600 shadow-md"
                      : "w-3 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              ))}
            </div>

            <p className="mt-2.5 text-[11px] font-semibold text-stone-500 tracking-wider">
              FAST AUTO-SLIDE · 0{active + 1} / 05
            </p>
          </div>

          {/* RIGHT SIDE LAYOUT (Cards preview setup) */}
          <div className="relative mx-auto h-[320px] w-full max-w-[460px] sm:h-[380px] lg:h-[420px] flex items-center justify-center">
            
            {/* BACKGROUND PREVIEW CARD 1 */}
            <div 
              onClick={() => setActive(prevIndex)}
              className="absolute left-0 bottom-4 w-36 sm:w-44 h-28 sm:h-36 rounded-xl overflow-hidden shadow-xl border-2 border-white/80 bg-stone-900 cursor-pointer transform -rotate-6 hover:rotate-0 transition-all duration-500 z-10 opacity-90 group"
            >
              <img
                src={prevTopic.image}
                alt={prevTopic.title}
                className="w-full h-full object-contain p-2 bg-stone-950"
              />
              <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-transparent transition-colors flex items-end p-2">
                <span className="text-[10px] text-white font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm truncate shadow">
                  Prev: {prevTopic.title}
                </span>
              </div>
            </div>

            {/* MAIN CARD 2 */}
            <div className="absolute right-0 top-0 w-72 sm:w-84 h-72 sm:h-88 rounded-2xl overflow-hidden shadow-2xl border border-stone-300/60 bg-stone-950 z-20 flex flex-col justify-between transition-all duration-500 animate-[fadeIn_400ms_ease_both]" key={`card-${active}`}>
              
              <div className="relative w-full h-full flex items-center justify-center bg-stone-900 p-3 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xl"
                  style={{ backgroundImage: `url(${currentTopic.image})` }}
                />

                <img
                  src={currentTopic.image}
                  alt={currentTopic.title}
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-lg"
                />

                <div className="absolute left-3 top-3 z-30 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[10px] font-bold tracking-wider text-white backdrop-blur-md shadow">
                  {currentTopic.tag}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-30 p-4 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent text-white">
                <span className={`mb-1.5 inline-block h-1 w-10 rounded-full bg-gradient-to-r ${currentTopic.color}`} />
                <h3 className="text-lg font-bold leading-snug font-serif truncate">
                  {currentTopic.title}
                </h3>
                <p className="text-[11px] text-stone-300 truncate opacity-90">
                  {currentTopic.subtitle}
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </section>
  );
}