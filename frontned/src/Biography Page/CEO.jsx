import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { SOCIAL_ICONS, getSocialLinks } from "../data/Biographysocials.js";
import { apiUrl } from "../api/apiConfig";

const API_URL = apiUrl("/biographies/homepage");
const CACHE_KEY = "biographies_homepage_cache_v2";

const THEME = {
  bar: "bg-[#A87922]",
  dot: "bg-[#D6AC55]",
  text: "text-[#9A6B19]",
  badge: "bg-[#3A2B12]/90 backdrop-blur-md text-[#F4D995] border border-[#C59A42]/40",
  cardHover: "hover:border-[#C59A42]/70 hover:shadow-2xl hover:shadow-[#A87922]/10",
  icon: "bg-[#F8F0DC] text-[#8B641C] hover:bg-[#A87922] hover:text-white",
  arrow: "bg-[#F8F0DC] text-[#8B641C] group-hover/cta:bg-[#A87922] group-hover/cta:text-white",
  viewAll: "border-[#E8D5A5] text-[#805A17] hover:border-[#A87922] hover:bg-[#A87922] hover:text-white",
};


const SECTIONS = [
  {
    key: "business",
    chip: "Business & CEOs",
    heroBtn: "Explore Business",
    title: "Business & CEO Biographies",
    subtitle: "Industry leaders, executives and business icons",
    viewAllTo: "/biography/view-all/ceo",
    viewAllText: "View All Business",
    basePath: "/biography/ceo",
    fallback: { category: "Business", role: "CEO", company: "Corporate" },
  },
  {
    key: "sports",
    chip: "Sports Legends",
    heroBtn: "Sports Legends",
    title: "Sports Legends Biographies",
    subtitle: "World-class athletes, champions and sports icons",
    viewAllTo: "/biography/view-all/sportsperson",
    viewAllText: "View All Sports",
    basePath: "/biography/sports",
    fallback: { category: "Sports", role: "Athlete", company: "International Sports" },
  },
  {
    key: "entrepreneur",
    chip: "Entrepreneurs",
    heroBtn: "Entrepreneurs",
    title: "Entrepreneur Biographies",
    subtitle: "Visionary founders and groundbreaking startup builders",
    viewAllTo: "/biography/view-all/entrepreneur",
    viewAllText: "View All Entrepreneurs",
    basePath: "/biography/entrepreneur",
    fallback: { category: "Entrepreneur", role: "Founder", company: "Startup" },
  },
  {
    key: "actors",
    chip: "Actors",
    heroBtn: "Actors",
    title: "Actors Biographies",
    subtitle: "Celebrated film stars, performers and screen legends",
    viewAllTo: "/biography/view-all/actor",
    viewAllText: "View All Actors",
    basePath: "/biography/actor",
    fallback: { category: "Actors", role: "Actor", company: "Cinema" },
  },
];

const RULES = [
  ["actors", /\b(actors?|actress|bollywood|hollywood|cinema|films?)\b/],
  ["entrepreneur", /\b(entrepreneurs?|founders?|startups?)\b/],
  ["sports", /\b(sports?|sportsperson|cricket(er)?|football(er)?|tennis|athletes?|players?|badminton|hockey)\b/],
  ["business", /\b(ceo|business|chairman|executive|corporate|director|president)\b/],
];

const matchSection = (value) => {
  const text = String(value || "").toLowerCase();
  return RULES.find(([, re]) => re.test(text))?.[0] || "";
};

// Pehle category dekho, na mile to type + role dekho
const getSection = (item = {}) =>
  matchSection(item.category) ||
  matchSection(`${item.type || ""} ${item.role || ""}`);

