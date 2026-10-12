import React, { useState, useEffect } from "react";
import { TrendingUp, Zap, Clock, ShieldCheck, X } from "lucide-react";

function AdBanner() {
  const [showFloatingAd, setShowFloatingAd] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFloatingAd(true);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 relative bg-gradient-to-br from-[#FFF9F2] via-[#FDF3E6] to-[#FBE8D4] border-y border-amber-200/60 shadow-inner overflow-hidden my-6">

      {/* Decorative background ambient glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">

        {/* Advertisement Label */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-amber-400/60"></span>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-800">
            ★ FEATURED ADVERTISEMENT ★
          </span>
          <span className="h-px w-12 bg-amber-400/60"></span>
        </div>

        {/* Main Advertisement Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 bg-white shadow-[0_20px_50px_rgba(217,119,6,0.12)]">

          {/* Top Yellow/Orange Gradient Strip */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"></div>

          <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:p-10">

            {/* LEFT CONTENT */}
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-800">
                  SEO MASTERCLASS 2026
                </span>
              </div>

              <h2 className="max-w-xl font-serif text-3xl font-bold leading-tight tracking-tight text-stone-950 sm:text-4xl">
                Advanced SEO & Brand Visibility
                <span className="block mt-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Strategies for Digital Growth
                </span>
              </h2>

              <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-stone-700 font-normal">
                Learn practical SEO strategies, improve your search visibility and understand how top brands perform better across modern search and AI platforms.
              </p>

              {/* Feature Cards with Professional Icons (Business Growth, Fast, Clock) */}
              <div className="mt-6 flex flex-wrap gap-3 items-center">

                {/* 1. Business Growth Icon */}
                <div className="flex items-center gap-3 bg-amber-50/90 border border-amber-200 px-4 py-2.5 rounded-2xl shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider">Strategy</span>
                    <span className="text-xs font-bold text-stone-900">Business Growth</span>
                  </div>
                </div>

                {/* 2. Fast Speed Icon */}
                <div className="flex items-center gap-3 bg-orange-50/90 border border-orange-200 px-4 py-2.5 rounded-2xl shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider">Execution</span>
                    <span className="text-xs font-bold text-stone-900">Fast Results</span>
                  </div>
                </div>

                {/* 3. Clock / Real-time Icon */}
                <div className="flex items-center gap-3 bg-amber-50/90 border border-amber-200 px-4 py-2.5 rounded-2xl shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wider">Access</span>
                    <span className="text-xs font-bold text-stone-900">24/7 Insights</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE PERMANENT LOCAL VIDEO */}
            <div className="w-full shrink-0 lg:w-[450px]">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-amber-300/80 bg-stone-900 shadow-[0_15px_35px_rgba(0,0,0,0.15)]">

                {/* Live Badge over video */}
                <div className="absolute top-3 left-3 z-20 bg-red-600/90 backdrop-blur text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1.5 shadow">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  <span>PERMANENT FEED</span>
                </div>

                <video
                  className="h-full w-full object-cover"
                  src="/digital.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  title="Digital Marketing Video"
                />
              </div>
            </div>

          </div>

          {/* Bottom Strip */}
          <div className="border-t border-amber-100 bg-amber-50/50 px-6 py-3.5 sm:px-8">
            <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
                ⚡ Market Insights & Digital Hub
              </span>
              <span className="text-[10px] font-semibold text-stone-500 tracking-widest uppercase">
                Sponsored Partner Content
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ================= FLOATING AD POPUP (Bottom-Right Corner) ================= */}
      {showFloatingAd && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-88 rounded-2xl bg-stone-950 p-[1px] shadow-[0_25px_60px_rgba(0,0,0,0.4)] animate-[bounce_1s_ease-in-out_1]">
          <div className="rounded-[15px] bg-stone-950 overflow-hidden border-2 border-amber-500">

            {/* Ad Header with AD Tag & Close Button */}
            <div className="flex items-center justify-between bg-stone-900 px-3.5 py-2.5 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase shadow">
                  AD
                </span>
                <span className="text-[11px] font-bold text-amber-400 tracking-wider">
                  SPONSORED PROMO
                </span>
              </div>
              <button
                onClick={() => setShowFloatingAd(false)}
                className="h-7 w-7 rounded-full bg-stone-800 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow"
                aria-label="Close Floating Ad"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video w-full bg-black">
              <video
                className="h-full w-full object-cover"
                src="/digital.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                <span>LIVE</span>
              </div>
            </div>

            {/* Footer Text without Button */}
            <div className="p-3.5 bg-stone-900 text-white border-t border-stone-800">
              <h4 className="text-xs font-bold font-serif text-white tracking-wide">Digital Marketing Masterclass</h4>
              <p className="text-[10px] text-stone-400 mt-0.5">Scale your brand with expert insights.</p>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default AdBanner;