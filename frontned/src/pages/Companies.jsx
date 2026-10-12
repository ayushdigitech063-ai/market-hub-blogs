import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Sparkles, TrendingUp, Globe2 } from 'lucide-react';

const HERO_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUBi4f2-W_fsawEy1mqYQCZN7A0On8Pg0_RO3Sn-q0uQ&s=10";

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
    fetch('http://localhost:5000/api/companies')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch companies');
        return res.json();
      })
      .then((data) => setCompaniesData(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching companies:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % FEATURE_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = FEATURE_SLIDES[activeSlide];
  const theme = SLIDE_THEMES[slide.theme];

  const goToSlide = (index) => setActiveSlide(index);
  const previousSlide = () =>
    setActiveSlide((current) => (current - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  const nextSlide = () =>
    setActiveSlide((current) => (current + 1) % FEATURE_SLIDES.length);

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-slate-900">
  
{/* HERO BANNER */}
<section className="relative isolate overflow-hidden border-b border-[#E5D8B7] bg-[#171A20] text-white">
  <img
    src={HERO_IMAGE}
    alt="Global companies and business innovation"
    className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.58] saturate-[0.85]"
  />

  {/* Gradient Overlays */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#101820]/95 via-[#101820]/80 to-[#101820]/45" />
  <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/70 via-transparent to-[#101820]/20" />

  <div className="relative mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-11 lg:px-12 lg:py-14">
    <div className="max-w-3xl">

      {/* Badge */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3C477]/40 bg-[#211E17]/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#F4D78E] backdrop-blur-md sm:text-xs">
        <Sparkles className="h-3.5 w-3.5" />
        Global brands · Company insights
      </div>

      {/* Heading */}
      <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        Explore the world’s
        <span className="mt-1 block bg-gradient-to-r from-[#F5D98F] via-[#DDB65D] to-[#FFF0C2] bg-clip-text text-transparent">
          leading companies
        </span>
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
        Discover company stories, technology updates, business moves, and expert
        insights—all in one place.
      </p>

      {/* Buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href="#companies-list"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D5AB50] to-[#F0D58C] px-5 py-2.5 text-xs font-bold text-[#241B0B] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:brightness-105 sm:text-sm"
        >
          Browse companies
          <ArrowRight className="h-4 w-4" />
        </a>

        <span className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-white/90 backdrop-blur-md sm:text-sm">
          <Building2 className="h-4 w-4 text-[#F0D58C]" />
          <strong className="text-[#F0D58C]">
            {companiesData.length}
          </strong>
          companies listed
        </span>
      </div>
    </div>
  </div>

  {/* Bottom Accent Line */}
  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#315D91] via-[#D8AD54] to-[#2F8055]" />
</section>


      {/* FEATURED AUTO-SLIDING STORY CARD */}
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

              {/* Slider controls */}
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

            {/* RIGHT IMAGE */}
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

      {/* KEEP THE EXISTING COMPANY DATA BELOW */}
      <section id="companies-list" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#D8AD54] to-[#A87922]" />
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Featured Companies
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Kisi bhi company par click karke uske exclusive articles dekhein.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Building2 className="h-4 w-4 text-[#A87922]" />
            Company directory
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-[#A87922]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D8AD54] border-t-transparent" />
              Loading companies...
            </div>
          </div>
        ) : companiesData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Building2 className="mx-auto h-9 w-9 text-slate-400" />
            <h3 className="mt-4 font-serif text-xl font-bold text-slate-800">No companies to display yet</h3>
            <p className="mt-2 text-sm text-slate-500">Company entries will appear here once they are available from the API.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companiesData.map((company) => (
              <Link
                key={company.slug}
                to={`/company/${company.slug}`}
                className="group relative flex h-[350px] flex-col justify-end overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D8AD54] hover:shadow-xl hover:shadow-slate-900/10"
              >
                <img
                  src={company.imageURL}
                  alt={company.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1725]/95 via-[#0D1725]/60 to-[#0D1725]/5 transition-opacity duration-300 group-hover:via-[#0D1725]/70" />

                <div className="absolute left-4 top-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800 shadow-sm backdrop-blur-md">
                    <Building2 className="h-3.5 w-3.5 text-[#A87922]" />
                    Company profile
                  </span>
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
                  <h3 className="font-serif text-xl font-bold tracking-tight text-white transition-colors group-hover:text-[#F4D78E]">
                    {company.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-200">
                    {company.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-white">View articles</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0D58C] text-slate-950 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
