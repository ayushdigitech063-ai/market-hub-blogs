
import React from "react";
import { Link } from "react-router-dom";
import SlidingCompanies from "../../../components/HeroSliding";
import { aboutImages } from "../../../data/AllData";

const coverageCards = [
  {
    title: "Blogs & Articles",
    category: "KNOWLEDGE & INSIGHTS",
    description:
      "Explore informative articles, digital trends, technology updates, and practical insights to stay informed about the latest developments.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyDl4H-H-nJCe05vMbS0Gs96Eecd16LmohwwNBc1YXRA&s=10",
    link: "/articles",
    number: "01",
  },
  {
    title: "SEO Solutions",
    category: "SEARCH & GROWTH",
    description:
      "Discover SEO strategies, keyword research, search engine updates, and practical techniques to improve online visibility.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5YmwQpTIIgfMx7iyzsh4qemvcLo58AIMDzZttemlAog&s=10",
    link: "/articles",
    number: "02",
  },
  {
    title: "Business Insights",
    category: "BUSINESS & STRATEGY",
    description:
      "Learn about entrepreneurship, business strategies, market trends, leadership, and ideas that support informed decisions.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT91UBcczoANEU92vbPVuQKeDGRqsa4da2EVlgEegrtXw&s=10",
    link: "/articles",
    number: "03",
  },
  {
    title: "Companies & Brands",
    category: "COMPANY PROFILES",
    description:
      "Explore company profiles, brand stories, industry developments, business backgrounds, and the people behind leading organizations.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXXi3qXv8Pr_RkB2ZCvJ-hnE3ZxGROOjXOX6DDRT5lJg&s=10",
    link: "/companies",
    number: "04",
  },
];

const headingClass =
  "text-2xl font-bold leading-snug tracking-tight text-stone-900 sm:text-3xl";

const paragraphClass =
  "text-base leading-7 text-stone-600";

const eyebrowClass =
  "text-xs font-semibold uppercase tracking-[0.16em] text-amber-700";

const buttonClass =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition duration-300";

export default function About() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-stone-800">

     
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden sm:min-h-[460px]">
        <img
          src={aboutImages.heroBg}
          alt="Market Hub digital insights"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/75 to-stone-950/60" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Welcome to Market Hub
          </span>

          <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Insights That Inspire.
            <span className="mt-1 block text-amber-400">
              Knowledge That Empowers.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-200">
            Your destination for digital marketing, SEO, business insights,
            technology updates, and company profiles. Discover meaningful
            knowledge that helps you understand the changing digital world.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/articles"
              className={`${buttonClass} bg-amber-500 text-stone-950 shadow-md hover:-translate-y-0.5 hover:bg-amber-400`}
            >
              Explore Articles <span className="ml-2">→</span>
            </Link>

            <a
              href="#our-story"
              className={`${buttonClass} border border-white/40 text-white hover:border-amber-400 hover:bg-white/10`}
            >
              Discover Our Story
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-600 via-amber-300 to-orange-500" />
      </section>


      <section className="border-b border-stone-100 bg-stone-50 py-6">
        <div className="mx-auto mb-4 max-w-7xl px-5 text-center">
          <p className={eyebrowClass}>
            Discover Leading Companies
          </p>
        </div>

        <SlidingCompanies />
      </section>


<section
  id="our-story"
  className="relative overflow-hidden border-y border-amber-100/80 bg-gradient-to-br from-[#FFFCF5] via-white to-[#FFF7E8] px-5 py-14 sm:px-8 sm:py-16 lg:py-20"