const cleanText = (v) =>
  String(v || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const optimizeImage = (url, width = 600) =>
  typeof url === "string" &&
  url.includes("res.cloudinary.com") &&
  url.includes("/upload/") &&
  !/\/upload\/(w_|q_)/.test(url)
    ? url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`)
    : url;

const readCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
  
  }
};

const idOf = (item) => String(item._id || item.id || "");

const timeOf = (item) =>
  new Date(item.createdAt || item.updatedAt || 0).getTime() || 0;

function BiographyCard({ item, basePath, fallback }) {
  const links = getSocialLinks(item);
  const icons = SOCIAL_ICONS.filter(({ key }) => links[key]);
  const to = `${basePath}/${item.slug}`;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 ${THEME.cardHover}`}
    >
      <Link to={to} className="flex flex-1 flex-col">
        <div className="relative h-[260px] shrink-0 overflow-hidden bg-stone-100">
          <img
            src={optimizeImage(item.image)}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
          <span
            className={`absolute left-4 top-4 rounded-full px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${THEME.badge}`}
          >
            {item.category || fallback.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pb-3">
          <h3 className={`line-clamp-2 min-h-[3.5rem] font-serif text-xl font-bold leading-7 text-stone-900 transition-colors ${THEME.text}`}>
            {item.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${THEME.text}`}>
              {item.role || fallback.role}
            </span>
            <span className="text-stone-300">•</span>
            <span className="truncate text-xs font-medium text-stone-500">
              {item.company || fallback.company}
            </span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-stone-600">
            {cleanText(item.shortBio || item.description)}
          </p>
        </div>
      </Link>

      <div className="mt-auto px-5 pb-5">
        {icons.length > 0 && (
          <div className="mb-3 flex items-center gap-2 border-t border-stone-100 pt-3">
            {icons.map(({ key, label, Icon }) => (
              <a
                key={key}
                href={links[key]}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={`${item.name} on ${label}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${THEME.icon}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}

        <Link to={to} className="group/cta flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Read full biography
          </span>
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${THEME.arrow}`}>
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
      <div className="h-[260px] animate-pulse bg-stone-200" />
      <div className="space-y-3 p-5">
        {["w-3/4", "w-1/2", "w-full", "w-5/6"].map((w) => (
          <div key={w} className={`h-3 animate-pulse rounded bg-stone-200 ${w}`} />
        ))}
      </div>
    </div>
  );
}

const sectionBg = "bg-gradient-to-b from-[#FBF6E9] via-[#F8F2E3] to-white";
const container = "mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24";
const grid = "grid gap-8 sm:grid-cols-2 lg:grid-cols-3";

function CategorySection({ section, items }) {
  if (!items.length) return null;

  return (
    <section className={sectionBg}>
      <div className={container}>
        <div className="mb-12 flex flex-col justify-between gap-6 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end">
          <div className="flex gap-4">
            <span className={`mt-1.5 h-12 w-1.5 shrink-0 rounded-full ${THEME.bar}`} />
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {section.title}
              </h2>
              <p className="mt-1 text-sm text-stone-500 sm:text-base">{section.subtitle}</p>
            </div>
          </div>

          <Link
            to={section.viewAllTo}
            className={`inline-flex w-fit items-center gap-2 rounded-2xl border bg-white px-6 py-3 text-sm font-bold shadow-sm transition-all duration-300 ${THEME.viewAll}`}
          >
            {section.viewAllText} <span>→</span>
          </Link>
        </div>

        <div className={grid}>
          {items.map((item) => (
            <BiographyCard
              key={idOf(item)}
              item={item}
              basePath={section.basePath}
              fallback={section.fallback}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const chipClass =
  "inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#17243D]/75 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md";
const btnBase =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition duration-300 sm:px-6 sm:py-3";

export default function CEO() {
  const [biographies, setBiographies] = useState(readCache);
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(
      () => setStatus((s) => (s === "loading" ? "slow" : s)),
      4000
    );

    fetch(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected response");
        setBiographies(data);
        setStatus("done");
        writeCache(data);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Error fetching biographies:", err);
        setStatus("error");
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, []);


  const grouped = useMemo(() => {
    const sorted = [...biographies].sort(
      (a, b) => timeOf(b) - timeOf(a) || idOf(b).localeCompare(idOf(a))
    );

    return Object.fromEntries(
      SECTIONS.map(({ key }) => [
        key,
        sorted.filter((item) => getSection(item) === key).slice(0, 3),
      ])
    );
  }, [biographies]);

  const hasData = biographies.length > 0;
  const isLoading = !hasData && (status === "loading" || status === "slow");
  const hasFailed = !hasData && status === "error";

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {/* HERO */}
      <section className="relative isolate w-full overflow-hidden bg-[#17243D] text-white">
        <img
          src="https://venturexindia.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-25-at-15.52.37_f6ea0630-1.jpg"
          alt="Biography of leaders, legends and founders"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-[0.65] contrast-110 saturate-[0.85]"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#17243D]/95 via-[#17243D]/80 to-[#17243D]/35" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#111D32]/65 via-transparent to-[#111D32]/20" />

        <div className="mx-auto flex min-h-[360px] w-full max-w-[1600px] items-center px-5 py-10 sm:min-h-[400px] sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-14 lg:py-14 xl:min-h-[460px] xl:px-16">
          <div className="w-full max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
              {SECTIONS.map(({ key, chip }) => (
                <span key={key} className={chipClass}>
                  <span className={`h-2 w-2 rounded-full ${THEME.dot}`} />
                  {chip}
                </span>
              ))}
            </div>

            <h1 className="max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-[2.7rem]">
              Stories of{" "}
              <span className="bg-gradient-to-r from-[#F0D48A] via-[#D7A943] to-[#FFF0BD] bg-clip-text text-transparent">
                Leaders, Legends
              </span>{" "}
              & Founders
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
              Explore complete biographies, career journeys, defining achievements
              and leadership philosophies of influential business tycoons, sports
              champions, visionary startup founders and celebrated actors.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
              {SECTIONS.map(({ key, heroBtn, viewAllTo }, i) => (
                <Link
                  key={key}
                  to={viewAllTo}
                  className={`${btnBase} ${
                    i === 0
                      ? "bg-[#E47742] hover:-translate-y-0.5 hover:bg-[#CF6332]"
                      : "border border-white/35 bg-white/10 backdrop-blur-md hover:bg-white hover:text-[#17243D]"
                  }`}
                >
                  {heroBtn}
                  {i === 0 && <span aria-hidden="true">→</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 h-1 bg-gradient-to-r from-[#A87922] via-[#F0D48A] to-[#A87922]" />
      </section>


      {isLoading && (
        <section className={sectionBg}>
          <div className={container}>
            {status === "slow" && (
              <p className="mb-6 text-sm text-stone-500">
                The server is starting up. This may take a little while..
              </p>
            )}
            <div className={grid}>
              {[1, 2, 3].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          </div>
        </section>
      )}

      {hasFailed && (
        <p className="mx-auto max-w-7xl px-5 py-24 text-center text-base text-stone-600">
          Biographies could not be loaded. Please refresh the page and try again.
        </p>
      )}


      {hasData &&
        SECTIONS.map((section) => (
          <CategorySection key={section.key} section={section} items={grouped[section.key]} />
        ))}
    </main>
  );
}