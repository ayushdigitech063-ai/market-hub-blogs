import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Sparkles, TrendingUp, Globe2 } from 'lucide-react';
import { apiUrl } from "../api/apiConfig";
const HERO_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUBi4f2-W_fsawEy1mqYQCZN7A0On8Pg0_RO3Sn-q0uQ&s=10";


const cleanDesc = (s) => String(s || '').replace(/<!--COMPANY_PACK:[\s\S]*?-->/, '').trim();

const FEATURE_SLIDES = [
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc2qjuBgoxWRwDz6hfuA9yf4uNDTBfDDL23eVOb556pw&s=10",
    eyebrow: "Technology & Innovation",
    title: "The ideas shaping tomorrow",
    description:
      "Discover the latest stories, innovations, and insights from the world's most influential technology companies.",
    theme: "blue",
    label: "Explore technology",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXyJJD47N6wZSjEGRyJMGQACV1REUDzYisrZekbxytLg&s=10",
    eyebrow: "Business & Leadership",
    title: "Big brands. Bold moves.",
    description:
      "Stay informed about business growth, market moves, leadership decisions, and the companies making headlines.",
    theme: "gold",
    label: "Explore business",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt85geJcVbA9JZ_J9m0xuFcl_OTVic0c0hOtxFUfiEBg&s=10",
    eyebrow: "Growth & Sustainability",
    title: "Meet the brands building a better future",
    description:
      "Explore company stories, emerging ideas, and the people building more sustainable businesses.",
    theme: "green",
    label: "Explore companies",
  },
];