>

  <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
  <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl" />

  <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
    <div className="relative mx-auto w-full max-w-xl pb-5 pr-3">

      <div className="absolute -left-2 -top-2 h-20 w-20 rounded-tl-2xl border-l-2 border-t-2 border-amber-500 sm:-left-3 sm:-top-3" />
      <div className="absolute -bottom-0 right-0 h-20 w-20 rounded-br-2xl border-b-2 border-r-2 border-amber-400" />

      <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-1.5 shadow-[0_15px_45px_rgba(120,80,20,0.10)]">
        <img
          src={aboutImages.storyBanner}
          alt="Market Hub connecting people through digital knowledge"
          loading="lazy"
          className="aspect-[5/4] w-full rounded-xl object-cover transition-transform duration-700 hover:scale-[1.03]"
        />


        <div className="pointer-events-none absolute inset-x-2 bottom-2 h-20 rounded-b-xl bg-gradient-to-t from-stone-950/20 to-transparent" />
      </div>


      <div className="absolute -bottom-1 right-0 max-w-[90%] rounded-xl border border-amber-100 bg-white/95 px-4 py-3 shadow-[0_8px_25px_rgba(60,40,10,0.10)] backdrop-blur-sm sm:right-5 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"
              />
              <circle cx="12" cy="12" r="5" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-stone-900">
              Knowledge. Clarity. Growth.
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              The values behind Market Hub
            </p>
          </div>
        </div>
      </div>
    </div>


    <div className="pt-4 lg:pt-0">


      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        About Our Platform
      </span>

      <h2 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-stone-900 sm:text-3xl">
        Bringing the Digital World Closer to You
      </h2>

      <div className="mt-4 flex items-center gap-2">
        <span className="h-1 w-12 rounded-full bg-amber-500" />
        <span className="h-1 w-4 rounded-full bg-orange-300" />
      </div>

      <p className="mt-5 text-sm leading-7 text-stone-600 sm:text-base">
        Market Hub is a knowledge-driven platform that makes digital
        marketing, technology, business developments, and company
        information easier to discover and understand.
      </p>

      <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
        From practical articles and SEO insights to business resources
        and company profiles, we bring valuable information together
        in one place. Our goal is to help readers explore new ideas
        and keep pace with a changing digital landscape.
      </p>

      <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
        Whether you want to understand a brand, learn about search
        optimization, or discover emerging industry trends, Market Hub
        makes your journey towards knowledge simpler and more engaging.
      </p>

  
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { title: "Discover", subtitle: "New Ideas" },
          { title: "Understand", subtitle: "Key Insights" },
          { title: "Grow", subtitle: "Your Knowledge" },
        ].map((value) => (
          <div
            key={value.title}
            className="rounded-xl border border-amber-100 bg-white/80 px-2 py-3 text-center shadow-sm transition duration-300 hover:border-amber-300 hover:bg-amber-50/70 sm:px-3"
          >
            <p className="text-xs font-bold text-stone-900 sm:text-sm">
              {value.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              {value.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <Link
          to="/articles"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-stone-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-amber-500 hover:text-stone-950 hover:shadow-amber-500/20"
        >
          Explore Our Articles
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  </div>
</section>



<section
  id="what-we-cover"
  className="relative isolate overflow-hidden border-y border-[#E7E0D8] bg-[#F7F5F1] px-5 py-14 sm:px-8 sm:py-16 lg:py-20"
>

  <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#E8B99A]/20 blur-3xl" />
  <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#D7DCE8]/50 blur-3xl" />

  <div className="relative mx-auto max-w-7xl">


    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12 lg:mb-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-[#E8C7B2] bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A6502C] shadow-sm sm:text-xs">
        <span className="h-2 w-2 rounded-full bg-[#C56A3D]" />
        Explore Our Expertise
      </span>

      <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#172B45] sm:text-4xl">
        What We Cover
        <span className="mt-1 block text-[#B7633D]">
          Knowledge That Moves You Forward
        </span>
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#667085] sm:text-base">
        Explore useful resources across digital marketing, search
        optimization, business knowledge, and company research—all
        in one convenient place.
      </p>

      <div className="mt-5 flex items-center justify-center gap-2">
        <span className="h-1 w-9 rounded-full bg-[#B7633D]" />
        <span className="h-1 w-2 rounded-full bg-[#E2B79D]" />
        <span className="h-1 w-1 rounded-full bg-[#D6DCE5]" />
      </div>
    </div>


    <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {coverageCards.map((card) => (
        <article
          key={card.number}
          className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#E5E0D9] bg-white shadow-[0_5px_20px_rgba(23,43,69,0.045)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D5A184] hover:shadow-[0_18px_38px_rgba(23,43,69,0.11)]"
        >

          <div className="relative overflow-hidden bg-[#E9E7E2]">
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

  
            <div className="absolute inset-0 bg-gradient-to-t from-[#101C2D]/80 via-[#101C2D]/5 to-transparent" />

     
            <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/50 bg-[#FFFCF8]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#344054] shadow-sm sm:text-[10px]">
              {card.category}
            </span>


            <div className="absolute bottom-3 right-4 flex items-center gap-2">
              <span className="h-px w-5 bg-[#E6B18F]" />
              <span className="font-serif text-2xl font-bold text-white drop-shadow sm:text-3xl">
                {card.number}
              </span>
            </div>
          </div>


          <div className="flex flex-1 flex-col p-5 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C56A3D]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#A36A50]">
                Knowledge & Insights
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug text-[#172B45] transition-colors duration-300 group-hover:text-[#A6502C] sm:text-lg">
              {card.title}
            </h3>

            <p className="mt-3 flex-1 text-sm leading-6 text-[#667085]">
              {card.description}
            </p>

   
            <div className="mt-5 border-t border-[#EEEAE5] pt-4">
              <Link
                to={card.link}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#263A56] transition-all duration-300 hover:gap-3 hover:text-[#B7633D]"
              >
                Explore More
                <span
                  aria-hidden="true"
                  className="text-lg leading-none"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

    
          <div className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#A6502C] via-[#D99A75] to-[#E9D2C2] transition-transform duration-300 group-hover:scale-x-100" />
        </article>
      ))}
    </div>
  </div>
</section>


<section className="bg-[#F5F4F0] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
  <div className="mx-auto max-w-7xl">
    <div className="overflow-hidden rounded-2xl border border-[#E5E2DA] bg-white shadow-[0_15px_45px_rgba(23,36,61,0.07)]">
      <div className="grid lg:grid-cols-2">

   
        <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8753D]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C65D2D] sm:text-[11px]">
              Our Mission
            </span>
          </div>

          <h2 className="mt-5 max-w-lg text-[27px] font-extrabold leading-[1.2] tracking-tight text-[#192640] sm:text-[32px] lg:text-[34px] xl:text-[38px]">
            Making Knowledge
            <span className="block">More Accessible,</span>
            <span className="mt-1 block text-[#E8753D]">
              One Insight at a Time.
            </span>
          </h2>

          <div className="mt-4 flex items-center gap-2">
            <span className="h-1 w-10 rounded-full bg-[#E8753D]" />
            <span className="h-1 w-3.5 rounded-full bg-[#F4C7AE]" />
          </div>

          <p className="mt-5 max-w-lg text-[13px] leading-6 text-[#626B7B] sm:text-sm sm:leading-7">
            We believe the right information can open new opportunities.
            Market Hub connects readers with valuable ideas, reliable
            resources, and fresh perspectives across the digital and
            business landscape.
          </p>

          <div className="mt-6">
            <Link
              to="/articles"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-[#192640] px-5 py-3 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8753D] sm:text-[13px]"
            >
              Read Our Latest Articles
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-3 border-t border-[#ECE9E2] pt-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0E6] text-[#E8753D]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.42 1.42" />
                <path d="m17.65 17.65 1.42 1.42" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m4.93 19.07 1.42-1.42" />
                <path d="m17.65 6.35 1.42-1.42" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-bold text-[#192640] sm:text-[13px]">
                Discover. Understand. Grow.
              </p>
              <p className="mt-0.5 text-[11px] text-[#7B8290]">
                Knowledge that moves you forward.
              </p>
            </div>
          </div>
        </div>


        <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#E8EAF0] sm:min-h-[380px] lg:min-h-full">

          <img
            src="https://blogs-images.forbes.com/insights-microsoftai/files/2019/02/GettyImages-921518908-1200x800.jpg"
            alt="People collaborating and sharing ideas"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />

  
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#192640]/10 via-transparent to-[#192640]/25" />


          <div className="absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5 lg:inset-x-5 lg:bottom-5">
            <div className="rounded-xl border border-white/20 bg-[#192640]/90 p-3.5 shadow-xl backdrop-blur-md sm:p-4 lg:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8753D] text-white sm:h-11 sm:w-11">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14a6 6 0 1 0-6.18 0c.53.35.91.96.91 1.59V17h4.36v-1.41c0-.63.38-1.24.91-1.59Z" />
                    <path d="M12 2v1" />
                    <path d="M4.93 4.93l.71.71" />
                    <path d="M2 12h1" />
                    <path d="M21 12h1" />
                    <path d="m18.36 5.64.71-.71" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#F4A780] sm:text-[10px]">
                    Learn Something New
                  </p>

                  <h3 className="mt-1.5 text-base font-bold leading-snug text-white sm:text-lg">
                    From Knowledge
                    <span className="block text-[#F4A780]">
                      to Wisdom.
                    </span>
                  </h3>

                  <p className="mt-1.5 text-[11px] leading-5 text-white/80 sm:text-xs">
                    Fresh perspectives. Meaningful insights. Better decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</section>


    </main>
  );
}
