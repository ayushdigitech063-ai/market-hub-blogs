
import React from "react";
import { companyLogos } from "../data/AllData";

export default function SlidingCompanies() {
  return (
    <section className="relative my-4 overflow-hidden border-y border-[#E8D5D3] bg-gradient-to-br from-[#FFF9F5] via-[#F9EFED] to-[#F4E6E5] py-12 sm:py-16">


      <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#D9A5A7]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-24 h-80 w-80 rounded-full bg-[#B76E79]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


        <div className="mb-10 text-center sm:mb-12">

          <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[#E7C9C6] bg-white/80 px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#9F3548]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#873443] sm:text-xs">
              Discover Leading Companies
            </span>
          </div>

          <h4 className="font-serif text-2xl font-bold tracking-tight text-[#38202A] sm:text-3xl lg:text-4xl">
            Trusted by Industry{" "}
            <span className="text-[#9F3548]">Leaders</span>
          </h4>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#79656A] sm:text-base">
            Explore the companies and global brands shaping technology,
            business and innovation.
          </p>


          <div className="mx-auto mt-5 flex items-center justify-center gap-2">
            <span className="h-1 w-10 rounded-full bg-[#9F3548]" />
            <span className="h-1 w-3 rounded-full bg-[#C98C91]" />
            <span className="h-1 w-1 rounded-full bg-[#E3C5C3]" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[26px] border border-white/90 bg-[#FFFCFA]/80 px-3 py-7 shadow-[0_16px_45px_rgba(91,40,53,0.07)] sm:px-5 sm:py-9">

    
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FFFCFA] to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#FFFCFA] to-transparent sm:w-16" />

          <div className="animate-marquee flex w-max items-center gap-7 sm:gap-10 lg:gap-12">

            {companyLogos.concat(companyLogos).map((company, index) => (
              <div
                key={`${company.id}-${index}`}
                className="group flex w-[116px] shrink-0 cursor-pointer flex-col items-center sm:w-[140px]"
              >
          
                <div className="relative flex h-[94px] w-[94px] items-center justify-center rounded-[24px] border border-[#EDE0DC] bg-white p-4 shadow-[0_5px_20px_rgba(70,35,45,0.05)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#C98C91] group-hover:shadow-[0_12px_28px_rgba(159,53,72,0.13)] sm:h-[112px] sm:w-[112px] sm:rounded-[28px] sm:p-5">

                  <div className="absolute inset-1 rounded-[20px] border border-transparent transition-colors duration-300 group-hover:border-[#F0DEDC] sm:rounded-[24px]" />

                  <img
                    src={company.img}
                    alt={company.name}
                    loading="lazy"
                    className="relative z-10 h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                  />

                  <span className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-[#9F3548] transition-all duration-300 group-hover:w-8" />
                </div>

       
                <span className="mt-4 max-w-full truncate text-center text-xs font-semibold tracking-wide text-[#68535A] transition-colors duration-300 group-hover:text-[#9F3548] sm:text-sm">
                  {company.name}
                </span>
              </div>
            ))}

          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#967B80] sm:text-xs">
          <span className="h-px w-7 bg-[#D7B4B4]" />
          Innovation Across Industries
          <span className="h-px w-7 bg-[#D7B4B4]" />
        </div>

      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
          will-change: transform;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation-duration: 90s;
          }
        }
      `}</style>

    </section>
  );
}