const SLIDE_THEMES = {
  blue: {
    panel: "bg-gradient-to-br from-[#EAF3FF] via-[#DCEAFF] to-[#C8DDF8]",
    eyebrow: "text-[#315D91]",
    heading: "text-[#132D4E]",
    copy: "text-[#3E5876]",
    button: "bg-[#214F86] hover:bg-[#173D6B] text-white",
    dot: "bg-[#315D91]",
    ring: "ring-[#7BA9E2]",
  },
  gold: {
    panel: "bg-gradient-to-br from-[#FFF5DD] via-[#FCE8BC] to-[#F6DCA0]",
    eyebrow: "text-[#9A6418]",
    heading: "text-[#4D3210]",
    copy: "text-[#75572D]",
    button: "bg-[#A96E17] hover:bg-[#87530E] text-white",
    dot: "bg-[#B67A1E]",
    ring: "ring-[#D9AD55]",
  },
  green: {
    panel: "bg-gradient-to-br from-[#E8F5EC] via-[#D9EEDF] to-[#C3E1CD]",
    eyebrow: "text-[#2C714C]",
    heading: "text-[#153E2A]",
    copy: "text-[#3F6850]",
    button: "bg-[#276846] hover:bg-[#1C5035] text-white",
    dot: "bg-[#2F8055]",
    ring: "ring-[#78B58E]",
  },
};
export default function Companies() {
  const [companiesData, setCompaniesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetch(apiUrl("/companies"))
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch companies");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setCompaniesData(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error fetching companies:", err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide(
        (current) => (current + 1) % FEATURE_SLIDES.length
      );
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = FEATURE_SLIDES[activeSlide];
  const theme = SLIDE_THEMES[slide.theme];

  const goToSlide = (index) => setActiveSlide(index);

  const previousSlide = () =>
    setActiveSlide(
      (current) =>
        (current - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length
    );

  const nextSlide = () =>
    setActiveSlide(
      (current) => (current + 1) % FEATURE_SLIDES.length
    );

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-slate-900">

<section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">

  <img
    src={HERO_IMAGE}
    alt="Global companies and business innovation"
    className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-[0.85]"
  />


  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />
  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111D32]/60 via-transparent to-[#111D32]/20" />


  <div className="mx-auto flex min-h-[390px] w-full max-w-[1600px] items-center px-5 py-12 sm:min-h-[430px] sm:px-8 sm:py-14 lg:min-h-[460px] lg:px-14 lg:py-16 xl:min-h-[480px] xl:px-16">
    <div className="w-full max-w-3xl">

 
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/95 backdrop-blur-md sm:text-xs">
        <Sparkles className="h-4 w-4 shrink-0 text-[#E47742]" />
        Global Brands · Company Insights
      </div>


      <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
        Explore the world’s
        <span className="mt-2 block bg-gradient-to-r from-[#F5D98F] via-[#E8BD70] to-[#FFF0C2] bg-clip-text text-transparent">
          Leading companies
        </span>
      </h1>


      <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:mt-6 sm:text-lg sm:leading-8">
        Discover leading companies, their inspiring stories, latest technology
        updates, business developments, and industry insights—all in one place.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
        <a
          href="#companies-list"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#E47742] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#D76532] sm:text-base"
        >
          Browse Companies
          <ArrowRight className="h-4 w-4" />
        </a>

        <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white/90 backdrop-blur-md sm:text-base">
          <Building2 className="h-5 w-5 shrink-0 text-[#F0D58C]" />
          <strong className="font-bold text-[#F0D58C]">
            {companiesData.length}
          </strong>
          companies listed
        </span>
      </div>

    </div>
  </div>
</section>



      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A87922]">Editor’s spotlight</p>
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Explore what’s shaping business
            </h2>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <TrendingUp className="h-4 w-4 text-[#A87922]" />
            Fresh perspectives, one place
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-[2rem] border border-white shadow-xl shadow-slate-900/10 ring-1 ${theme.ring} transition-colors duration-700`}>
          <div className={`absolute inset-0 ${theme.panel} transition-colors duration-700`} />
          <div className="relative grid min-h-[440px] grid-cols-1 lg:min-h-[430px] lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT CONTENT */}
            <div className="relative z-10 flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-12 xl:px-16">
              <div className={`inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/65 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm ${theme.eyebrow}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {slide.eyebrow}
              </div>
              <h3 key={`${slide.title}-heading`} className={`mt-5 max-w-xl font-serif text-3xl font-bold leading-tight sm:text-4xl xl:text-5xl ${theme.heading}`}>
                {slide.title}
              </h3>
              <p key={`${slide.title}-copy`} className={`mt-4 max-w-lg text-sm leading-7 sm:text-base ${theme.copy}`}>
                {slide.description}
              </p>
              <a
                href="#companies-list"
                className={`mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-md transition duration-300 hover:-translate-y-0.5 ${theme.button}`}
              >
                {slide.label} <ArrowRight className="h-4 w-4" />
              </a>

   
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={previousSlide}
                  aria-label="Previous slide"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-lg shadow-sm transition hover:bg-white ${theme.heading}`}
                >
                  ‹
                </button>
                <div className="flex items-center gap-2" aria-label="Choose featured slide">
                  {FEATURE_SLIDES.map((item, index) => (
                    <button
                      key={item.theme}
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeSlide === index ? `w-8 ${SLIDE_THEMES[item.theme].dot}` : 'w-2.5 bg-slate-400/60 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-lg shadow-sm transition hover:bg-white ${theme.heading}`}
                >
                  ›
                </button>
                <span className={`ml-1 text-xs font-semibold tabular-nums ${theme.eyebrow}`}>
                  0{activeSlide + 1} / 0{FEATURE_SLIDES.length}
                </span>
              </div>
            </div>

      
            <div className="relative min-h-[280px] overflow-hidden lg:min-h-full">
              {FEATURE_SLIDES.map((item, index) => (
                <img
                  key={item.theme}
                  src={item.image}
                  alt={item.eyebrow}
                  className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-1000 ${
                    activeSlide === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-white/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-black/10" />
              <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/35 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
                <Globe2 className="h-4 w-4" />
                Company stories
              </div>
            </div>
          </div>
        </div>
      </section>

    

<section
  id="companies-list"
  className="relative mx-auto max-w-7xl scroll-mt-20 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50/70 px-4 py-8 pb-14 sm:px-6 sm:py-10 lg:px-8 lg:pb-20"
>
  {/* Background Decorations */}
  <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />
  <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />

  <div className="relative z-10">
    {/* Section Header */}
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-sky-200/70 pb-5 sm:flex-row sm:items-end">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-sky-500 to-teal-500" />

        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Featured Companies
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Explore leading brands, discover their stories, and read
            exclusive company insights.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Building2 className="h-4 w-4 text-teal-600" />
        Company Directory
      </div>
    </div>


    {loading ? (
      <div className="py-16 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          Loading companies...
        </div>
      </div>
    ) : companiesData.length === 0 ? (
   
      <div className="rounded-2xl border border-dashed border-sky-200 bg-white/80 px-6 py-14 text-center shadow-sm">
        <Building2 className="mx-auto h-9 w-9 text-sky-500" />

        <h3 className="mt-4 font-serif text-xl font-bold text-slate-800">
          No Companies Available
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Company profiles will appear here when they become available.
          Please check back soon for the latest updates.
        </p>
      </div>
    ) : (

      <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companiesData.map((company) => (
          <Link
            key={company.slug}
            to={`/company/${company.slug}`}
            className="group relative flex h-[350px] flex-col justify-end overflow-hidden rounded-2xl border border-sky-200/70 bg-slate-900 shadow-md shadow-slate-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:border-teal-400 hover:shadow-xl hover:shadow-sky-900/15"
          >

            <img
              src={company.imageURL}
              alt={company.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

  
            <div className="absolute inset-0 bg-gradient-to-t from-[#091827]/95 via-[#102D46]/65 to-[#0F4560]/10 transition-colors duration-500 group-hover:via-[#102D46]/75" />

    
            <div className="absolute left-4 top-4 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800 shadow-sm backdrop-blur-md">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                Company Profile
              </span>
            </div>

          
            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
              <h3 className="font-serif text-xl font-bold leading-snug tracking-tight text-white transition-colors duration-300 group-hover:text-cyan-200">
                {company.name}
              </h3>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-200">
                {cleanDesc(company.description)}
              </p>

          
              <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-white">
                  View Articles
                </span>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-200 text-slate-950 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:shadow-lg">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
</section>

    </main>
  );
}