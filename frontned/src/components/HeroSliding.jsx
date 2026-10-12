import React from "react";
import { companyLogos } from "../data/AllData"; // Path apne folder ke hisaab se adjust kar lein

export default function SlidingCompanies() {
  return (
    <section className="overflow-hidden bg-stone-50 py-12 border-y border-stone-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
        <h4 className="text-stone-500 uppercase tracking-widest mb-8 text-xs font-bold">
          Trusted By Industry Leaders & Global Brands
        </h4>
        
        {/* Infinite sliding container */}
        <div className="relative w-full overflow-hidden flex whitespace-nowrap py-3">
          <div className="flex animate-marquee gap-12 items-center justify-around w-full">
            {companyLogos.concat(companyLogos).map((company, index) => (
              <div
                key={`${company.id}-${index}`}
                className="flex flex-col items-center justify-center shrink-0 group cursor-pointer"
              >
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center p-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg overflow-hidden">
                  <img
                    src={company.img}
                    alt={company.name}
                    className="h-full w-full object-contain object-center"
                  />
                </div>
                <span className="mt-3 text-xs font-semibold text-stone-600 group-hover:text-amber-600 transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Animation Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}